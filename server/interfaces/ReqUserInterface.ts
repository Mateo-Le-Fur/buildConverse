import type { UserInterface } from "./User";
import type { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface JWTPayload extends JwtPayload {
  id?: number;
  pseudo?: string;
}

export interface RequestCustom extends Request {
  user: JWTPayload | string;
}
