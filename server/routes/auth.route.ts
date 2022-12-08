import authController from "../controllers/auth.controller";
import controllerHandler from "../helpers/controllerHandler";
import { Router } from "express";
import protect from "../config/jwt.config";

const router = Router();

router.post("/signin", controllerHandler(authController.signin));
router.post("/login", controllerHandler(authController.login));

router.delete(
  "/logout",
  protect.ensureAuthenticated.bind(protect),
  controllerHandler(authController.logout)
);
router.get(
  "/current",
  protect.ensureAuthenticated.bind(protect),
  controllerHandler(authController.getCurrent)
);

export default router;
