import { NextRequest, NextResponse } from "next/server";
import { getById } from "@/lib/data";
import { toWaNumber } from "@/lib/normalize/phones";

export const dynamic = "force-dynamic";

// Rate-limit básico en memoria por IP (mejor esfuerzo en serverless).
const hits = new Map<string, { count: number; ts: number }>();
const WINDOW = 60_000;
const MAX = 15;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.ts > WINDOW) { hits.set(ip, { count: 1, ts: now }); return false; }
  rec.count++;
  return rec.count > MAX;
}

const MESSAGE = "Hola, te he encontrado en la app del viaje a Tomorrowland 2026. Creo que coincidimos en el viaje.";

export function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Inténtalo en un minuto." }, { status: 429 });
  }
  const t = getById(params.id);
  if (!t) return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 });
  if (!t.phoneValid || !t.phoneE164) {
    return NextResponse.json({ error: "Esta persona no tiene un WhatsApp disponible." }, { status: 404 });
  }
  const wa = `https://wa.me/${toWaNumber(t.phoneE164)}?text=${encodeURIComponent(MESSAGE)}`;
  return NextResponse.redirect(wa, 302);
}
