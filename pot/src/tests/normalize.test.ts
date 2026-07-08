import { describe, it, expect } from "vitest";
import { normalizeForSearch, cleanDisplayName } from "../lib/normalize/text";
import { normalizePhone, toWaNumber } from "../lib/normalize/phones";
import { normalizeDepartureDate } from "../lib/normalize/dates";
import { normalizeTime } from "../lib/normalize/times";
import { normalizeResidence } from "../lib/normalize/locations";
import { normalizeDeparture } from "../lib/normalize/airports";
import { normalizeDreamville } from "../lib/normalize/dreamville";

describe("nombres", () => {
  it("colapsa espacios y conserva tildes en el visible", () => {
    expect(cleanDisplayName("  Iñigo   Fadrique ")).toBe("Iñigo Fadrique");
  });
  it("clave de búsqueda sin tildes ni mayúsculas", () => {
    expect(normalizeForSearch("Málaga")).toBe("malaga");
  });
});

describe("teléfonos", () => {
  it("recupera flotante de Excel a +34", () => {
    expect(normalizePhone(603130990).e164).toBe("+34603130990");
  });
  it("limpia espacios de 9 cifras", () => {
    expect(normalizePhone("622 71 06 88 ").e164).toBe("+34622710688");
  });
  it("mantiene +34 existente", () => {
    expect(normalizePhone("+34607865220").e164).toBe("+34607865220");
  });
  it("expande 0034 a +34", () => {
    expect(normalizePhone("0034669373946").e164).toBe("+34669373946");
  });
  it("conserva prefijo internacional", () => {
    expect(normalizePhone("+48601993316").e164).toBe("+48601993316");
  });
  it("marca inválido el 0", () => {
    expect(normalizePhone(0).valid).toBe(false);
  });
  it("wa.me sin +", () => {
    expect(toWaNumber("+34607865220")).toBe("34607865220");
  });
});

describe("fechas mal interpretadas por Excel", () => {
  it("0026 -> 2026", () => {
    const r = normalizeDepartureDate("7/16/0026");
    expect(r.iso).toBe("2026-07-16");
    expect(r.warning).toMatch(/0026/);
  });
  it("2025 -> 2026 con aviso", () => {
    const r = normalizeDepartureDate(new Date(Date.UTC(2025, 6, 16)));
    expect(r.iso).toBe("2026-07-16");
    expect(r.warning).toMatch(/2025/);
  });
  it("1979 se conserva sin normalizar", () => {
    const r = normalizeDepartureDate(new Date(Date.UTC(1979, 6, 17)));
    expect(r.iso).toBeUndefined();
    expect(r.warning).toMatch(/incompatible/);
  });
  it("etiqueta en español", () => {
    expect(normalizeDepartureDate(new Date(Date.UTC(2026, 6, 16))).dayLabel).toContain("julio");
  });
});

describe("horas", () => {
  it("fracción de día -> HH:MM y minutos", () => {
    const r = normalizeTime(6.5 / 24);
    expect(r.time).toBe("06:30"); expect(r.minutes).toBe(390);
  });
  it("texto 6:20", () => {
    expect(normalizeTime("6:20").minutes).toBe(380);
  });
});

describe("localidades y aeropuertos", () => {
  it("provincia por ciudad conocida", () => {
    const r = normalizeResidence("Madrid");
    expect(r.province).toBe("Madrid");
    expect(r.autonomousCommunity).toBe("Comunidad de Madrid");
  });
  it("extrae provincia entre paréntesis", () => {
    expect(normalizeResidence("Valdeganga (Albacete)").province).toBe("Albacete");
  });
  it("alias de aeropuerto asigna IATA", () => {
    expect(normalizeDeparture("Málaga ").departureIata).toBe("AGP");
  });
  it("no asigna IATA a ciudad ambigua (París)", () => {
    expect(normalizeDeparture("Paris").departureIata).toBeUndefined();
  });
});

describe("dreamville", () => {
  it("Verdes Magníficos -> Magnificent Greens", () => {
    expect(normalizeDreamville("Verdes Magníficos (MG)", "Dreamville").zone).toBe("Magnificent Greens");
  });
  it("broma de hotel -> Hotel", () => {
    expect(normalizeDreamville("Que ya te he dicho que voy a hotel... :-)", "Hotel").zone).toBe("Hotel");
  });
  it("prefiere zona real sobre hotel", () => {
    expect(normalizeDreamville("Que ya te he dicho que voy a hotel... :-)", "Easy Tent").zone).toBe("Easy Tent");
  });
});
