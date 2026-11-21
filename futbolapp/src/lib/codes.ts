import { randomInt } from "node:crypto";

// Sin letras ni números que se confundan (0/o, 1/l/i)
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export function randomCode(length = 10): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
