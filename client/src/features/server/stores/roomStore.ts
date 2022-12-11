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
    findRoom(state): (roomId: string) => RoomInterface | undefined {
      return (roomId: string) =>
        state.rooms.find((room: RoomInterface) => room.id === Number(roomId));
    },
  },

  actions: {
    getRoomsData(data: RoomInterface[]) {
      this.rooms.push(...data);
    },

    createRoom(data: RoomInterface) {
      this.rooms.push(data);
    },

    updateRoom(data: RoomInterface) {
      const room = this.rooms.findIndex((room) => room.id === data.id);

      this.rooms[room].name = data.name;
    },

    async deleteRoom(data: RoomInterface) {
      const socketStore = useSocket();

      this.rooms = this.rooms.filter((room) => room.id !== data.id);

      const room = this.rooms.find(
        (room) => room.namespaceId === data.namespaceId
      );

      if (this.activeRoom?.id === data.id) {
        socketStore.activeNsSocket.emit("leaveRoom", data.id);
      }

      //@ts-ignore
      await this.router.push(
        `/channels/${this.activeRoom?.namespaceId}/${room?.id}`
      );

      this.joinRoom(room);
    },

    joinRoom(room: RoomInterface | undefined) {
      const socketStore = useSocket();

      socketStore.activeNsSocket.emit("joinRoom", room?.id);

      this.activeRoom = room;
    },

    getRooms(namespaceId: string): RoomInterface[] {
      return this.rooms.filter(
        (room: RoomInterface) => room.namespaceId.toString() === namespaceId
      );
    },

    getFirstRoom(namespaceId: number): number {
      const room = this.rooms.find(
        (room: RoomInterface) => room.namespaceId === namespaceId
      );

      console.log(room)
      return room!.id;
    },
  },
});
