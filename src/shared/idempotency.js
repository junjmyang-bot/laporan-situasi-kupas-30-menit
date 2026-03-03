const STORAGE_KEY = "field-report:pending-submission";

export function loadPendingSubmission() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePendingSubmission(item) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(item));
}

export function clearPendingSubmission() {
  localStorage.removeItem(STORAGE_KEY);
}

export function buildSubmissionKey() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return `k-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
