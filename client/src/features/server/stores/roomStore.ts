import { defineStore } from "pinia";

import type { RoomInterface } from "@/shared/interfaces/Room";
import { useSocket } from "@/shared/stores/socketStore";

interface RoomState {
  activeRoom: RoomInterface | null | undefined;
  rooms: RoomInterface[];
}

export const useRoom = defineStore("room", {
  state: (): RoomState => ({
    activeRoom: null,
    rooms: [],
  }),

  getters: {
    findRoom(state): (roomId: string) => RoomInterface | undefined {
      return (roomId: string) =>
        state.rooms.find((room: RoomInterface) => room.id === Number(roomId));
    },
  },

  actions: {
    getRoomsData(data: RoomInterface[]) {
      this.rooms.push(...data);
    },

    joinRoom(room: RoomInterface | undefined) {
      const socketStore = useSocket();

      socketStore.activeNsSocket.emit("joinRoom", room?.id);

      this.activeRoom = room;
    },

    getRooms(namespaceId: string): RoomInterface[] {
      return this.rooms.filter(
        (room: RoomInterface) => room.namespace_id.toString() === namespaceId
      );
    },
  },
});
