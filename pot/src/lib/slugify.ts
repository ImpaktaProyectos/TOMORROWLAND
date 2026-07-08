import { stripAccents } from "./normalize/text";

export function slugify(s: string): string {
  return stripAccents(s.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ID estable: slug del nombre + fila (para que no colisione entre homónimos).
export function makeStableId(displayName: string, sourceRow: number): string {
  const base = slugify(displayName) || "persona";
  return `${base}-${sourceRow}`;
}
