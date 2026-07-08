import { collapseSpaces, stripAccents } from "./text";
import { locationAliases } from "../aliases/locationAliases";
import { provinceByCity, communityByProvince, knownProvinces } from "../aliases/provinceMap";

const key = (s: string) => stripAccents(collapseSpaces(s).toLowerCase());
const titleCase = (s: string) =>
  collapseSpaces(s).split(" ").map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" ");

export type LocationResult = {
  city?: string;
  province?: string;
  autonomousCommunity?: string;
  warning?: string;
};

// Divide "Localidad, Provincia" | "Localidad (Provincia)" | "Localidad / provincia"
function splitResidence(raw: string): { cityPart: string; hint?: string } {
  const paren = raw.match(/^(.*?)\(([^)]+)\)/);
  if (paren) return { cityPart: paren[1], hint: paren[2] };
  const sep = raw.split(/\s*[,/]\s*|\s+-\s+/);
  if (sep.length >= 2) return { cityPart: sep[0], hint: sep[1] };
  return { cityPart: raw };
}

export function normalizeResidence(raw: unknown): LocationResult {
  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return { warning: "Residencia ausente" };
  }
  const rawStr = collapseSpaces(String(raw));
  const { cityPart, hint } = splitResidence(rawStr);

  let cityKey = key(cityPart);
  if (locationAliases[cityKey]) {
    const canon = locationAliases[cityKey];
    return finalize(canon, key(canon), hint, undefined);
  }

  const cityDisplay = titleCase(cityPart);
  return finalize(cityDisplay, cityKey, hint, undefined);
}

function finalize(cityDisplay: string, cityKey: string, hint: string | undefined, warn: string | undefined): LocationResult {
  let province: string | undefined;
  let warning = warn;

  // 1) pista explícita del usuario
  if (hint) {
    const hk = key(hint);
    const match = [...knownProvinces].find((p) => key(p) === hk);
    if (match) province = match;
    else if (provinceByCity[hk]) province = provinceByCity[hk];
  }
  // 2) por ciudad conocida
  if (!province && provinceByCity[cityKey]) province = provinceByCity[cityKey];

  const autonomousCommunity = province ? communityByProvince[province] : undefined;
  if (!province) warning = (warning ? warning + "; " : "") + "Provincia no determinada con seguridad";

  return { city: cityDisplay || undefined, province, autonomousCommunity, warning };
}
