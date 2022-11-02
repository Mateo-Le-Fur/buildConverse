const jwt = require("jsonwebtoken");
const ApiError = require("../errors/apiError");

const authProtect = {
  createJwtToken(req, res, user) {
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: Math.floor(Date.now()) / 1000 + "s",
    });

    res.cookie("jwt", jwtToken);
    return jwtToken;
  },

  decodedToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  },

  ensureAuthenticated(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) throw new ApiError("Vous devez être connecté", 403);

    try {
      req.user = authProtect.decodedToken(token);
      next();
    } catch (e) {
      throw new ApiError(e, 403);
    }
  },
};

module.exports = authProtect;
