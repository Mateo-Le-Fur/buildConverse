import { Router } from "express";
import authRoutes from "./auth.route";
import user from "./user.route";
import namespace from "./namespace.route";
import protect from "../config/jwt.config";

const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/user", protect.ensureAuthenticated, user);
router.use("/api/namespace", protect.ensureAuthenticated, namespace);

export default router;
