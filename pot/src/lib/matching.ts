import type { Traveler, TravelerPublic } from "./types";

export const MATCH_WEIGHTS = {
  sameAirport: 25,
  sameDate: 25,
  sameExactTime: 30,
  within30: 20,
  within60: 10,
  sameDreamville: 15,
  sameProvince: 5,
};

export function scoreMatch(a: Traveler | TravelerPublic, b: Traveler | TravelerPublic): number {
  let score = 0;
  const aIata = (a as any).departureIata, bIata = (b as any).departureIata;
  const aCity = a.departureCity, bCity = b.departureCity;
  if ((aIata && bIata && aIata === bIata) || (aCity && bCity && aCity === bCity)) score += MATCH_WEIGHTS.sameAirport;

  if (a.departureDate && b.departureDate && a.departureDate === b.departureDate) score += MATCH_WEIGHTS.sameDate;

  if (a.departureMinutes != null && b.departureMinutes != null) {
    const diff = Math.abs(a.departureMinutes - b.departureMinutes);
    if (diff === 0) score += MATCH_WEIGHTS.sameExactTime;
    else if (diff <= 30) score += MATCH_WEIGHTS.within30;
    else if (diff <= 60) score += MATCH_WEIGHTS.within60;
  }

  if (a.dreamvilleZone && b.dreamvilleZone && a.dreamvilleZone === b.dreamvilleZone &&
      a.dreamvilleZone !== "Sin especificar") score += MATCH_WEIGHTS.sameDreamville;

  if (a.province && b.province && a.province === b.province) score += MATCH_WEIGHTS.sameProvince;

  return score;
}

// No afirmamos "mismo vuelo" sin nº de vuelo: usamos etiquetas prudentes.
export function matchLabel(score: number, hasFlightNumber = false): string {
  if (score >= 80) return "Coincidencia total";
  if (score >= 60) return hasFlightNumber ? "Mismo vuelo probable" : "Misma salida y horario";
  if (score >= 40) return "Misma salida";
  if (score >= 20) return "Coincidencia parcial";
  return "Otra persona del viaje";
}
