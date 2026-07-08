// Alias EDITABLE de zonas DreamVille -> categoría canónica.
// Clave normalizada (minúsculas sin tildes).
export const DREAMVILLE_ZONES = [
  "Magnificent Greens",
  "Easy Tent",
  "Camp2Camp",
  "Montagoe",
  "Friendship Garden",
  "Hotel",
  "Sin especificar",
] as const;

export type DreamvilleZone = (typeof DREAMVILLE_ZONES)[number];

// Coincidencias sobre el texto normalizado (se usa "incluye").
export const dreamvilleMatchers: { test: (s: string) => boolean; zone: DreamvilleZone }[] = [
  { test: (s) => s.includes("verdes magnificos") || s.includes("magnificent") || /\bmg\b/.test(s), zone: "Magnificent Greens" },
  { test: (s) => s.includes("easy tent") || s.includes("easytent"), zone: "Easy Tent" },
  { test: (s) => s.includes("camp 2 camp") || s.includes("camp2camp"), zone: "Camp2Camp" },
  { test: (s) => s.includes("montagoe"), zone: "Montagoe" },
  { test: (s) => s.includes("friendship"), zone: "Friendship Garden" },
  { test: (s) => s.includes("hotel") || s.includes("airbnb") || s.includes("apartament") || s.includes("hostel") || s.includes("casa"), zone: "Hotel" },
];
