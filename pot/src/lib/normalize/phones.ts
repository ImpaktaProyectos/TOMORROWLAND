export type PhoneResult = { e164?: string; valid: boolean; warning?: string };

// Los teléfonos SIEMPRE se tratan como texto. Recupera notación científica
// y flotantes de Excel (603130990.0), limpia separadores y conserva prefijos.
export function normalizePhone(raw: unknown): PhoneResult {
  if (raw === null || raw === undefined || raw === "") {
    return { valid: false, warning: "Teléfono ausente" };
  }

  let s: string;
  const rawStr = String(raw).trim();
  if (typeof raw === "number") {
    s = Number.isInteger(raw) ? String(raw) : raw.toFixed(0);
  } else {
    s = rawStr;
    if (/e\+?\d+/i.test(s.replace(/\s/g, ""))) {
      const n = Number(s.replace(/\s/g, "").replace(",", "."));
      if (Number.isFinite(n)) s = n.toFixed(0);
    }
  }

  const hadPlus = rawStr.startsWith("+");
  const hadZeros = rawStr.startsWith("00");
  let digits = s.replace(/\D/g, "");

  if (digits.length === 0 || Number(digits) === 0) {
    return { valid: false, warning: "Teléfono vacío o inválido" };
  }

  if (digits.startsWith("00")) digits = digits.slice(2);

  // Español: 9 cifras empezando por 6/7/8/9
  if (digits.length === 9 && /^[6789]/.test(digits)) {
    return { e164: "+34" + digits, valid: true };
  }

  // 34 + 9 cifras
  if (digits.length === 11 && digits.startsWith("34") && /^[6789]/.test(digits.slice(2))) {
    return { e164: "+34" + digits.slice(2), valid: true };
  }

  // Prefijo internacional explícito (llevaba + o 00): confiamos si 8-15 dígitos
  if ((hadPlus || hadZeros) && digits.length >= 8 && digits.length <= 15) {
    return { e164: "+" + digits, valid: true, warning: "Número internacional" };
  }

  return { valid: false, warning: `Teléfono ambiguo o incompleto (${digits.length} dígitos)` };
}

// Devuelve solo los dígitos sin '+' para el enlace wa.me
export function toWaNumber(e164: string): string {
  return e164.replace(/\D/g, "");
}
