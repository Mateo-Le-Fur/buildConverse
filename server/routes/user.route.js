const userController = require("../controllers/user.controller");
const controllerHandler = require("../helpers/controllerHandler");
const router = require("express").Router();

router.get('/:id/:random/avatar', controllerHandler(userController.getUserAvatar))
router.delete("/delete/:id", controllerHandler(userController.deleteAccount));

module.exports = router;
