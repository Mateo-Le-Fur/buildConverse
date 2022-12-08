// const logger = require("./logger");
import { NextFunction, Response, Request } from "express";
import { ApiErrorInterface } from "../errors/apiError";

const ApiError = require("../errors/apiError");

const errorHandler = (
  err: ApiErrorInterface,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { message, statusCode } = err;
  console.log(err);

  if (!statusCode || Number.isNaN(Number(statusCode))) {
    statusCode = 500;
  }

  if (statusCode) {
    // logger.log("error", `${err.message}`);
  }

  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "Internal Server Error";
  }

  if (res.get("Content-type")?.includes("html")) {
    res.status(statusCode).render("error", {
      statusCode,
      message,
      title: `Error ${err.statusCode}`,
    });
  } else {
    res.status(statusCode).json({
      status: "error",
      statusCode,
      message,
    });
  }
};

export { ApiError, errorHandler };
