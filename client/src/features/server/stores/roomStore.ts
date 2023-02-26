import { defineStore } from "pinia";

import type { RoomInterface } from "@/shared/interfaces/Room";
import { useSocket } from "@/shared/stores/socketStore";

interface RoomState {
  activeRoom: RoomInterface | null | undefined;
  rooms: RoomInterface[];
  error: null | string;
}

export const useRoom = defineStore("room", {
  state: (): RoomState => ({
    activeRoom: null,
    rooms: [],
    error: null,
  }),

  getters: {
    findRoom(state): (roomId: number) => RoomInterface | undefined {
      return (roomId: number) =>
        state.rooms.find((room: RoomInterface) => room.id === roomId);
    },

    findRoomByIndex(
      state
    ): (roomIndex: number, namespaceId: number) => RoomInterface | undefined {
      return (roomIndex: number, namespaceId: number) =>
        state.rooms.find(
          (room: RoomInterface) =>
            room.index === roomIndex && room.namespaceId === namespaceId
        );
    },
  },

  actions: {
    getRoomsData(data: RoomInterface) {
      this.rooms.push(data);
    },

    createRoom(data: RoomInterface) {
      this.rooms.push(data);
    },

    updateRoom(data: RoomInterface) {
      const room = this.rooms.findIndex((room) => room.id === data.id);

      this.rooms[room].name = data.name;

      if (data.index) this.rooms[room].index = data.index;
    },

    async deleteRoom(data: RoomInterface) {
      const socketStore = useSocket();

      this.rooms = this.rooms.filter((room) => room.id !== data.id);

      const room = this.rooms.find(
        (room) => room.namespaceId === data.namespaceId
      );

      if (this.activeRoom?.id === data.id) {
        socketStore.ioClient?.emit("leaveRoom", data.id);
      }

      //@ts-ignore
      await this.router.push(
        `/channels/${this.activeRoom?.namespaceId}/${room?.id}`
      );

      this.joinRoom(room, Number(room?.namespaceId));
    },

    joinRoom(room: RoomInterface | undefined, namespaceId: number) {
      const socketStore = useSocket();

      socketStore.ioClient?.emit("joinRoom", {
        roomId: room?.id,
        namespaceId,
      });

      this.activeRoom = room;
    },

    getRooms(namespaceId: string): RoomInterface[] {
      return this.rooms
        .filter(
          (room: RoomInterface) => room.namespaceId.toString() === namespaceId
        )
        .sort((a, b) => a.index - b.index);
    },

    getFirstRoom(namespaceId: number): number | void {
      const room = this.rooms.find(
        (room: RoomInterface) => room.namespaceId === namespaceId
      );
      if (room) return room.id;
    },
  },
});
