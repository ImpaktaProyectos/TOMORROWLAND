// SOLO SERVIDOR. No importar desde componentes de cliente.
import Fuse from "fuse.js";
import travelersJson from "./travelers.server.json";
import type { Traveler, TravelerPublic } from "./types";
import { scoreMatch, matchLabel } from "./matching";
import { normalizeForSearch } from "./normalize/text";

const ALL = travelersJson as unknown as Traveler[];

export function getAllTravelers(): Traveler[] {
  return ALL;
}

export function toPublic(t: Traveler): TravelerPublic {
  return {
    id: t.id,
    displayName: t.displayName,
    city: t.city,
    province: t.province,
    autonomousCommunity: t.autonomousCommunity,
    departureCity: t.departureCity,
    departureAirport: t.departureAirport,
    departureIata: t.departureIata,
    departureDate: t.departureDate,
    departureDayLabel: t.departureDayLabel,
    departureTime: t.departureTime,
    departureMinutes: t.departureMinutes,
    returnDate: t.returnDate,
    airline: t.airline,
    flightNumber: t.flightNumber,
    destinationAirport: t.destinationAirport,
    travelOperator: t.travelOperatorRaw,
    dreamvilleZone: t.dreamvilleZone,
    instagram: t.instagram,
    hasWhatsapp: t.phoneValid,
  };
}

const fuse = new Fuse(ALL, {
  keys: [
    { name: "normalizedName", weight: 0.6 },
    { name: "city", weight: 0.2 },
    { name: "province", weight: 0.1 },
    { name: "departureCity", weight: 0.1 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

export type QueryParams = {
  search?: string;
  city?: string;
  province?: string;
  departure?: string; // ciudad o IATA
  date?: string;
  time?: string; // "HH:MM"
  timeTolerance?: number; // minutos
  dreamville?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

function timeToMinutes(t?: string): number | undefined {
  if (!t) return undefined;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return undefined;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function queryTravelers(params: QueryParams) {
  let list: Traveler[] = ALL;

  if (params.search && params.search.trim()) {
    const q = normalizeForSearch(params.search);
    list = fuse.search(q).map((r) => r.item);
  }

  const active: Record<string, string> = {};
  const eq = (a?: string, b?: string) => a && b && a.toLowerCase() === b.toLowerCase();

  if (params.city) { list = list.filter((t) => eq(t.city, params.city)); active.city = params.city; }
  if (params.province) { list = list.filter((t) => eq(t.province, params.province)); active.province = params.province; }
  if (params.departure) {
    list = list.filter((t) => eq(t.departureIata, params.departure) || eq(t.departureCity, params.departure));
    active.departure = params.departure;
  }
  if (params.date) { list = list.filter((t) => t.departureDate === params.date); active.date = params.date; }
  if (params.dreamville) { list = list.filter((t) => eq(t.dreamvilleZone, params.dreamville)); active.dreamville = params.dreamville; }

  const targetMin = timeToMinutes(params.time);
  if (targetMin !== undefined) {
    const tol = params.timeTolerance ?? 0;
    list = list.filter((t) => t.departureMinutes !== undefined && Math.abs(t.departureMinutes - targetMin) <= tol);
    active.time = params.time!;
    if (tol) active.timeTolerance = String(tol);
  }

  const sort = params.sort ?? "name";
  const cmp: Record<string, (a: Traveler, b: Traveler) => number> = {
    name: (a, b) => a.normalizedName.localeCompare(b.normalizedName),
    earliest: (a, b) => (a.departureMinutes ?? 1e9) - (b.departureMinutes ?? 1e9),
    latest: (a, b) => (b.departureMinutes ?? -1) - (a.departureMinutes ?? -1),
    date: (a, b) => (a.departureDate ?? "9999").localeCompare(b.departureDate ?? "9999"),
  };
  if (cmp[sort]) list = [...list].sort(cmp[sort]);

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(300, Math.max(1, params.limit ?? 300));
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const pageItems = list.slice(start, start + limit).map(toPublic);

  return {
    results: pageItems,
    pagination: { page, limit, total, totalPages },
    activeFilters: active,
  };
}

export function getById(id: string): Traveler | undefined {
  return ALL.find((t) => t.id === id);
}

export function getRelated(id: string, limit = 12): TravelerPublic[] {
  const me = getById(id);
  if (!me) return [];
  const scored = ALL.filter((t) => t.id !== id)
    .map((t) => {
      const score = scoreMatch(me, t);
      return { t, score };
    })
    .filter((x) => x.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map(({ t, score }) => ({
    ...toPublic(t),
    matchScore: score,
    matchLabel: matchLabel(score, Boolean(me.flightNumber && t.flightNumber)),
  }));
}

export function getOptions() {
  const uniq = (arr: (string | undefined)[]) =>
    [...new Set(arr.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
  return {
    cities: uniq(ALL.map((t) => t.city)),
    provinces: uniq(ALL.map((t) => t.province)),
    departures: uniq(ALL.map((t) => t.departureCity)),
    dates: uniq(ALL.map((t) => t.departureDate)),
    dreamville: uniq(ALL.map((t) => t.dreamvilleZone)),
  };
}

export function getStats() {
  const departures = new Set(ALL.map((t) => t.departureIata || t.departureCity).filter(Boolean));
  const dreamville = new Set(ALL.map((t) => t.dreamvilleZone).filter((z) => z && z !== "Sin especificar"));
  const dates = [...new Set(ALL.map((t) => t.departureDate).filter(Boolean) as string[])].sort();
  const today = new Date().toISOString().slice(0, 10);
  const nextDate = dates.find((d) => d >= today) ?? dates[0];
  const nextLabel = ALL.find((t) => t.departureDate === nextDate)?.departureDayLabel;
  return {
    people: ALL.length,
    departures: departures.size,
    dreamvilleZones: dreamville.size,
    nextDeparture: nextDate,
    nextDepartureLabel: nextLabel,
  };
}

// ---- DreamVille ----
export function getDreamvilleZones() {
  const counts = new Map<string, number>();
  for (const t of ALL) {
    const z = t.dreamvilleZone;
    if (!z || z === "Sin especificar") continue;
    counts.set(z, (counts.get(z) ?? 0) + 1);
  }
  return [...counts.entries()].map(([zone, count]) => ({ zone, count })).sort((a, b) => b.count - a.count);
}

export function getDreamvilleDetail(zone: string) {
  const people = ALL.filter((t) => t.dreamvilleZone === zone);
  const top = (arr: (string | undefined)[]) => {
    const m = new Map<string, number>();
    for (const v of arr) if (v) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  };
  return {
    zone,
    count: people.length,
    people: people.map(toPublic).sort((a, b) => a.displayName.localeCompare(b.displayName)),
    topDates: top(people.map((t) => t.departureDayLabel)),
    topDepartures: top(people.map((t) => t.departureCity)),
  };
}
