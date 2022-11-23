const cookieParser = require("cookie");
const { decodedToken } = require("./jwt.config");
const User = require("../models/User");

exports.ensureAuthenticatedOnSocketHandshake = async (request, success) => {
  try {
    const cookies = cookieParser.parse(request.headers.cookie || "");
    if (cookies && cookies.jwt) {
      request.user = decodedToken(cookies.jwt);
      console.log("success");
      success(null, true);
    } else {
      console.log("pas success");

      success(403, false);
    }
  } catch (e) {
    success(400, false);
  }
};
