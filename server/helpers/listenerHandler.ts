import { MessageInterface, SocketCustom } from "../interfaces";
import { Acknowledgment } from "../interfaces/Acknowledgment";

export default (
  callbackFn: (data: any, callbackError: Acknowledgment) => Promise<void>
) => {
  return async (data: any, callbackError: Acknowledgment) => {
    try {
      if (typeof callbackError !== "function") return
      await callbackFn(data, callbackError);
    } catch (error) {
      if (error instanceof Error) {
        callbackError({
          status: "error",
          message: error.message
        });
      }
    }
  };
};