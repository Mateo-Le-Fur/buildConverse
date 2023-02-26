import jwt from "jsonwebtoken";
import ApiError from "../errors/apiError";
import type { NextFunction, Request, Response } from "express";
import type { UserInterface } from "../interfaces/User";
import type { JWTPayload, RequestCustom } from "../interfaces/ReqUserInterface";
import http from "http";
import cookieParser from "cookie";
import { SocketCustom } from "../interfaces";

class authProtect {
  constructor() {
    this.ensureAuthenticated = this.ensureAuthenticated.bind(this);
  }

  createJwtToken(req: Request, res: Response, user: Partial<UserInterface>) {
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET as string, {
      expiresIn: 3600 + "s"
    });

    res.cookie("jwt", jwtToken, {
      expires: new Date(Date.now() + 3600 * 1000 * 24 * 180),
      httpOnly: true,
      secure: true
    });
    return jwtToken;
  }

  decodedToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  }

  ensureAuthenticated(req: RequestCustom | http.IncomingHttpHeaders, res: Response, next: NextFunction) {
    const token = req.cookies.jwt;

    if (!token) throw new ApiError("Vous devez être connecté", 403);

    try {
      req.user = <JWTPayload>this.decodedToken(token);
      next();
    } catch (e) {
      if (e instanceof Error) {
        throw new ApiError(e.message, 403);
      }
    }
  }

  ensureAuthenticatedOnSocketServer(req: http.IncomingMessage, socket: SocketCustom) {

    const cookies = cookieParser.parse(req.headers.cookie || "");

    const token = cookies.jwt;

    if (!token) throw new Error("Vous devez être connecté");

    try {
      req.user = this.decodedToken(token);
    } catch (e) {
      if (e instanceof Error) {
        socket.disconnect();
      }
    }
  }
}

export default new authProtect();
