import type { Request, Response, NextFunction } from "express";

export default (
    controller: (req: Request, res: Response, next: NextFunction) => void
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
