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
import { useNsUser } from "@/features/server/stores/userNsStore";
import { useUser } from "@/shared/stores/authStore";
import { date } from "zod";
import type { UserHasNamespace } from "@/shared/interfaces/UserHasNamespace";

interface SocketState {
  ioClient: Socket | null;
  opts: Partial<ManagerOptions>;
  activeNsSocket: any;
  namespaces: Namespace[];
  namespaceSockets: [] | any;
  messages: Message[];
  isNamespacesLoaded: boolean;
  isNamespaceCreated: boolean | null;
  isNamespaceUpdated: boolean;
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
    isNamespaceUpdated: false,
    countLoadedNamespace: 0,
    error: null,
    opts: { forceNew: true, reconnection: false, transports: ["websocket"] },
  }),

  getters: {
    currentNamespace(state): (namespaceId: string) => Namespace | undefined {
      return (namespaceId: string) =>
        state.namespaces.find((ns: Namespace) => ns.id === Number(namespaceId));
    },
  },

  actions: {
    init() {
      this.ioClient = io(this.opts);
      const userNsStore = useNsUser();

      let checkInterval: number;
      this.ioClient.on("connect", () => {
        console.log("socket on");

        checkInterval = setInterval(() => {
          this.ioClient?.emit("jwt_expire", () => "check");
        }, 1000 * 60 * 10);
      });

      this.ioClient?.on("connect_error", (err) => {
        console.log(err.message);
      });

      this.ioClient?.on("updateUser", async (data: User) => {
        await userNsStore.updateUser(data);
      });

      this.ioClient?.on("deleteUser", async (data: { id: number }) => {
        userNsStore.deleteUser(data);
      });

      this.ioClient?.on("jwt_expire", async (data: boolean) => {
        if (data) {
          clearInterval(checkInterval);
          const userStore = useUser();
          await userStore.logout();
        }
      });
    },

    initNamespaces() {
      this.ioClient?.on("namespaces", (data: Namespace[]) => {
        console.log(data);
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
        userNsStore.deleteUser(data);
      });

      nsSocket.on("userConnect", async (data: { id: number }) => {
        const userNsStore = useNsUser();
        userNsStore.userConnect(data);
      });

      nsSocket.on("userDisconnect", async (data: { id: number }) => {
        const userNsStore = useNsUser();

        userNsStore.userDisconnect(data);
      });

      nsSocket.on("userJoinNamespace", (data: User[]) => {
        userNsStore.addNewUser(data);
      });

      nsSocket.on("userLeaveNamespace", async (data: { id: number }) => {
        await this.userLeaveNamespace(data);
      });

      nsSocket.on("history", (data: Message[]) => {
        this.messages = data;
      });

      nsSocket.on("message", (data: Message) => {
        this.messages.push(data);
      });

      nsSocket.on("createRoom", async (data: RoomInterface) => {
        roomStore.createRoom(data);
      });

      nsSocket.on("updateRoom", async (data: RoomInterface) => {
        roomStore.updateRoom(data);
      });

      nsSocket.on("deleteRoom", (data: Partial<RoomInterface>) => {
        roomStore.deleteRoom(data);
      });

      nsSocket.on("updateNamespace", async (data: Namespace) => {
        await this.updateNamespace(data);
      });

      nsSocket.on("deleteNamespace", async (data: { id: number }) => {
        await this.deleteNamespace(data);
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

    async userLeaveNamespace(data: { id: number }) {
      const userNsStore = useNsUser();
      userNsStore.userList = userNsStore.userList.filter(
        (user) => user.id !== data.id
      );
    },

    async deleteNamespace(data: { id: number }) {
      const roomStore = useRoom();
      const userNsStore = useNsUser();

      roomStore.rooms = roomStore.rooms.filter(
        (room) => room.namespace_id !== data.id
      );

      userNsStore.userList = userNsStore.userList.filter(
        (user) => user.UserHasNamespace.namespace_id !== data.id
      );

      const namespaceIndex = this.namespaces.findIndex(
        (ns) => ns.id === data.id
      );

      const namespaceSocketIndex = this.namespaceSockets.findIndex(
        (ns: any) => ns.nsp === `/${data.id}`
      );

      const namespaceSocket = this.namespaceSockets.find(
        (nsSocket: any) => nsSocket.nsp === `/${data.id}`
      );

      namespaceSocket.disconnect();

      if (namespaceIndex !== -1) {
        this.namespaces.splice(namespaceIndex, 1);
      }

      if (namespaceSocketIndex !== -1) {
        this.namespaceSockets.splice(namespaceSocketIndex, 1);
      }
      // @ts-ignore
      await this.router.push("/home");
    },

    async updateNamespace(data: Namespace) {
      this.isNamespaceUpdated = true;

      const { UserHasNamespace } = this.namespaces.find(
        (ns) => ns.id === data.id
      )!;

      const namespaceIndex = this.namespaces.findIndex(
        (ns) => ns.id === data.id
      );

      this.namespaces[namespaceIndex] = data;

      this.namespaces[namespaceIndex].UserHasNamespace = UserHasNamespace;
    },

    setError(message: string) {
      this.error = message;
      setTimeout(() => {
        this.error = null;
      }, 2000);
    },
  },
});
