import { postJson } from "./http.js";

export function appendSheetsRow({ row, idempotencyKey }) {
  return postJson(
    "/api/sheets/append",
    { row },
    { idempotencyKey }
  );
}
