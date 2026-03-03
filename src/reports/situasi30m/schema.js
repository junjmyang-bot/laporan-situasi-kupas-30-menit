import { getSystemIsoTime } from "../../shared/time.js";

const RIJEK_ITEMS = [
  "Ada barang jatuh di lantai dan ditinggal?",
  "Sudah cek hasil rijek kupas?",
  "Tidak ada barang bagus dibuang?",
  "Tidak ada barang ditinggal di nampan dan ember?",
  "Bekas waring dibersihkan dan dibuang?",
  "Hasil cutting net sudah disortir dengan baik?",
];

const CHECKING_ITEMS = [
  "Sudah cek hasil checking kupas?",
  "Tidak ada kulit tertinggal di daging ubi?",
  "Tidak ada bintik hitam tertinggal?",
  "Tidak ada bongkeng/busuk di dalam ubi?",
  "Tidak ada serangga di dalam ubi?",
];

const PRITIL_ITEMS = [
  "Sudah cek hasil pritil nata di nampan?",
  "Sudah cek putih rijek di nampan?",
];

function makeChecklistState(items) {
  return items.map((label) => ({ label, checked: false }));
}

export const situasi30mSchema = {
  reportType: "situasi_30_menit_kupas",
  defaults() {
    return {
      teamQcTl: "",
      reporterName: "",
      checkerKupas: "",
      checkerPacking: "",
      rollingOfficer: "",
      nampanUbiOfficer: "",
      shift: "",
      systemTimestampIso: getSystemIsoTime(),
      activities: [{ task: "Kupas", k: "", lk: "", gd: "", cc: "", dry: "" }],
      stockChecked: false,
      stockConfirmCode: "",
      rijekChecklist: makeChecklistState(RIJEK_ITEMS),
      rijekResult: "",
      checkingChecklist: makeChecklistState(CHECKING_ITEMS),
      checkingResult: "",
      pritilChecklist: makeChecklistState(PRITIL_ITEMS),
      pritilResult: "",
      deltaExplanation: "",
      additionalEvent: "",
    };
  },
  shiftOptions: [
    { value: "", label: "Pilih Shift" },
    { value: "Pagi", label: "Pagi" },
    { value: "Tengah", label: "Tengah" },
    { value: "Malam", label: "Malam" },
  ],
};

export const STOCK_CONFIRM_CODE = "OK-STOK";
