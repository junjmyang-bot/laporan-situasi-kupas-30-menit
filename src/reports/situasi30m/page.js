import {
  createButton,
  createCheckbox,
  createField,
  createNumberInput,
  createSelect,
  createSubmitButton,
  createTextarea,
  createTextInput,
} from "../../shared/components.js";
import {
  buildSubmissionKey,
  clearPendingSubmission,
  loadPendingSubmission,
  savePendingSubmission,
} from "../../shared/idempotency.js";
import { getSystemIsoTime, formatLocalTime } from "../../shared/time.js";
import { appendSheetsRow } from "../../integrations/sheets.js";
import { sendTelegramMessage } from "../../integrations/telegram.js";
import { formatSheetsRow, formatTelegramMessage } from "./formatters.js";
import { situasi30mSchema, STOCK_CONFIRM_CODE } from "./schema.js";
import { getActivityTotal, validateSituasi30m } from "./validation.js";

const LAST_TOTAL_KEY = "situasi30m:last-total";

function loadPreviousTotal() {
  const raw = localStorage.getItem(LAST_TOTAL_KEY);
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function savePreviousTotal(total) {
  localStorage.setItem(LAST_TOTAL_KEY, String(total));
}

function createHeaderCard(state) {
  const card = document.createElement("section");
  card.className = "card";
  card.innerHTML = `<h2 class="section-title">1) Data Header</h2>`;

  const timeInput = createTextInput({
    value: formatLocalTime(state.systemTimestampIso),
    readOnly: true,
  });
  card.appendChild(createField({ label: "Tanggal/Jam Sistem (Read Only)", input: timeInput }));

  const teamInput = createTextInput({ value: "", placeholder: "Nama QC + TL" });
  teamInput.addEventListener("input", () => (state.teamQcTl = teamInput.value));
  card.appendChild(createField({ label: "Team (QC + TL)", input: teamInput }));

  const reporterInput = createTextInput({ value: "", placeholder: "Nama pelapor laporan ini" });
  reporterInput.addEventListener("input", () => (state.reporterName = reporterInput.value));
  card.appendChild(createField({ label: "Pelapor", input: reporterInput }));

  const checkerKupas = createTextInput({ value: "", placeholder: "Petugas cross cek kupas" });
  checkerKupas.addEventListener("input", () => (state.checkerKupas = checkerKupas.value));
  card.appendChild(createField({ label: "Petugas cross cek di kupas", input: checkerKupas }));

  const checkerPacking = createTextInput({ value: "", placeholder: "Petugas cross cek packing" });
  checkerPacking.addEventListener("input", () => (state.checkerPacking = checkerPacking.value));
  card.appendChild(createField({ label: "Petugas cross cek di packing", input: checkerPacking }));

  const rollingOfficer = createTextInput({ value: "", placeholder: "Petugas rolling" });
  rollingOfficer.addEventListener("input", () => (state.rollingOfficer = rollingOfficer.value));
  card.appendChild(createField({ label: "Petugas rolling", input: rollingOfficer }));

  const nampanUbi = createTextInput({ value: "", placeholder: "Petugas nampan / ubi" });
  nampanUbi.addEventListener("input", () => (state.nampanUbiOfficer = nampanUbi.value));
  card.appendChild(createField({ label: "Petugas nampan / ubi", input: nampanUbi }));

  const shiftSelect = createSelect({
    options: situasi30mSchema.shiftOptions,
    value: state.shift,
  });
  shiftSelect.addEventListener("change", () => (state.shift = shiftSelect.value));
  card.appendChild(createField({ label: "Shift", input: shiftSelect }));

  return { card, updateTime: (iso) => (timeInput.value = formatLocalTime(iso)) };
}

function createActivitiesCard(state, previousTotalRef) {
  const card = document.createElement("section");
  card.className = "card";
  card.innerHTML = `<h2 class="section-title">2) Detail Aktivitas (30 Menit Ini)</h2>`;

  const hint = document.createElement("p");
  hint.className = "muted";
  hint.textContent = "Isi jumlah orang per aktivitas. Total dihitung otomatis.";
  card.appendChild(hint);

  const rowsWrap = document.createElement("div");
  card.appendChild(rowsWrap);

  const totalEl = document.createElement("p");
  totalEl.className = "subtitle";

  const deltaField = createTextarea({ placeholder: "Wajib isi jika total berubah (contoh: Shift tengah datang 6 pax)." });
  deltaField.addEventListener("input", () => (state.deltaExplanation = deltaField.value));
  const deltaWrap = createField({ label: "Alasan perubahan total", input: deltaField });

  const eventField = createTextarea({ placeholder: "Event tambahan (opsional)" });
  eventField.addEventListener("input", () => (state.additionalEvent = eventField.value));
  const eventWrap = createField({ label: "Catatan event tambahan", input: eventField });

  function renderRows() {
    rowsWrap.innerHTML = "";
    state.activities.forEach((activity, index) => {
      const row = document.createElement("div");
      row.className = "card";

      const task = createTextInput({ value: activity.task, placeholder: "Nama kerja (contoh: Ceking)" });
      task.addEventListener("input", () => {
        activity.task = task.value;
      });

      const counts = document.createElement("div");
      counts.className = "row-5";
      for (const key of ["k", "lk", "gd", "cc", "dry"]) {
        const input = createNumberInput({ value: activity[key], min: 0, placeholder: key });
        input.addEventListener("input", () => {
          activity[key] = input.value;
          refreshTotal();
        });
        counts.appendChild(input);
      }

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "mini-btn";
      remove.textContent = "Hapus aktivitas";
      remove.addEventListener("click", () => {
        if (state.activities.length === 1) return;
        state.activities.splice(index, 1);
        renderRows();
        refreshTotal();
      });

      row.append(
        createField({ label: `Aktivitas #${index + 1}`, input: task }),
        createField({ label: "Jumlah (k / lk / gd / cc / dry)", input: counts }),
        remove
      );
      rowsWrap.appendChild(row);
    });
  }

  function refreshTotal() {
    const current = getActivityTotal(state.activities);
    const prev = previousTotalRef.value;
    const delta = typeof prev === "number" ? current - prev : null;
    totalEl.textContent =
      delta == null
        ? `Total sekarang: ${current} pax | Total sebelumnya: belum ada`
        : `Total sekarang: ${current} pax | Sebelumnya: ${prev} pax | Delta: ${delta >= 0 ? "+" : ""}${delta}`;
  }

  const addBtn = createButton({ label: "Tambah aktivitas" });
  addBtn.className = "mini-btn";
  addBtn.addEventListener("click", () => {
    state.activities.push({ task: "", k: "", lk: "", gd: "", cc: "", dry: "" });
    renderRows();
    refreshTotal();
  });

  card.append(totalEl, deltaWrap, eventWrap, addBtn);

  renderRows();
  refreshTotal();
  return { card, refreshTotal };
}

function createChecklistCard(state) {
  const card = document.createElement("section");
  card.className = "card";
  card.innerHTML = `<h2 class="section-title">3) Checklist Eksekusi</h2>`;

  const stockCheck = createCheckbox({ checked: state.stockChecked });
  stockCheck.addEventListener("change", () => (state.stockChecked = stockCheck.checked));
  const stockWrap = document.createElement("div");
  stockWrap.className = "field inline";
  const stockLabel = document.createElement("span");
  stockLabel.textContent = "Stok sudah cross cek / dicek sama MP";
  stockWrap.append(stockCheck, stockLabel);
  card.appendChild(stockWrap);

  const stockCode = createTextInput({ value: "", placeholder: `Ketik ${STOCK_CONFIRM_CODE}` });
  stockCode.addEventListener("input", () => (state.stockConfirmCode = stockCode.value));
  card.appendChild(createField({ label: "Konfirmasi baca (anti asal centang)", input: stockCode }));

  function renderChecklistGroup(title, arr, resultField, onResult) {
    const group = document.createElement("div");
    group.className = "card";
    const h = document.createElement("h3");
    h.className = "section-title";
    h.textContent = title;
    group.appendChild(h);
    arr.forEach((item, idx) => {
      const cb = createCheckbox({ checked: item.checked });
      cb.addEventListener("change", () => {
        arr[idx].checked = cb.checked;
      });
      const line = document.createElement("div");
      line.className = "field inline";
      const text = document.createElement("span");
      text.textContent = item.label;
      line.append(cb, text);
      group.appendChild(line);
    });
    const result = createTextarea({ value: resultField, placeholder: "Hasil cek ringkas (opsional)" });
    result.addEventListener("input", () => onResult(result.value));
    group.appendChild(createField({ label: "Hasil cek", input: result }));
    return group;
  }

  card.appendChild(
    renderChecklistGroup("5.1 Status Rijek", state.rijekChecklist, state.rijekResult, (v) => (state.rijekResult = v))
  );
  card.appendChild(
    renderChecklistGroup("6.1 Status Hasil Checking", state.checkingChecklist, state.checkingResult, (v) => (state.checkingResult = v))
  );
  card.appendChild(
    renderChecklistGroup("6.2 Status Pritil Nata", state.pritilChecklist, state.pritilResult, (v) => (state.pritilResult = v))
  );

  return { card };
}

export function createReportPage(root) {
  const state = situasi30mSchema.defaults();
  let pendingSubmission = loadPendingSubmission();
  let inFlight = false;
  const previousTotalRef = { value: loadPreviousTotal() };

  root.innerHTML = "";

  const topCard = document.createElement("section");
  topCard.className = "card";
  topCard.innerHTML = `
    <h1 class="title">B-1-2 Laporan Situasi (Kupas)</h1>
    <p class="subtitle">Durasi lapor: setiap 30 menit | Primary Telegram, backup Google Sheets</p>
  `;
  root.appendChild(topCard);

  const header = createHeaderCard(state);
  root.appendChild(header.card);

  const activities = createActivitiesCard(state, previousTotalRef);
  root.appendChild(activities.card);

  const checklists = createChecklistCard(state);
  root.appendChild(checklists.card);

  const actionCard = document.createElement("section");
  actionCard.className = "card";
  const statusEl = document.createElement("div");
  statusEl.className = "status";

  const submit = createSubmitButton();
  submit.element.addEventListener("click", async () => {
    if (inFlight) return;
    inFlight = true;
    submit.setState("sending");
    statusEl.className = "status";
    statusEl.textContent = "";

    const candidate = {
      ...state,
      systemTimestampIso: state.systemTimestampIso || getSystemIsoTime(),
    };

    const validation = validateSituasi30m(candidate, { previousTotal: previousTotalRef.value });
    if (!validation.valid) {
      inFlight = false;
      submit.setState("idle");
      statusEl.className = "status error";
      statusEl.textContent = validation.errors[0];
      return;
    }

    const submission = pendingSubmission?.payload ? pendingSubmission.payload : { ...candidate };
    const idempotencyKey = pendingSubmission?.idempotencyKey || buildSubmissionKey();
    submission.idempotencyKey = idempotencyKey;
    submission.systemTimestampIso = submission.systemTimestampIso || getSystemIsoTime();

    pendingSubmission = { idempotencyKey, payload: submission };
    savePendingSubmission(pendingSubmission);

    try {
      if (!navigator.onLine) throw new Error("Koneksi internet tidak tersedia.");

      const message = formatTelegramMessage(submission, { previousTotal: previousTotalRef.value });
      await sendTelegramMessage({ message, idempotencyKey });

      const row = formatSheetsRow(submission, { previousTotal: previousTotalRef.value });
      await appendSheetsRow({ row, idempotencyKey });

      const submittedTotal = validation.total;
      savePreviousTotal(submittedTotal);
      previousTotalRef.value = submittedTotal;

      clearPendingSubmission();
      pendingSubmission = null;
      statusEl.className = "status ok";
      statusEl.textContent = "Terkirim: Telegram + Sheets";
      submit.setState("success");

      state.systemTimestampIso = getSystemIsoTime();
      header.updateTime(state.systemTimestampIso);
      activities.refreshTotal();
    } catch (err) {
      statusEl.className = "status error";
      statusEl.textContent = `Gagal kirim. Retry aman. ${String(err.message || err)}`;
      submit.setState("idle");
    } finally {
      inFlight = false;
    }
  });

  actionCard.append(statusEl, submit.element);
  root.appendChild(actionCard);

  if (pendingSubmission?.idempotencyKey) {
    statusEl.className = "status error";
    statusEl.textContent = "Ada kiriman tertunda. Tekan kirim untuk retry aman.";
  }
}
