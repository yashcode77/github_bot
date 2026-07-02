import crypto from "crypto";
import { env } from "../config/env.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

const encryptionKey = Buffer.from(env.ENCRYPTION_KEY, "hex");

export function encryptToken(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return {
    encryptedToken: `${encrypted}:${authTag.toString("hex")}`,
    tokenIv: iv.toString("hex"),
  };
}

export function decryptToken(encryptedToken, tokenIv) {
  const [encrypted, authTagHex] = encryptedToken.split(":");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    encryptionKey,
    Buffer.from(tokenIv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function generateRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashRefreshToken(token) {
  return crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(token)
    .digest("hex");
}
