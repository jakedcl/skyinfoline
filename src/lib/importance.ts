/** Map skylineImportance (1–10) → visual presence. Never shown as a number. */
export function importancePresence(score?: number): number {
  const s = Math.min(10, Math.max(1, score ?? 5));
  // 1 → 0.52, 5 → 0.76, 10 → 1.0
  return 0.52 + ((s - 1) / 9) * 0.48;
}
