export function getSystemIsoTime() {
  return new Date().toISOString();
}

export function formatLocalTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString("id-ID", { hour12: false });
}
