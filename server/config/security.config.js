const cookieParser = require("cookie");
const { decodedToken } = require("./jwt.config");
const User = require("../models/User");

exports.ensureAuthenticatedOnSocketHandshake = async (request, success) => {
  try {
    const cookies = cookieParser.parse(request.headers.cookie || "");
    if (cookies && cookies.jwt) {
      request.user = decodedToken(cookies.jwt);
      success(null, true);
    } else {

      success(null, false);
    }
  } catch (e) {
    console.error(e)
    success(null, false);
  }
};
