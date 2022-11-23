const userController = require("../controllers/user.controller");
const controllerHandler = require("../helpers/controllerHandler");
const router = require("express").Router();

router.get("/:id", controllerHandler(userController.getUser));

module.exports = router;
