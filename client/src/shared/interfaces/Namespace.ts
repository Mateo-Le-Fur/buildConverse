import type { RoomInterface } from "@/shared/interfaces/Room";
import type { User } from "@/shared/interfaces/User";
import type { UserHasNamespace } from "@/shared/interfaces/UserHasNamespace";

export interface Namespace {
  id: number;
  name: string;
  inviteCode: string;
  imgUrl: string;
  rooms: RoomInterface[];
  UserHasNamespace: UserHasNamespace;

  usersOnline: number;
  createdAt: string;
  updatedAt: string;
}
