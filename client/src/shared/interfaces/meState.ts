import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import type { RecipientInterface } from "@/shared/interfaces/RecipientInterface";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";

export interface MeState {
  friends: FriendsInterface[] | any[];
  recipients: RecipientInterface[];
  currentRecipient: RecipientInterface | null;
  currentRecipientId: number | null;
  error: null | string;
}
