import { UserInterface } from "./User";

export interface FriendsInterface extends UserInterface {
  friends: UserInterface[];
  friendsRequests: UserInterface[];

  conversationId: number;
}
