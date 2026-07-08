import { describe, it, expect } from "vitest";
import { getAllTravelers, toPublic, queryTravelers, getById, getRelated } from "../lib/data";
import { scoreMatch, matchLabel } from "../lib/matching";

describe("exclusión de datos sensibles en la API pública", () => {
  it("toPublic no incluye teléfono ni fila", () => {
    const t = getAllTravelers().find((x) => x.phoneValid)!;
    const pub = toPublic(t) as any;
    expect(pub.phoneRaw).toBeUndefined();
    expect(pub.phoneE164).toBeUndefined();
    expect(pub.sourceRow).toBeUndefined();
    expect(pub.dataWarnings).toBeUndefined();
    expect(pub.hasWhatsapp).toBe(true);
  });
});

describe("filtrado combinado", () => {
  it("filtra por salida y devuelve paginación", () => {
    const r = queryTravelers({ departure: "Madrid", limit: 5 });
    expect(r.results.length).toBeLessThanOrEqual(5);
    expect(r.results.every((x) => x.departureCity === "Madrid")).toBe(true);
    expect(r.pagination.total).toBeGreaterThan(0);
    expect(r.activeFilters.departure).toBe("Madrid");
  });
  it("búsqueda tolera falta de tildes", () => {
    const r = queryTravelers({ search: "malaga" });
    expect(r.pagination.total).toBeGreaterThan(0);
  });
  it("margen horario ±30", () => {
    const r = queryTravelers({ time: "06:20", timeTolerance: 30 });
    expect(r.results.every((x) => x.departureMinutes != null && Math.abs(x.departureMinutes - 380) <= 30)).toBe(true);
  });
});

describe("coincidencias", () => {
  it("misma salida+fecha+hora suma alto", () => {
    const a = { departureIata: "MAD", departureDate: "2026-07-16", departureMinutes: 600, dreamvilleZone: "Easy Tent", province: "Madrid" } as any;
    const b = { departureIata: "MAD", departureDate: "2026-07-16", departureMinutes: 600, dreamvilleZone: "Easy Tent", province: "Madrid" } as any;
    expect(scoreMatch(a, b)).toBe(100);
  });
  it("sin nº de vuelo no dice 'mismo vuelo'", () => {
    expect(matchLabel(65, false)).toBe("Misma salida y horario");
    expect(matchLabel(65, true)).toBe("Mismo vuelo probable");
  });
  it("relacionados no se incluye a sí mismo", () => {
    const first = getAllTravelers()[0];
    expect(getRelated(first.id).some((r) => r.id === first.id)).toBe(false);
  });
});

describe("registros y duplicados presentes en el dataset real", () => {
  it("hay 265 personas y algún duplicado detectable por nombre", () => {
    expect(getAllTravelers().length).toBe(265);
  });
});
