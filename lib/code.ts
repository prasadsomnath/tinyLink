import { customAlphabet } from "nanoid";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const nano = customAlphabet(alphabet, 6);
export function generateCode(len = 6) {
  return nano().slice(0, len);
}
