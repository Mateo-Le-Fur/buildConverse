import { defineStore } from "pinia";
import {
  io,
  Socket,
  type ManagerOptions,
  type SocketOptions,
} from "socket.io-client";

import type { Namespace } from "@/shared/interfaces/Namespace";
import type { RoomInterface } from "@/shared/interfaces/Room";
import type { Message } from "@/shared/interfaces/Message";
import type { User } from "@/shared/interfaces/User";
import { useRoom } from "@/features/server/stores/roomStore";
import { useNsUser } from "@/features/server/stores/userStore";
import { useUser } from "@/shared/stores/authStore";

interface SocketState {
  ioClient: Socket | null;
  opts: Partial<ManagerOptions>;
  activeNsSocket: any;
  namespaces: Namespace[];
  namespaceSockets: [] | any;
  messages: Message[];
  isNamespacesLoaded: boolean;
  isNamespaceCreated: boolean | null;
  countLoadedNamespace: number;
  error: any;
}

export const useSocket = defineStore("socket", {
  state: (): SocketState => ({
    ioClient: null,
    activeNsSocket: null,
    namespaceSockets: [],
    namespaces: [],
    messages: [],
    isNamespacesLoaded: false,
    isNamespaceCreated: null,
    countLoadedNamespace: 0,
    error: null,
    opts: { forceNew: true, reconnection: false, transports: ["websocket"] },
  }),

  actions: {
    init() {
      this.ioClient = io(this.opts);

      this.ioClient.on("connect", () => {
        console.log("socket on");
      });

      this.ioClient.on("updateUser", async (data: User) => {
        const userStore = useUser();
        await userStore.fetchCurrentUser();
      });

      this.ioClient.on("connect_error", (err) => {
        console.log(err.message);
      });
    },

    initNamespaces() {
      // TODO: Utiliser un fetch a la place pour récupérés les données
      this.ioClient?.on("namespaces", (data: Namespace[]) => {
        if (!data.length) this.isNamespacesLoaded = true;

        this.namespaces.push(...data);

        for (const ns of this.namespaces) {
          const nsSocket = io(`/${ns.id}`);

          this.initNamespaceData(nsSocket, data.length);

          this.namespaceSockets.push(nsSocket);
        }
      });

      this.ioClient?.on("createdNamespace", async (data: Namespace[]) => {
        const roomStore = useRoom();

        this.namespaces.push(...data);

        const ns = data[0];

        const nsSocket = io(`/${ns.id}`);

        this.initNamespaceData(nsSocket, data.length);

        this.namespaceSockets.push(nsSocket);

        if (this.activeNsSocket) {
          this.activeNsSocket.emit("leaveRoom", roomStore.activeRoom?.id);
        }

        this.isNamespaceCreated = true;

        // @ts-ignore
        await this.router.push(`/channels/${ns.id}/${ns.rooms[0].id}`);
      });
    },

    initNamespaceData(nsSocket: any, numberOfnamespace: number) {
      const roomStore = useRoom();
      const userNsStore = useNsUser();

      this.isNamespacesLoaded = false;
      nsSocket.on("rooms", (data: RoomInterface[]) => {
        roomStore.getRoomsData(data);

        this.countLoadedNamespace++;

        if (this.countLoadedNamespace === numberOfnamespace) {
          this.isNamespacesLoaded = true;
          this.countLoadedNamespace = 0;
        }
      });

      nsSocket.on(
        "userList",
        (data: { users: User[]; numberOfUsers: number }) => {
          userNsStore.getUsersData(data);
        }
      );

      nsSocket.on("loadMoreUser", (data: User[]) => {
        userNsStore.loadMoreUser(data);
      });

      nsSocket.on("updateUser", async (data: User) => {
        await userNsStore.updateUser(data);
      });

      nsSocket.on("deleteUser", async (data: { id: number }) => {
        await userNsStore.deleteUser(data);
      });

      nsSocket.on("newUserOnServer", (data: User[]) => {
        userNsStore.addNewUser(data);
      });

      nsSocket.on("history", (data: Message[]) => {
        this.messages = data;
      });

      nsSocket.on("message", (data: Message) => {
        this.messages.push(data);
      });

      nsSocket.on("deleteRoom", (data: number) => {
        // TODO A finir après avoir fait le crud utilisateur
        console.log(data);
      });

      nsSocket.on("connect_error", (err: Error) => {
        console.log(err.message);
      });
    },

    joinNamespace(nsSocket: any, roomId: string, channelId: string) {
      const roomStore = useRoom();
      const userNsStore = useNsUser();

      this.activeNsSocket = nsSocket;

      const room = roomStore.findRoom(roomId);

      roomStore.joinRoom(room);

      /* Je vérifie que l'id du serveur ne corresponde pas à l'id du serveur contenu dans ma liste d'utilisateurs
      si c'est le cas cela veut dire que j'accède au serveur sur lequel j'étais déjà et donc cela m'évite de renvoyer une
      requête au serveur.
       */
      if (
        userNsStore.userList[0]?.UserHasNamespace.namespace_id !==
        Number(channelId)
      ) {
        userNsStore.isUsersLoaded = false;

        this.activeNsSocket.emit("getNamespaceUsers", channelId);
      }
    },
  },
});
