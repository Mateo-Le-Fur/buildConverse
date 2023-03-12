import friendController from "../controllers/friend.controller";
import controllerHandler from "../helpers/controllerHandler";
import { Router } from "express";

const router = Router();

router.post(
  "/add",
  controllerHandler(controllerHandler(friendController.addFriend))
);

export default router;
