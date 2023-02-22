import cookieParser from "cookie";
import authProtect from "./jwt.config";
import http from "http";
import { JwtPayload } from "jsonwebtoken";

interface RequestHandshake extends http.IncomingMessage {
  user?: string | JwtPayload;
}

export async function ensureAuthenticatedOnSocketHandshake(
  request: RequestHandshake,
  cb: (error: string | null | undefined, success: boolean) => void
) {
  try {
    const cookies = cookieParser.parse(request.headers.cookie || "");
    if (cookies && cookies.jwt) {
      request.user = authProtect.decodedToken(cookies.jwt);
      cb(null, true);
    } else {
      cb(null, false);
    }
  } catch (e) {
    if (e instanceof Error) {
      cb(e.message, false);
    }
  }
}
