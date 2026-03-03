import { createField, createSelect, createTextInput } from "./components.js";
import { formatLocalTime } from "./time.js";

export function renderCommonHeader({ container, model, shiftOptions, onChange }) {
  const card = document.createElement("section");
  card.className = "card";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = "Header Laporan";
  card.appendChild(title);

  const timeInput = createTextInput({
    value: formatLocalTime(model.systemTimestampIso),
    readOnly: true,
  });
  card.appendChild(createField({ label: "Waktu Sistem (Read Only)", input: timeInput }));

  const reporterInput = createTextInput({
    value: model.reporterName,
    placeholder: "Nama pelapor",
  });
  reporterInput.addEventListener("input", () => onChange("reporterName", reporterInput.value));
  card.appendChild(createField({ label: "Nama Pelapor", input: reporterInput }));

  const shiftSelect = createSelect({ options: shiftOptions, value: model.shift });
  shiftSelect.addEventListener("change", () => onChange("shift", shiftSelect.value));
  card.appendChild(createField({ label: "Shift", input: shiftSelect }));

  container.appendChild(card);

  return {
    refreshTime(iso) {
      timeInput.value = formatLocalTime(iso);
    },
  };
}
