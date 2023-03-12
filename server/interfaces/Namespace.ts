import type { UserHasNamespaceInterface } from "./UserHasNamespace";
import type { RoomInterface } from "./Room";
import { UserInterface } from "./User";

export interface NamespaceInterface {
  id: number;
  name: string;
  inviteCode: string;
  imgBuffer: string;
  rooms: RoomInterface[];
  UserHasNamespace: UserHasNamespaceInterface;
  createdAt: string;
  updatedAt: string;
  usersOnline?: number;
  users?: UserInterface[];
}
