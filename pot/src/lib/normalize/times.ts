export type TimeResult = { time?: string; minutes?: number; warning?: string };

// Normaliza a formato 24h "HH:MM" y minutos desde medianoche.
// Acepta Date, fracción de día de Excel (0.264...), o texto "6:20"/"18.35".
export function normalizeTime(value: unknown): TimeResult {
  if (value === null || value === undefined || value === "") {
    return { warning: "Hora ausente" };
  }

  let h: number | null = null;
  let min: number | null = null;

  if (value instanceof Date) {
    h = value.getUTCHours();
    min = value.getUTCMinutes();
  } else if (typeof value === "number" && Number.isFinite(value)) {
    // fracción de día
    const frac = value >= 1 ? value - Math.floor(value) : value;
    const total = Math.round(frac * 24 * 60);
    h = Math.floor(total / 60) % 24;
    min = total % 60;
  } else {
    const s = String(value).trim();
    const m = s.match(/^(\d{1,2})[:.hH ](\d{1,2})/);
    if (m) { h = Number(m[1]); min = Number(m[2]); }
    else {
      const only = s.match(/^(\d{1,2})\s*h?$/);
      if (only) { h = Number(only[1]); min = 0; }
    }
  }

  if (h === null || min === null || Number.isNaN(h) || Number.isNaN(min) || h > 23 || min > 59) {
    return { warning: "Hora no reconocida" };
  }

  const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  return { time, minutes: h * 60 + min };
}
