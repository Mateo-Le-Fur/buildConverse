import { defineStore } from "pinia";
import io from "socket.io-client";
import type { Namespace } from "@/shared/interfaces/Namespace";
import type { RoomInterface } from "@/shared/interfaces/Room";
import type { Message } from "@/shared/interfaces/Message";
import type { User } from "@/shared/interfaces/User";

interface SocketState {
  ioClient: any;
  activeNsSocket: any;
  activeRoom: RoomInterface | null;
  namespaces: Namespace[];
  namespaceSockets: [] | any;
  rooms: RoomInterface[];
  messages: Message[];
  userList: User[];
  isFirstRoomLoaded: boolean;
  isNamespaceLoaded: boolean;
  initSocket: boolean;
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
    isFirstRoomLoaded: false,
    isNamespaceLoaded: false,
    initSocket: false,
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
  },

  actions: {
    init() {
      this.ioClient = io({
        forceNew: true,
      });

      this.ioClient.on("connect", () => {
        console.log("socket on");
      });
    },

    initNamespaces() {
      this.ioClient.on("namespaces", (data: []) => {
        this.namespaces.push(...data);
        this.isNamespaceLoaded = true;

        for (const ns of this.namespaces) {
          const nsSocket = io(`/${ns.id}`);

          this.initNamespaceData(nsSocket);

          this.namespaceSockets.push(nsSocket);
        }
      });

      this.ioClient.on("createdNamespace", (data: []) => {
        console.log(data);

        this.namespaces.push(...data);

        const ns = data[0];

        console.log(ns);

        const nsSocket = io(`/${ns.id}`);

        this.initNamespaceData(nsSocket);

        this.namespaceSockets.push(nsSocket);
      });
    },

    initNamespaceData(nsSocket: any) {
      nsSocket.on("rooms", (data: RoomInterface[]) => {
        console.log(data);
        this.rooms.push(...data);
      });

      nsSocket.on("userList", (data: User) => {
        this.userList.push(data);
      });

      nsSocket.on("history", (data: Message[]) => {
        this.messages = data;
      });

      nsSocket.on("message", (data: Message) => {
        this.messages.unshift(data);
      });
    },

    joinRoom(room: RoomInterface) {
      this.activeNsSocket.emit("joinRoom", room.id);
      this.activeRoom = room;
    },

    async joinNamespace(nsSocket: any, id: string) {
      // const router = useRouter();
      // if (!nsSocket) return await router.push("/home");

      this.activeNsSocket = nsSocket;

      const firstRoom = this.rooms.find(
        (room: RoomInterface) => `/${room.namespace_id}` === nsSocket.nsp
      );

      this.joinRoom(firstRoom!);
    },

    getRoom(namespaceId: string) {
      return this.getNamespaceRooms(namespaceId);
    },
  },
});
