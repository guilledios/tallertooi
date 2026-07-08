const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createSessionCode(length = 6): string {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export function normalizeSessionCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}
