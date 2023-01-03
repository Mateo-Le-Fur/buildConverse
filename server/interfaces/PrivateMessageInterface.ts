import { MessageInterface } from "./Message";

export interface PrivateMessageInterface extends MessageInterface {
  privateRoomId: number;
  recipientId: number;
}
