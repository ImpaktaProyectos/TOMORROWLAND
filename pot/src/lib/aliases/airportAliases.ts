// Alias EDITABLE ciudad/aeropuerto de salida -> { ciudad canónica, IATA }.
// Solo se asigna IATA cuando la ciudad tiene un aeropuerto principal inequívoco.
// Claves normalizadas (minúsculas sin tildes).
export type AirportAlias = { city: string; iata?: string };

export const airportAliases: Record<string, AirportAlias> = {
  madrid: { city: "Madrid", iata: "MAD" },
  barcelona: { city: "Barcelona", iata: "BCN" },
  malaga: { city: "Málaga", iata: "AGP" },
  alicante: { city: "Alicante", iata: "ALC" },
  valencia: { city: "Valencia", iata: "VLC" },
  bilbao: { city: "Bilbao", iata: "BIO" },
  sevilla: { city: "Sevilla", iata: "SVQ" },
  "a coruna": { city: "A Coruña", iata: "LCG" },
  vitoria: { city: "Vitoria", iata: "VIT" },
  murcia: { city: "Murcia", iata: "RMU" },
  oporto: { city: "Oporto", iata: "OPO" },
  "o porto": { city: "Oporto", iata: "OPO" },
  amsterdam: { city: "Ámsterdam", iata: "AMS" },
  munich: { city: "Múnich", iata: "MUC" },
  frankfurt: { city: "Frankfurt", iata: "FRA" },
  dublin: { city: "Dublín", iata: "DUB" },
  bruselas: { city: "Bruselas", iata: "BRU" },
  leuven: { city: "Lovaina (coche)" },
  lugo: { city: "Lugo" },
  paris: { city: "París" }, // CDG/ORY: no se asigna IATA (ambiguo)
  tenerife: { city: "Tenerife" }, // TFN/TFS: ambiguo
  canarias: { city: "Canarias" },
  "islas baleares": { city: "Islas Baleares" },
  "palma de mallorca": { city: "Palma de Mallorca", iata: "PMI" },
  sevila: { city: "Sevilla", iata: "SVQ" },
};
