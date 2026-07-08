export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function collapseSpaces(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

// Nombre visible: conserva tildes y mayúsculas del usuario, solo limpia espacios.
export function cleanDisplayName(raw: string): string {
  return collapseSpaces(raw);
}

// Clave de búsqueda: minúsculas, sin tildes, sin espacios extra.
export function normalizeForSearch(raw: string): string {
  return stripAccents(collapseSpaces(raw).toLowerCase());
}

// Escapa cualquier contenido antes de usarlo en la UI (defensa extra;
// React ya escapa, pero neutralizamos valores técnicos).
export function safeText(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s === "undefined" || s === "null" || s === "NaN") return "";
  return s;
}
