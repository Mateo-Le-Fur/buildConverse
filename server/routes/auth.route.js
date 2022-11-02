const authController = require("../controllers/auth.controller");
const controllerHandler = require("../helpers/controllerHandler");
const protect = require("../config/jwt.config");

const router = require("express").Router();

router.post("/signin", controllerHandler(authController.signin));
router.post("/login", controllerHandler(authController.login));

router.delete(
  "/logout",
  protect.ensureAuthenticated,
  controllerHandler(authController.logout)
);
router.get(
  "/current",
  protect.ensureAuthenticated,
  controllerHandler(authController.getCurrent)
);

module.exports = router;
