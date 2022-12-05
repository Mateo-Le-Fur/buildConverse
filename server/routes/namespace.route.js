const namespaceController = require("../controllers/namespace.controller");
const controllerHandler = require("../helpers/controllerHandler");
const router = require("express").Router();

router.get(
  "/:id/:random/avatar",
  controllerHandler(namespaceController.getNamespaceAvatar)
);
router.delete(
  "/:id/delete",
  controllerHandler(namespaceController.leaveNamespace)
);

module.exports = router;
