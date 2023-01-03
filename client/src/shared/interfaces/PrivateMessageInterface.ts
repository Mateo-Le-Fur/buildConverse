import type { MessageInterface } from "./MessageInterface";

export interface PrivateMessageInterface extends MessageInterface {
  privateRoomId: number;

  recipientId: number;
}
