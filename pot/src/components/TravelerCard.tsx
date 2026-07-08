import Link from "next/link";
import { MapPin, PlaneTakeoff, CalendarDays, Clock, Tent } from "lucide-react";
import type { TravelerPublic } from "@/lib/types";
import { WhatsappButton } from "./WhatsappButton";
import { MatchBadge } from "./MatchBadge";

function Tag({ icon: Icon, text }: { icon: any; text?: string }) {
  if (!text) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <Icon size={12} aria-hidden /> {text}
    </span>
  );
}

export function TravelerCard({ t }: { t: TravelerPublic }) {
  return (
    <article className="glass rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/persona/${t.id}`} className="focusable min-w-0 flex-1">
          <h2 className="display text-lg text-ivory">{t.displayName}</h2>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <Tag icon={MapPin} text={t.city} />
            <Tag icon={PlaneTakeoff} text={t.departureCity} />
            <Tag icon={CalendarDays} text={t.departureDayLabel} />
            <Tag icon={Clock} text={t.departureTime} />
            <Tag icon={Tent} text={t.dreamvilleZone && t.dreamvilleZone !== "Sin especificar" ? t.dreamvilleZone : undefined} />
          </div>
        </Link>
        {t.matchScore !== undefined && <MatchBadge score={t.matchScore} label={t.matchLabel} />}
      </div>
      <div className="mt-3">
        <WhatsappButton id={t.id} hasWhatsapp={t.hasWhatsapp} />
      </div>
    </article>
  );
}
