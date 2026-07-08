import { collapseSpaces, stripAccents } from "./text";
import { airportAliases } from "../aliases/airportAliases";

const key = (s: string) => stripAccents(collapseSpaces(s).toLowerCase());
const titleCase = (s: string) =>
  collapseSpaces(s).split(" ").map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" ");

export type DepartureResult = {
  departureCity?: string;
  departureAirport?: string;
  departureIata?: string;
  warning?: string;
};

const NON_CITY = new Set(["aun no se", "tomorrowland w1", "espana", "por determinar"]);

export function normalizeDeparture(raw: unknown): DepartureResult {
  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return { warning: "Salida ausente" };
  }
  const rawStr = collapseSpaces(String(raw));
  // limpia sufijos "- España", ", España"
  const base = rawStr.replace(/\s*[-,]\s*espa(ñ|n)a\s*$/i, "").trim();
  const k = key(base);

  if (NON_CITY.has(k)) {
    return { warning: "Ciudad de salida sin especificar" };
  }

  const alias = airportAliases[k];
  if (alias) {
    return {
      departureCity: alias.city,
      departureIata: alias.iata,
      departureAirport: alias.iata ? alias.city : undefined,
      warning: alias.iata ? undefined : "Aeropuerto no asignado (ambiguo o múltiple)",
    };
  }

  return {
    departureCity: titleCase(base),
    warning: "Aeropuerto no reconocido; ciudad conservada tal cual",
  };
}
