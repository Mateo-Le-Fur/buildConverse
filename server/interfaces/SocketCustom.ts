import http from "http";
import { UserInterface } from "./User";
import { Server } from "socket.io";

import { Socket } from "socket.io";
import { JWTPayload } from "./ReqUserInterface";

interface IncomingMessage extends http.IncomingMessage {
  user?: JWTPayload;
}
export interface SocketCustom extends Socket {
  request: IncomingMessage;
}
