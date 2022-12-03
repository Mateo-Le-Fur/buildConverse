const namespaceController = require("../controllers/namespace.controller");
const controllerHandler = require("../helpers/controllerHandler");
const router = require("express").Router();

router.get('/:id/:random/avatar', controllerHandler(namespaceController.getNamespaceAvatar))

module.exports = router;
