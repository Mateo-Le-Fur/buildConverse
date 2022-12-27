import authController from "../controllers/auth.controller";
import controllerHandler from "../helpers/controllerHandler";
import { Router } from "express";
import protect from "../config/jwt.config";
import validator from "../validation/validator";
import registerValidator from "../validation/schema/register.schema";
import loginValidator from "../validation/schema/login.schema";

const router = Router();

router.post(
  "/register",
  validator("body", registerValidator),
  controllerHandler(authController.register)
);
router.post(
  "/login",
  validator("body", loginValidator),
  controllerHandler(authController.login)
);

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
