/**
 * Maps a 0-based option index to a letter label: A…Z, then AA, AB… (Excel-style columns).
 */
export function getMultipleChoiceLetter(index: number): string {
  const safe = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  let n = safe + 1;
  let result = "";
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}
