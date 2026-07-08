const WEEKDAYS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

export function formatSpanishDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const wd = WEEKDAYS[dt.getUTCDay()];
  return `${wd}, ${d} de ${MONTHS[m - 1]}`;
}

// Convierte serial de Excel a partes de fecha UTC.
function excelSerialToParts(n: number) {
  const ms = Math.round((n - 25569) * 86400 * 1000);
  const dt = new Date(ms);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

function partsFromValue(value: unknown): { y: number; m: number; d: number } | null {
  if (value instanceof Date) {
    return { y: value.getUTCFullYear(), m: value.getUTCMonth() + 1, d: value.getUTCDate() };
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return excelSerialToParts(value);
  }
  const s = String(value).trim();
  // formatos m/d/yyyy o d/m/yyyy o yyyy-mm-dd
  let mtch = s.match(/^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})$/);
  if (mtch) {
    const a = Number(mtch[1]), b = Number(mtch[2]), c = Number(mtch[3]);
    // Excel suele exportar M/D/YYYY en estos formularios en inglés
    if (mtch[1].length === 4) return { y: a, m: b, d: c }; // yyyy-mm-dd
    return { y: c, m: a, d: b }; // m/d/yyyy
  }
  return null;
}

export type DateResult = {
  iso?: string;
  dayLabel?: string;
  warning?: string;
};

// Ventana plausible para Tomorrowland Belgium 2026 Weekend 1 (viaje de ida
// en junio-julio; nunca antes de 2026).
export function normalizeDepartureDate(value: unknown): DateResult {
  if (value === null || value === undefined || value === "") {
    return { warning: "Fecha ausente" };
  }
  const parts = partsFromValue(value);
  if (!parts) return { warning: "Fecha no reconocida" };

  let { y, m, d } = parts;
  let warning: string | undefined;

  // Excel a veces interpreta 2026 como 0026 (dos dígitos)
  if (y < 100) {
    if (y === 26) { y = 2026; warning = "Año 0026 corregido a 2026"; }
    else { y = 2000 + y; warning = `Año corregido a ${y}`; }
  }
  // 2025 en un formulario para 2026: se corrige conservando el original
  if (y === 2025) { y = 2026; warning = "Año 2025 corregido a 2026"; }

  // Fechas claramente corruptas (p.ej. 1979): no se infiere ISO
  if (y < 2026 || y > 2027) {
    return { warning: `Año incompatible (${y}); dato conservado sin normalizar` };
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return { warning: "Fecha fuera de rango" };
  }

  const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // Aviso si cae fuera de la franja típica del viaje (jun-jul 2026)
  if (!(y === 2026 && (m === 6 || m === 7))) {
    warning = (warning ? warning + "; " : "") + "Fecha fuera de la franja habitual del viaje";
  }

  return { iso, dayLabel: formatSpanishDate(iso), warning };
}

export function normalizeReturnDate(value: unknown): DateResult {
  // Misma lógica; la fecha de vuelta suele ser 20-28 julio 2026
  return normalizeDepartureDate(value);
}
