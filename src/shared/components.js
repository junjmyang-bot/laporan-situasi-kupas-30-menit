export function createField({ label, input }) {
  const wrap = document.createElement("div");
  wrap.className = "field";

  const labelEl = document.createElement("label");
  labelEl.className = "label";
  labelEl.textContent = label;
  wrap.append(labelEl, input);

  return wrap;
}

export function createTextInput({ value = "", readOnly = false, placeholder = "" } = {}) {
  const input = document.createElement("input");
  input.className = "input";
  input.type = "text";
  input.value = value;
  input.placeholder = placeholder;
  input.readOnly = readOnly;
  if (readOnly) input.classList.add("readonly");
  return input;
}

export function createNumberInput({ value = "", min = 0, placeholder = "" } = {}) {
  const input = document.createElement("input");
  input.className = "input";
  input.type = "number";
  input.value = value;
  input.min = String(min);
  input.placeholder = placeholder;
  input.inputMode = "numeric";
  return input;
}

export function createSelect({ options = [], value = "" } = {}) {
  const select = document.createElement("select");
  select.className = "select";
  for (const opt of options) {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    if (opt.value === value) o.selected = true;
    select.appendChild(o);
  }
  return select;
}

export function createTextarea({ value = "", placeholder = "" } = {}) {
  const ta = document.createElement("textarea");
  ta.className = "textarea";
  ta.value = value;
  ta.placeholder = placeholder;
  return ta;
}

export function createSubmitButton() {
  const button = document.createElement("button");
  button.className = "btn";
  button.type = "button";
  button.textContent = "Kirim Laporan";

  return {
    element: button,
    setState(state) {
      if (state === "sending") {
        button.disabled = true;
        button.textContent = "Mengirim...";
      } else if (state === "success") {
        button.disabled = false;
        button.textContent = "Kirim Lagi";
      } else {
        button.disabled = false;
        button.textContent = "Kirim Laporan";
      }
    },
  };
}

export function createCheckbox({ checked = false } = {}) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.style.width = "22px";
  input.style.height = "22px";
  return input;
}

export function createButton({ label, type = "button" }) {
  const button = document.createElement("button");
  button.type = type;
  button.textContent = label;
  button.className = "btn";
  button.style.minHeight = "40px";
  return button;
}
