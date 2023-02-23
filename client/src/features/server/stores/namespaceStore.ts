import { defineStore } from "pinia";
import type { Namespace } from "@/shared/interfaces/Namespace";
import type { Socket } from "socket.io-client";
import { useSocket } from "@/shared/stores/socketStore";
import { useRoom } from "@/features/server/stores/roomStore";
import { useNsUser } from "@/features/server/stores/userNsStore";

interface NamespaceState {
  namespaces: Namespace[];
  activeNamespace: Namespace | null;
  isNamespacesLoaded: boolean;
  creatingNamespace: boolean;
  isNamespaceUpdated: boolean;
}

export const useNamespace = defineStore("namespace", {
  state: (): NamespaceState => ({
    namespaces: [],
    activeNamespace: null,
    isNamespacesLoaded: false,
    creatingNamespace: false,
    isNamespaceUpdated: false,
  }),

  getters: {
    currentNamespace(state): (namespaceId: string) => Namespace | undefined {
      return (namespaceId: string) =>
        state.namespaces.find((ns: Namespace) => ns.id === Number(namespaceId));
    },
  },

  actions: {
    init(data: Namespace[]) {
      const roomStore = useRoom();

      if (!data.length) return (this.isNamespacesLoaded = true);

      this.namespaces.push(...data);

      data.forEach((namespace) => {
        namespace.rooms.forEach((room) => roomStore.getRoomsData(room));
      });

      this.isNamespacesLoaded = true;
    },

    createNamespace(data: Namespace) {
      const roomStore = useRoom();

      this.namespaces.push(data);

      data.rooms.forEach((room) => {
        roomStore.getRoomsData(room);
      });

      this.creatingNamespace = false;
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

    async deleteNamespace(data: { id: number }) {
      const roomStore = useRoom();
      const userNsStore = useNsUser();
      const socketStore = useSocket();

      roomStore.activeRoom = null;

      roomStore.rooms = roomStore.rooms.filter(
        (room) => room.namespaceId !== data.id
      );

      userNsStore.userList = userNsStore.userList.filter(
        (user) => user.UserHasNamespace.namespaceId !== data.id
      );

      const namespaceIndex = this.namespaces.findIndex(
        (ns) => ns.id === data.id
      );

      if (namespaceIndex !== -1) {
        this.namespaces.splice(namespaceIndex, 1);
      }

      this.activeNamespace = null;
      // @ts-ignore
      await this.router.push("/channels/me");
    },

    joinNamespace(roomId: string, namespaceId: string) {
      const roomStore = useRoom();
      const userNsStore = useNsUser();
      const socketStore = useSocket();

      const room = roomStore.findRoom(Number(roomId));

      roomStore.joinRoom(room, Number(namespaceId));

      userNsStore.isUsersLoaded = false;

      socketStore.ioClient?.emit("getNamespaceUsers", namespaceId);

      this.activeNamespace =
        this.namespaces.find((ns) => ns.id === Number(namespaceId)) ?? null;
    },

    userLeaveNamespace(data: { id: number }) {
      const userNsStore = useNsUser();
      userNsStore.userList = userNsStore.userList.filter(
        (user) => user.id !== data.id
      );

      userNsStore.numberOfUsers--;
    },
  },
});
