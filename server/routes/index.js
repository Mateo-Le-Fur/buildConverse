const authRoutes = require("./auth.route");
const router = require("express").Router();
const user = require("./user.route");
const namespace  = require('./namespace.route')
const protect = require("../config/jwt.config");

router.use("/api/auth", authRoutes);
router.use("/api/user", protect.ensureAuthenticated, user);
router.use("/api/namespace", protect.ensureAuthenticated, namespace);

module.exports = router;
