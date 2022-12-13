import type { User } from "@/shared/interfaces/User";

export interface FriendsInterface extends User {
  friends: User[];
  friendsRequest: User[];
}
