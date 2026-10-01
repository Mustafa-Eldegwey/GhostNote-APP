import crypto from "crypto";

export function genetareOTPCode() {
  return crypto.randomInt(100000, 999999).toString();
}
