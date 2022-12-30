import type { User } from "./User";
import type { UserHasPrivateRoomInterface } from "@/shared/interfaces/UserHasPrivateRoom";

export interface RecipientInterface extends User {
  privateRoomId: number;

  UserHasPrivateRoom?: UserHasPrivateRoomInterface;

  active: boolean;
}
