// const logger = require("./logger");
const ApiError = require("../errors/apiError");

const errorHandler = (err, req, res, next) => {
  let { message, statusCode } = err;

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

module.exports = {
  ApiError,
  errorHandler,
};
