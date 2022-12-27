import userController from "../controllers/user.controller";
import controllerHandler from "../helpers/controllerHandler";
import { Router } from "express";

const router = Router();

router.get(
  "/:id/:random/avatar",
  controllerHandler(userController.getUserAvatar)
);

router.post(
  "/user/disable-channel/:id",
  controllerHandler(userController.disableConversation)
);

router.delete("/delete/:id", controllerHandler(userController.deleteAccount));

export default router;
