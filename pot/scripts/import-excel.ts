process.env.TZ = "UTC";
import * as XLSX from "xlsx";
import * as fs from "node:fs";
import * as path from "node:path";
import { cleanDisplayName, normalizeForSearch, collapseSpaces } from "../src/lib/normalize/text";
import { normalizePhone } from "../src/lib/normalize/phones";
import { normalizeDepartureDate, normalizeReturnDate } from "../src/lib/normalize/dates";
import { normalizeTime } from "../src/lib/normalize/times";
import { normalizeResidence } from "../src/lib/normalize/locations";
import { normalizeDeparture } from "../src/lib/normalize/airports";
import { normalizeDreamville } from "../src/lib/normalize/dreamville";
import { makeStableId } from "../src/lib/slugify";
import type { Traveler, ImportSummary } from "../src/lib/types";

const COLUMN_KEYWORDS: Record<string, string[]> = {
  timestamp: ["marca temporal"],
  name: ["nombre y apellidos", "apodo", "nickname"],
  residence: ["donde vives", "dónde vives"],
  departureDate: ["que dia viajas", "qué día viajas", "dia viajas"],
  departure: ["desde donde viajas", "desde dónde viajas"],
  departureTime: ["hora del vuelo"],
  recharge: ["recargar pilas"],
  hotel: ["nombre hotel"],
  dreamville: ["zona dreamville", "dreamville"],
  travelOperator: ["como viajas", "cómo viajas"],
  returnDate: ["se acaba el sueno", "comienza depresion", "depresión"],
  instagram: ["instagram", "redes sociales"],
  phone: ["numero movil", "número móvil", "whatsapp"],
  consent: ["consentimiento", "consentimiento", "autorizo", "autorizacion", "autorización", "compartir mis datos"],
};

