import cookieParser from "cookie";
import authProtect from "./jwt.config";

export async function ensureAuthenticatedOnSocketHandshake(
  request: any,
  success: (arg0: any, arg1: boolean) => void
) {
  try {
    const cookies = cookieParser.parse(request.headers.cookie || "");
    if (cookies && cookies.jwt) {
      // @ts-ignore
      request.user = authProtect.decodedToken(cookies.jwt);
      success(null, true);
    } else {
      success(null, false);
    }
  } catch (e) {
    console.error(e);
    success(null, false);
  }
}
