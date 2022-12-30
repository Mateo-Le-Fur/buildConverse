import type { User } from "@/shared/interfaces/User";

export interface FriendsInterface extends User {
  privateRoomId: number;
  active: boolean;
  friends: User[];
  friendsRequest: User[];
}
