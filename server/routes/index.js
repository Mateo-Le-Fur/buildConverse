const authRoutes = require("./auth.route");
const router = require("express").Router();
const user = require("./user.route");
const protect = require("../config/jwt.config");

router.use("/api/auth", authRoutes);
router.use("/api/user", protect.ensureAuthenticated, user);

module.exports = router;