function detectColumns(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => {
    const hn = collapseSpaces(String(h || "")).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const [field, kws] of Object.entries(COLUMN_KEYWORDS)) {
      if (map[field] !== undefined) continue;
      if (kws.some((k) => hn.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) map[field] = i;
    }
  });
  return map;
}

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function main() {
  const file = process.argv[2] || "./Tomorrowland_2026_W1__respuestas_.xlsx";
  if (!fs.existsSync(file)) {
    console.error(`✖ No se encuentra el Excel: ${file}`);
    process.exit(1);
  }
  const wb = XLSX.readFile(file, { cellDates: false });
  const sheetName = wb.SheetNames.find((n) => (wb.Sheets[n]["!ref"]?.length ?? 0) > 0) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const range = XLSX.utils.decode_range(ws["!ref"]!);

  const cell = (r: number, c: number) => {
    const addr = XLSX.utils.encode_cell({ r, c });
    return ws[addr];
  };
  const rawVal = (r: number, c: number) => (cell(r, c) ? (cell(r, c) as any).v : undefined);
  const dispVal = (r: number, c: number) => {
    const cl = cell(r, c) as any;
    if (!cl) return undefined;
    return cl.w !== undefined ? String(cl.w) : cl.v !== undefined ? String(cl.v) : undefined;
  };

  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) headers.push(String(rawVal(range.s.r, c) ?? ""));
  const cols = detectColumns(headers);

  const columnMapping: Record<string, string> = {};
  for (const [field, idx] of Object.entries(cols)) columnMapping[field] = headers[idx];

  const travelers: Traveler[] = [];
  const invalidRecords: any[] = [];
  let withoutName = 0, withoutDate = 0, withoutTime = 0, withoutDreamville = 0;

  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    // fila vacía
    const anyVal = headers.some((_, c) => {
      const v = rawVal(r, c);
      return v !== undefined && v !== null && String(v).trim() !== "";
    });
    if (!anyVal) continue;

    const sourceRow = r + 1; // 1-indexed como en Excel
    const warnings: string[] = [];

    const nameRaw = cols.name !== undefined ? dispVal(r, cols.name) : undefined;
    if (!nameRaw || nameRaw.trim() === "") {
      withoutName++;
      invalidRecords.push({ sourceRow, motivo: "Sin nombre", valor: nameRaw ?? "" });
      warnings.push("Registro sin nombre");
    }
    const displayName = nameRaw ? cleanDisplayName(nameRaw) : `(sin nombre) fila ${sourceRow}`;

    const res = normalizeResidence(cols.residence !== undefined ? dispVal(r, cols.residence) : undefined);
    if (res.warning) warnings.push(res.warning);

    const depRawVal = cols.departure !== undefined ? dispVal(r, cols.departure) : undefined;
    const dep = normalizeDeparture(depRawVal);
    if (dep.warning) warnings.push(dep.warning);

    const dDate = normalizeDepartureDate(cols.departureDate !== undefined ? rawVal(r, cols.departureDate) : undefined);
    if (dDate.warning) warnings.push(dDate.warning);
    if (!dDate.iso) withoutDate++;

    const dTime = normalizeTime(cols.departureTime !== undefined ? rawVal(r, cols.departureTime) : undefined);
    if (dTime.warning) warnings.push(dTime.warning);
    if (!dTime.time) withoutTime++;

    const rDate = normalizeReturnDate(cols.returnDate !== undefined ? rawVal(r, cols.returnDate) : undefined);

    const dv = normalizeDreamville(
      cols.dreamville !== undefined ? dispVal(r, cols.dreamville) : undefined,
      cols.recharge !== undefined ? dispVal(r, cols.recharge) : undefined,
    );
    if (dv.warning) warnings.push(dv.warning);
    if (!dv.zone || dv.zone === "Sin especificar") withoutDreamville++;

    const phoneRaw = cols.phone !== undefined ? rawVal(r, cols.phone) : undefined;
    const phone = normalizePhone(phoneRaw);
    if (!phone.valid && phone.warning) warnings.push(phone.warning);

    let instagram = cols.instagram !== undefined ? dispVal(r, cols.instagram) : undefined;
    if (instagram) instagram = collapseSpaces(instagram).replace(/^@/, "").trim() || undefined;

    const t: Traveler = {
      id: makeStableId(displayName, sourceRow),
      displayName,
      normalizedName: normalizeForSearch(displayName),
      residenceRaw: cols.residence !== undefined ? dispVal(r, cols.residence) : undefined,
      city: res.city,
      province: res.province,
      autonomousCommunity: res.autonomousCommunity,
      departureRaw: depRawVal,
      departureCity: dep.departureCity,
      departureAirport: dep.departureAirport,
      departureIata: dep.departureIata,
      departureDateRaw: cols.departureDate !== undefined ? dispVal(r, cols.departureDate) : undefined,
      departureDate: dDate.iso,
      departureDayLabel: dDate.dayLabel,
      departureTimeRaw: cols.departureTime !== undefined ? dispVal(r, cols.departureTime) : undefined,
      departureTime: dTime.time,
      departureMinutes: dTime.minutes,
      returnDateRaw: cols.returnDate !== undefined ? dispVal(r, cols.returnDate) : undefined,
      returnDate: rDate.iso,
      airline: undefined,
      flightNumber: undefined,
      destinationAirport: undefined,
      travelOperatorRaw: cols.travelOperator !== undefined ? dispVal(r, cols.travelOperator) : undefined,
      hotelRaw: cols.hotel !== undefined ? dispVal(r, cols.hotel) : undefined,
      dreamvilleRaw: cols.dreamville !== undefined ? dispVal(r, cols.dreamville) : undefined,
      dreamvilleZone: dv.zone,
      instagramRaw: cols.instagram !== undefined ? dispVal(r, cols.instagram) : undefined,
      instagram,
      phoneRaw: phoneRaw !== undefined ? String(phoneRaw) : undefined,
      phoneE164: phone.e164,
      phoneValid: phone.valid,
      dataWarnings: warnings,
      sourceRow,
    };
    travelers.push(t);
    if (!phone.valid) {
      invalidRecords.push({ sourceRow, nombre: displayName, motivo: phone.warning ?? "Teléfono inválido", telefonoRaw: t.phoneRaw ?? "" });
    }
  }

  // ---- Duplicados ----
  const dupGroups: any[] = [];
  const byPhone = new Map<string, Traveler[]>();
  for (const t of travelers) {
    if (t.phoneValid && t.phoneE164) {
      const arr = byPhone.get(t.phoneE164) ?? [];
      arr.push(t); byPhone.set(t.phoneE164, arr);
    }
  }
  for (const [phone, arr] of byPhone) {
    if (arr.length > 1) {
      dupGroups.push({ motivo: "Mismo teléfono", confianza: "Media", telefono: phone.slice(0, 5) + "***", ids: arr.map((x) => x.id).join(" | "), filas: arr.map((x) => x.sourceRow).join(" | ") });
    }
  }
  const byName = new Map<string, Traveler[]>();
  for (const t of travelers) {
    const arr = byName.get(t.normalizedName) ?? [];
    arr.push(t); byName.set(t.normalizedName, arr);
  }
  for (const [, arr] of byName) {
    if (arr.length > 1) {
      const sameTrip = arr.every((x) => x.departureDate === arr[0].departureDate && x.departureTime === arr[0].departureTime);
      dupGroups.push({ motivo: sameTrip ? "Mismo nombre y mismos datos de viaje" : "Mismo nombre (revisar)", confianza: sameTrip ? "Alta" : "Baja", ids: arr.map((x) => x.id).join(" | "), filas: arr.map((x) => x.sourceRow).join(" | ") });
    }
  }

  // ---- Informe ----
  const uniqueNames = new Set(travelers.map((t) => t.normalizedName)).size;
  const validPhones = travelers.filter((t) => t.phoneValid).length;
  const uniqueLocations = new Set(travelers.map((t) => t.city).filter(Boolean)).size;
  const uniqueDepartures = new Set(travelers.map((t) => t.departureIata || t.departureCity).filter(Boolean)).size;
  const detectedDates = [...new Set(travelers.map((t) => t.departureDate).filter(Boolean) as string[])].sort();
  const detectedDreamville = [...new Set(travelers.map((t) => t.dreamvilleZone).filter(Boolean) as string[])].sort();
  const consentColumnDetected = cols.consent !== undefined;

  const summary: ImportSummary = {
    generatedAt: new Date().toISOString(),
    totalRows: travelers.length,
    totalImported: travelers.length,
    uniqueNames,
    validPhones,
    invalidPhones: travelers.length - validPhones,
    withoutName,
    withoutDate,
    withoutTime,
    withoutDreamville,
    uniqueLocations,
    uniqueDepartures,
    detectedDates,
    detectedDreamville,
    possibleDuplicates: dupGroups.length,
    warnings: travelers.reduce((a, t) => a + t.dataWarnings.length, 0),
    consentColumnDetected,
    columnMapping,
  };

  // ---- Escritura ----
  const dataDir = path.join(process.cwd(), "data");
  const repDir = path.join(process.cwd(), "reports");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(repDir, { recursive: true });

  fs.writeFileSync(path.join(dataDir, "travelers.server.json"), JSON.stringify(travelers, null, 2));
  fs.writeFileSync(path.join(repDir, "import-summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(repDir, "column-mapping.json"), JSON.stringify({ sheet: sheetName, headers, mapping: columnMapping }, null, 2));

  const invHead = "fila,nombre,motivo,valor\n";
  fs.writeFileSync(path.join(repDir, "invalid-records.csv"), invHead + invalidRecords.map((x) => [x.sourceRow, x.nombre ?? "", x.motivo, x.telefonoRaw ?? x.valor ?? ""].map(csvEscape).join(",")).join("\n") + "\n");

  const dupHead = "motivo,confianza,ids,filas\n";
  fs.writeFileSync(path.join(repDir, "possible-duplicates.csv"), dupHead + dupGroups.map((g) => [g.motivo, g.confianza, g.ids, g.filas].map(csvEscape).join(",")).join("\n") + "\n");

  // Datos consolidados para el panel /admin (se importa como módulo).
  const adminData = {
    summary,
    columns: { sheet: sheetName, headers, mapping: columnMapping },
    invalidRecords,
    duplicates: dupGroups,
  };
  fs.writeFileSync(path.join(repDir, "admin-data.json"), JSON.stringify(adminData, null, 2));

  // ---- Consola ----
  console.log(`\n✔ Hoja detectada: "${sheetName}"`);
  console.log("✔ Columnas mapeadas:");
  for (const [f, h] of Object.entries(columnMapping)) console.log(`   ${f.padEnd(14)} -> ${h}`);
  console.log("\n── RESUMEN DE IMPORTACIÓN ─────────────────");
  console.log(`  Personas importadas .. ${summary.totalImported}`);
  console.log(`  Nombres únicos ....... ${summary.uniqueNames}`);
  console.log(`  Teléfonos válidos .... ${summary.validPhones}`);
  console.log(`  Teléfonos inválidos .. ${summary.invalidPhones}`);
  console.log(`  Sin nombre ........... ${summary.withoutName}`);
  console.log(`  Sin fecha ............ ${summary.withoutDate}`);
  console.log(`  Sin hora ............. ${summary.withoutTime}`);
  console.log(`  Sin DreamVille ....... ${summary.withoutDreamville}`);
  console.log(`  Localidades únicas ... ${summary.uniqueLocations}`);
  console.log(`  Salidas únicas ....... ${summary.uniqueDepartures}`);
  console.log(`  Fechas detectadas .... ${summary.detectedDates.length}`);
  console.log(`  Zonas DreamVille ..... ${summary.detectedDreamville.join(", ")}`);
  console.log(`  Posibles duplicados .. ${summary.possibleDuplicates}`);
  console.log(`  Advertencias totales . ${summary.warnings}`);
  if (!consentColumnDetected) {
    console.log("\n⚠ AVISO PRIVACIDAD: el Excel no contiene ninguna columna de consentimiento");
    console.log("  o autorización para compartir el contacto. Documentado en el informe.");
  }
  console.log("\n✔ Ficheros generados en data/ y reports/\n");
}

main();
