import type { User } from "./User";

export interface RecipientInterface extends User {
  privateRoomId: number;
}
