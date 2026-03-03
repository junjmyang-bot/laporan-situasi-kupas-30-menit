import { STOCK_CONFIRM_CODE } from "./schema.js";

function toNum(value) {
  if (value === "" || value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

export function getActivityTotal(activities) {
  return activities.reduce((sum, activity) => {
    const counts = [activity.k, activity.lk, activity.gd, activity.cc, activity.dry];
    const row = counts.reduce((rowSum, raw) => rowSum + (toNum(raw) || 0), 0);
    return sum + row;
  }, 0);
}

export function validateSituasi30m(payload, { previousTotal = null } = {}) {
  const errors = [];

  if (!payload.teamQcTl?.trim()) errors.push("Team (QC + TL) wajib diisi.");
  if (!payload.reporterName?.trim()) errors.push("Pelapor wajib diisi.");
  if (!payload.checkerKupas?.trim()) errors.push("Petugas cross cek kupas wajib diisi.");
  if (!payload.checkerPacking?.trim()) errors.push("Petugas cross cek packing wajib diisi.");
  if (!payload.rollingOfficer?.trim()) errors.push("Petugas rolling wajib diisi.");
  if (!payload.nampanUbiOfficer?.trim()) errors.push("Petugas nampan/ubi wajib diisi.");
  if (!payload.shift) errors.push("Shift wajib dipilih.");

  if (!Array.isArray(payload.activities) || payload.activities.length === 0) {
    errors.push("Minimal 1 aktivitas harus diisi.");
  } else {
    for (const activity of payload.activities) {
      if (!activity.task?.trim()) {
        errors.push("Nama aktivitas tidak boleh kosong.");
        break;
      }
      for (const key of ["k", "lk", "gd", "cc", "dry"]) {
        const raw = activity[key];
        if (raw !== "" && Number.isNaN(toNum(raw))) {
          errors.push(`Nilai ${key.toUpperCase()} pada aktivitas "${activity.task}" tidak valid.`);
          break;
        }
      }
    }
  }

  if (!payload.stockChecked) {
    errors.push("Checklist stock cross cek harus dicentang.");
  }
  if ((payload.stockConfirmCode || "").trim().toUpperCase() !== STOCK_CONFIRM_CODE) {
    errors.push(`Ketik kode konfirmasi "${STOCK_CONFIRM_CODE}".`);
  }

  const allChecks = [
    ...(payload.rijekChecklist || []),
    ...(payload.checkingChecklist || []),
    ...(payload.pritilChecklist || []),
  ];
  if (allChecks.some((item) => !item.checked)) {
    errors.push("Semua checklist kualitas harus dicentang YES.");
  }

  if ((payload.rijekResult || "").length > 500) errors.push("Hasil cek rijek maksimal 500 karakter.");
  if ((payload.checkingResult || "").length > 500) errors.push("Hasil cek checking maksimal 500 karakter.");
  if ((payload.pritilResult || "").length > 500) errors.push("Hasil cek pritil maksimal 500 karakter.");
  if ((payload.additionalEvent || "").length > 500) errors.push("Catatan event maksimal 500 karakter.");
  if ((payload.deltaExplanation || "").length > 500) errors.push("Alasan perubahan total maksimal 500 karakter.");

  const total = getActivityTotal(payload.activities || []);
  const hasPrevious = typeof previousTotal === "number";
  if (hasPrevious && total !== previousTotal && !payload.deltaExplanation?.trim()) {
    errors.push("Total berubah dari laporan sebelumnya. Isi alasan perubahan total.");
  }

  return { valid: errors.length === 0, errors, total };
}
