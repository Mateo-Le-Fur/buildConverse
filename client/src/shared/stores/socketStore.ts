import { defineStore } from "pinia";
import io from "socket.io-client";
import type { Namespace } from "@/shared/interfaces/Namespace";
import type { RoomInterface } from "@/shared/interfaces/Room";
import type { Message } from "@/shared/interfaces/Message";
import type { User } from "@/shared/interfaces/User";
import { initNamespace } from "@/shared/guards";

interface SocketState {
  ioClient: any;
  activeNsSocket: any;
  activeRoom: RoomInterface | null;
  namespaces: Namespace[];
  namespaceSockets: [] | any;
  rooms: RoomInterface[];
  messages: Message[];
  userList: User[];
  isNamespacesLoaded: boolean;
  isNamespaceCreated: boolean | null;
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
    isNamespacesLoaded: false,
    isNamespaceCreated: null,
    count: 0,
    error: null,
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
      this.ioClient = io({
        forceNew: true,
        transports: ["websocket"],
      });

      this.ioClient.on("connect", () => {
        console.log("socket on");
      });
    },

    initNamespaces() {
      // TODO: Utiliser un fetch a la place pour récupérés les données
      this.ioClient.on("namespaces", (data: Namespace[]) => {
        if (!data.length) this.isNamespacesLoaded = true;

        this.namespaces.push(...data);

        for (const ns of this.namespaces) {
          const nsSocket = io(`/${ns.id}`);

          this.initNamespaceData(nsSocket, data.length);

          this.namespaceSockets.push(nsSocket);
        }
      });

      this.ioClient.on("createdNamespace", async (data: Namespace[]) => {
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

      nsSocket.on("userList", (data: User[]) => {
        console.log(data.length);
        this.userList = data;
        // for (let i = 0; i < data.length; i++) {
        //   this.userList.push(data[i]);
        // }
      });

      nsSocket.on("newUserOnServer", (data: User[]) => {
        this.userList.push(...data);
      });

      nsSocket.on("history", (data: Message[]) => {
        this.messages = data;
      });

      nsSocket.on("message", (data: Message) => {
        this.messages.push(data);
      });

      nsSocket.on("deleteRoom", (data: number) => {
        console.log(data);
      });
    },

    joinRoom(room: RoomInterface) {
      this.activeNsSocket.emit("joinRoom", room.id);
      this.activeRoom = room;
    },

    // TODO FAIRE UNE FONCTION joinAfterCreatedNamespace POUR UNE MEILLEUR MAINTENABILITÉ
    joinNamespace(nsSocket: any, roomId: string, channelId: string) {
      this.activeNsSocket = nsSocket;

      const room = this.rooms.find(
        (room: RoomInterface) => room.id === Number(roomId)
      );

      this.joinRoom(room!);

      this.activeNsSocket.emit("getNamespaceUsers", channelId);
    },

    getRoom(namespaceId: string) {
      return this.getNamespaceRooms(namespaceId);
    },

    getUser(namespaceId: string) {
      return this.getUsersNamespace(namespaceId);
    },
  },
});
