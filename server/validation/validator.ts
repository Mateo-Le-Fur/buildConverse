import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import ApiError from "../errors/apiError";

export = (prop: string, schema: Joi.Schema) =>
  async (request: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(request[prop as keyof object], {
        allowUnknown: true,
      });
      next();
    } catch (error) {
      if (error instanceof Error) {
        next(new ApiError(error.message, 400));
      }
    }
  };
