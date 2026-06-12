import crypto from "node:crypto";
import { config } from "../config.js";

export function verifyLineSignature(rawBody: Buffer, signature?: string): boolean {
  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", config.LINE_CHANNEL_SECRET)
    .update(rawBody)
    .digest("base64");

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}
