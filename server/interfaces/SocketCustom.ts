import http from "http";
import { UserInterface } from "./User";
import { Socket } from "socket.io";

interface IncomingMessage extends http.IncomingMessage {
  user: Partial<UserInterface>;
}
export interface SocketCustom extends Socket {
  request: IncomingMessage;
}
