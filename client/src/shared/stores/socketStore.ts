import { defineStore } from "pinia";
import io from "socket.io-client";
import type { Namespace } from "@/shared/interfaces/Namespace";
import type { Room } from "@/shared/interfaces/Room";
import type { Message } from "@/shared/interfaces/Message";
import { useRouter } from "vue-router";
import type { User } from "@/shared/interfaces/User";

interface SocketState {
  ioClient: any;
  activeNsSocket: any;
  activeRoom: Room | null;
  namespaces: Namespace[];
  namespaceSockets: [] | any;
  rooms: Room[];
  messages: Message[];
  userList: User[];
  isRoomLoaded: boolean;
  isNamespaceLoaded: boolean;
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
    isRoomLoaded: false,
    isNamespaceLoaded: false,
  }),

  getters: {
    getRooms(state): Room[] {
      return state.rooms?.filter(
        (room: Room) => `/${room.namespace_id}` === state.activeNsSocket?.nsp
      );
    },

    getNamespaces(state) {
      return state.namespaces;
    },
  },

  actions: {
    init() {
      this.ioClient = io();

      this.ioClient.on("connect", () => {
        console.log("socket on");
      });
    },

    initNamespaces() {
      this.ioClient.on("namespaces", (data: []) => {
        console.log(data);
        this.namespaces = data;
        this.isNamespaceLoaded = true;

        for (const ns of this.namespaces) {
          const nsSocket = io(`/${ns.id}`);

          nsSocket.on("rooms", (data) => {
            console.log(data);
            this.rooms.push(...data);

            this.activeRoom = this.rooms[0];
          });

          nsSocket.on("userList", (data) => {
            this.userList.push(data);
          });

          nsSocket.on("history", (data) => {
            console.log(data);
            this.messages = data;
          });

          nsSocket.on("message", (data) => {
            this.messages.unshift(data);
          });

          this.namespaceSockets.push(nsSocket);
        }
      });
    },

    joinRoom(room: Room) {
      this.activeNsSocket.emit("joinRoom", room.id);
      this.activeRoom = room;
    },

    async joinNamespace(nsSocket: any, id: string) {
      // const router = useRouter();
      // if (!nsSocket) return await router.push("/home");

      this.activeNsSocket = nsSocket;

      this.ioClient.emit("joinNamespace", id);

      const firstRoom = this.rooms.find(
        (room: Room) => `/${room.namespace_id}` === nsSocket.nsp
      );

      this.joinRoom(firstRoom!);
    },
  },
});
