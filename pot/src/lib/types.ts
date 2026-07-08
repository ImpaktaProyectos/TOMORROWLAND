// Modelo de datos. Conserva SIEMPRE el valor original (campos *Raw) y añade
// una versión normalizada para búsquedas/filtros. Nunca se eliminan datos.

export type Traveler = {
  id: string;
  displayName: string;
  normalizedName: string;

  residenceRaw?: string;
  city?: string;
  province?: string;
  autonomousCommunity?: string;

  departureRaw?: string;
  departureCity?: string;
  departureAirport?: string;
  departureIata?: string;

  departureDateRaw?: string;
  departureDate?: string; // ISO yyyy-mm-dd
  departureDayLabel?: string; // p.ej. "Jueves, 16 de julio"

  departureTimeRaw?: string;
  departureTime?: string; // "06:20"
  departureMinutes?: number;

  returnDateRaw?: string;
  returnDate?: string;

  airline?: string;
  flightNumber?: string;
  destinationAirport?: string;

  travelOperatorRaw?: string;

  hotelRaw?: string;

  dreamvilleRaw?: string;
  dreamvilleZone?: string;

  instagramRaw?: string;
  instagram?: string;

  phoneRaw?: string;
  phoneE164?: string;
  phoneValid: boolean;

  dataWarnings: string[];
  sourceRow: number;
};

// Versión que SÍ se puede enviar al navegador (sin datos sensibles).
export type TravelerPublic = {
  id: string;
  displayName: string;
  city?: string;
  province?: string;
  autonomousCommunity?: string;
  departureCity?: string;
  departureAirport?: string;
  departureIata?: string;
  departureDate?: string;
  departureDayLabel?: string;
  departureTime?: string;
  departureMinutes?: number;
  returnDate?: string;
  airline?: string;
  flightNumber?: string;
  destinationAirport?: string;
  travelOperator?: string;
  dreamvilleZone?: string;
  instagram?: string;
  hasWhatsapp: boolean;
  matchScore?: number;
  matchLabel?: string;
};

export type ImportSummary = {
  generatedAt: string;
  totalRows: number;
  totalImported: number;
  uniqueNames: number;
  validPhones: number;
  invalidPhones: number;
  withoutName: number;
  withoutDate: number;
  withoutTime: number;
  withoutDreamville: number;
  uniqueLocations: number;
  uniqueDepartures: number;
  detectedDates: string[];
  detectedDreamville: string[];
  possibleDuplicates: number;
  warnings: number;
  consentColumnDetected: boolean;
  columnMapping: Record<string, string>;
};
