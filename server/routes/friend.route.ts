import friendController from "../controllers/friend.controller";
import controllerHandler from "../helpers/controllerHandler";
import { Router } from "express";

const router = Router();

router.get(
  "/add/:pseudo", controllerHandler(friendController.foundFriends)
);

export default router;
