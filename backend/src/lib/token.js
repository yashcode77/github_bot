import { decryptToken } from "./crypto.js";
import { NotFoundError } from "./errors.js";
import { userRepository } from "../repositories/index.js";

export async function getUserAccessToken(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return decryptToken(user.encryptedToken, user.tokenIv);
}
