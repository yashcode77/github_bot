import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

export function verifyAccessToken(token) {
  console.log("=== VERIFY ACCESS TOKEN ===");
  console.log("token exists:", !!token);
  console.log(
    "JWT_ACCESS_SECRET exists:",
    !!env.JWT_SECRET
  );

  return jwt.verify(token, env.JWT_SECRET);
}