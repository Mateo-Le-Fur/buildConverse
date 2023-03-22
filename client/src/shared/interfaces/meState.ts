import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import type { RecipientInterface } from "@/shared/interfaces/RecipientInterface";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";

export interface MeState {
  friends: FriendsInterface[];
  recipients: RecipientInterface[];
  pendingRequestsId: Partial<FriendsInterface>[];
  currentRecipient: RecipientInterface | null;
  currentRoomId: number | null;
  error: null | string;
}
