import { collapseSpaces, stripAccents } from "./text";
import { dreamvilleMatchers, DreamvilleZone } from "../aliases/dreamvilleAliases";

const key = (s: string) => stripAccents(collapseSpaces(s).toLowerCase());

// Combina la columna "Zona Dreamville" con "¿Dónde recargas pilas?".
// Si la zona indica hotel pero el otro campo apunta a una zona real, se usa esa.
export function normalizeDreamville(zoneRaw: unknown, rechargeRaw: unknown): {
  zone?: DreamvilleZone;
  warning?: string;
} {
  const z = zoneRaw ? key(String(zoneRaw)) : "";
  const r = rechargeRaw ? key(String(rechargeRaw)) : "";

  const fromZone = z ? dreamvilleMatchers.find((m) => m.test(z))?.zone : undefined;
  const fromRecharge = r ? dreamvilleMatchers.find((m) => m.test(r))?.zone : undefined;

  // Preferimos una zona de camping real sobre "Hotel"
  const realZones: DreamvilleZone[] = ["Magnificent Greens", "Easy Tent", "Camp2Camp", "Montagoe", "Friendship Garden"];
  let zone = fromZone;
  if ((!zone || zone === "Hotel") && fromRecharge && realZones.includes(fromRecharge)) {
    zone = fromRecharge;
  }
  if (!zone && fromRecharge) zone = fromRecharge;

  if (!zone) return { zone: "Sin especificar", warning: "Zona DreamVille sin especificar" };
  return { zone };
}
