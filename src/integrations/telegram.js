import { postJson } from "./http.js";

export function sendTelegramMessage({ message, idempotencyKey }) {
  return postJson(
    "/api/telegram/send",
    { message },
    { idempotencyKey }
  );
}
