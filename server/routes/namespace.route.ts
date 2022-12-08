import { Router } from "express";
import namespaceController from "../controllers/namespace.controller";
import controllerHandler from "../helpers/controllerHandler";

const router = Router();

router.get(
  "/:id/:random/avatar",
  controllerHandler(namespaceController.getNamespaceAvatar)
);
router.delete(
  "/:id/delete",
  controllerHandler(namespaceController.leaveNamespace)
);

export default router;
