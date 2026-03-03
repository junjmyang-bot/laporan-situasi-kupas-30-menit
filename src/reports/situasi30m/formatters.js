import { formatLocalTime } from "../../shared/time.js";
import { getActivityTotal } from "./validation.js";

function nonZeroParts(activity) {
  const out = [];
  for (const key of ["k", "lk", "gd", "cc", "dry"]) {
    const val = Number(activity[key] || 0);
    if (val > 0) out.push(`${val}${key}`);
  }
  return out.length ? out.join("+") : "0";
}

export function formatTelegramMessage(payload, { previousTotal = null } = {}) {
  const waktu = formatLocalTime(payload.systemTimestampIso);
  const total = getActivityTotal(payload.activities || []);
  const delta = typeof previousTotal === "number" ? total - previousTotal : 0;
  const deltaText = typeof previousTotal === "number" ? `${delta >= 0 ? "+" : ""}${delta}` : "N/A";

  const activityLines = (payload.activities || [])
    .map((a) => `- ${a.task}: ${nonZeroParts(a)}`)
    .join("\n");

  return [
    "B-1-2 LAPORAN SITUASI KUPAS (30 MENIT)",
    `Waktu: ${waktu}`,
    `Team (QC+TL): ${payload.teamQcTl}`,
    `Pelapor: ${payload.reporterName}`,
    `Cross cek kupas: ${payload.checkerKupas}`,
    `Cross cek packing: ${payload.checkerPacking}`,
    `Rolling: ${payload.rollingOfficer}`,
    `Nampan/Ubi: ${payload.nampanUbiOfficer}`,
    "",
    "Aktivitas:",
    activityLines || "- (kosong)",
    `Total sekarang: ${total} pax`,
    `Delta vs sebelumnya: ${deltaText}`,
    `Alasan delta: ${payload.deltaExplanation?.trim() || "-"}`,
    `Event tambahan: ${payload.additionalEvent?.trim() || "-"}`,
    "",
    "Checklist:",
    "- Stock cross cek MP: YES",
    "- Rijek: YES",
    "- Hasil checking kupas: YES",
    "- Pritil nata: YES",
    `Catatan Rijek: ${payload.rijekResult?.trim() || "-"}`,
    `Catatan Checking: ${payload.checkingResult?.trim() || "-"}`,
    `Catatan Pritil: ${payload.pritilResult?.trim() || "-"}`,
  ].join("\n");
}

export function formatSheetsRow(payload, { previousTotal = null } = {}) {
  const total = getActivityTotal(payload.activities || []);
  const delta = typeof previousTotal === "number" ? total - previousTotal : "";

  return [
    payload.systemTimestampIso,
    payload.teamQcTl,
    payload.reporterName,
    payload.checkerKupas,
    payload.checkerPacking,
    payload.rollingOfficer,
    payload.nampanUbiOfficer,
    payload.shift,
    JSON.stringify(payload.activities || []),
    String(total),
    String(delta),
    payload.deltaExplanation || "",
    payload.additionalEvent || "",
    payload.rijekResult || "",
    payload.checkingResult || "",
    payload.pritilResult || "",
    payload.idempotencyKey,
  ];
}
