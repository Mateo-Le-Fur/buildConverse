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
import { useUser } from "@/shared/stores/authStore";

interface SocketState {
  ioClient: Socket | null;
  opts: Partial<ManagerOptions>;
  activeNsSocket: any;
  activeRoom: RoomInterface | null;
  namespaces: Namespace[];
  namespaceSockets: [] | any;
  rooms: RoomInterface[];
  messages: Message[];
  userList: User[];
  numberOfUsers: number;
  isNamespacesLoaded: boolean;
  isNamespaceCreated: boolean | null;
  isUsersLoaded: boolean;
  count: number;
  error: any;
}

export const useSocket = defineStore("socket", {
  state: (): SocketState => ({
    ioClient: null,
    activeNsSocket: null,
    activeRoom: null,
    namespaceSockets: [],
    namespaces: [],
    rooms: [],
    messages: [],
    userList: [],
    numberOfUsers: 0,
    isNamespacesLoaded: false,
    isNamespaceCreated: null,
    isUsersLoaded: false,
    count: 0,
    error: null,
    opts: { forceNew: true, reconnection: false, transports: ["websocket"] },
  }),

  getters: {
    getRooms(state): RoomInterface[] {
      return state.rooms?.filter(
        (room: RoomInterface) =>
          `/${room.namespace_id}` === state.activeNsSocket?.nsp
      );
    },

    getNamespacesSockets(state) {
      return state.namespaceSockets;
    },

    getNamespaceRooms(state): (namespaceId: string) => RoomInterface[] {
      return (namespaceId: string) =>
        state.rooms.filter(
          (room: RoomInterface) => room.namespace_id.toString() === namespaceId
        );
    },

    getUsersNamespace(state): (namespaceId: string) => User[] {
      return (namespaceId: string) =>
        state.userList.filter(
          (user: User) =>
            user.UserHasNamespace.namespace_id.toString() === namespaceId
        );
    },
    //
    // getAllUser(state): (namespaceId: string) => void {
    //   return (namespaceId: string) =>
    //     state.userList.filter((element: User[]) => {
    //       return element.filter((user: User) => {
    //         return (
    //           user.user_has_namespace.namespace_id.toString() === namespaceId
    //         );
    //       });
    //     });
    // },
  },

  actions: {
    init() {
      this.ioClient = io(this.opts);

      this.ioClient.on("connect", () => {
        console.log("socket on");
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
        console.log(data);
        this.namespaces.push(...data);

        const ns = data[0];

        const nsSocket = io(`/${ns.id}`);

        this.initNamespaceData(nsSocket, data.length);

        this.namespaceSockets.push(nsSocket);

        if (this.activeNsSocket) {
          this.activeNsSocket.emit("leaveRoom", this.activeRoom?.id);
        }

        this.isNamespaceCreated = true;

        // @ts-ignore
        await this.router.push(`/channels/${ns.id}/${ns.rooms[0].id}`);
      });
    },

    initNamespaceData(nsSocket: any, numberOfnamespace: number) {
      this.isNamespacesLoaded = false;
      nsSocket.on("rooms", (data: RoomInterface[]) => {
        this.rooms.push(...data);
        this.count++;

        if (this.count === numberOfnamespace) {
          this.isNamespacesLoaded = true;
          this.count = 0;
        }
      });

      nsSocket.on(
        "userList",
        (data: { users: User[]; numberOfUsers: number }) => {
          this.userList = data.users;
          this.numberOfUsers = data.numberOfUsers;

          this.isUsersLoaded = true;
        }
      );

      nsSocket.on("loadMoreUser", (data: User[]) => {
        console.log(data);
        this.userList.push(...data);
      });

      nsSocket.on("newUserOnServer", (data: User[]) => {
        this.userList.push(...data);
      });

      nsSocket.on("updateUser", async (data: User[]) => {
        console.log(data);
        const userIndex = this.userList.findIndex(
          (user) =>
            user.id === data[0].id &&
            user.UserHasNamespace.namespace_id ===
              data[0].UserHasNamespace.namespace_id
        );

        if (userIndex !== -1) {
          this.userList[userIndex] = data[0];
        }

        const userStore = useUser();
        await userStore.fetchCurrentUser();
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

    joinRoom(room: RoomInterface) {
      this.activeNsSocket.emit("joinRoom", room.id);
      this.activeRoom = room;
    },

    joinNamespace(nsSocket: any, roomId: string, channelId: string) {
      this.activeNsSocket = nsSocket;

      const room = this.rooms.find(
        (room: RoomInterface) => room.id === Number(roomId)
      );

      this.joinRoom(room!);

      /* Je vérifie que l'id du serveur ne corresponde pas à l'id du serveur contenu dans ma liste d'utilisateurs
      si c'est le cas cela veut dire que j'accède au serveur sur lequel j'étais déjà et donc cela m'évite de renvoyer une
      requête au serveur.
       */
      if (
        this.userList[0]?.UserHasNamespace.namespace_id !== Number(channelId)
      ) {
        this.isUsersLoaded = false;

        this.activeNsSocket.emit("getNamespaceUsers", channelId);
      }
    },

    getRoom(namespaceId: string) {
      return this.getNamespaceRooms(namespaceId);
    },

    getUser(namespaceId: string) {
      return this.getUsersNamespace(namespaceId);
    },
  },
});
