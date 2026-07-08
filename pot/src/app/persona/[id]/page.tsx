import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, PlaneTakeoff, CalendarDays, Clock, Tent, Plane, Instagram, Ticket } from "lucide-react";
import { getById, getRelated, toPublic } from "@/lib/data";
import { WhatsappButton } from "@/components/WhatsappButton";
import { TravelerCard } from "@/components/TravelerCard";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { id: string } }) {
  const t = getById(params.id);
  return { title: t ? t.displayName : "Persona no encontrada" };
}

function Line({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={18} className="mt-0.5 shrink-0 text-gold/70" aria-hidden />
      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
        <div className="text-ivory">{value}</div>
      </div>
    </div>
  );
}

export default function PersonaPage({ params }: { params: { id: string } }) {
  const raw = getById(params.id);
  if (!raw) notFound();
  const t = toPublic(raw);
  const related = getRelated(raw.id);

  const place = [t.city, t.province && t.province !== t.city ? t.province : null, t.autonomousCommunity]
    .filter(Boolean).join(", ");
  const departure = [t.departureCity, t.departureIata].filter(Boolean).join(" · ");
  const flight = [t.airline, t.flightNumber].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <Link href="/" className="focusable inline-flex items-center gap-1 text-sm text-muted hover:text-ivory">
        <ArrowLeft size={16} aria-hidden /> Volver al directorio
      </Link>

      <header className="glass rounded-2xl p-5">
        <h1 className="display text-3xl text-ivory">{t.displayName}</h1>
        {place && <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} aria-hidden />{place}</p>}
        <div className="gold-rule my-4" />
        <div className="divide-y divide-white/5">
          <Line icon={PlaneTakeoff} label="Ciudad / aeropuerto de salida" value={departure || undefined} />
          <Line icon={CalendarDays} label="Fecha de salida" value={t.departureDayLabel} />
          <Line icon={Clock} label="Hora del vuelo" value={t.departureTime} />
          <Line icon={Plane} label="Aerolínea / vuelo" value={flight || undefined} />
          <Line icon={Tent} label="Zona DreamVille"
            value={t.dreamvilleZone && t.dreamvilleZone !== "Sin especificar" ? t.dreamvilleZone : undefined} />
          <Line icon={Ticket} label="Organiza su viaje con" value={t.travelOperator || undefined} />
          <Line icon={Instagram} label="Instagram" value={t.instagram ? `@${t.instagram}` : undefined} />
        </div>
        <div className="mt-5">
          <WhatsappButton id={t.id} hasWhatsapp={t.hasWhatsapp} size="lg" />
        </div>
      </header>

      {related.length > 0 && (
        <section aria-label="Personas relacionadas">
          <h2 className="display mb-3 text-xl text-ivory">Quizá coincidís en el viaje</h2>
          <div className="grid gap-3">
          </div>
        </section>
      )}
    </div>
  );
}
