export function normalizeTelefone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function maskTelefone(normalizado: string): string {
  if (!normalizado) {
    return "";
  }
  const visible = normalizado.slice(-4);
  return `${"*".repeat(Math.max(0, normalizado.length - 4))}${visible}`;
}
