import type { Request, Response, NextFunction } from "express";
import {RequestCustom} from "../interfaces";

export default (
    controller: (req: RequestCustom, res: Response, next: NextFunction) => void
  ) =>
  async (req: RequestCustom, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
