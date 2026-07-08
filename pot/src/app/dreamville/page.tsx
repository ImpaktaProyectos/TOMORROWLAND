import Link from "next/link";
import { Tent, ArrowLeft, CalendarDays, PlaneTakeoff } from "lucide-react";
import { getDreamvilleZones, getDreamvilleDetail } from "@/lib/data";
import { TravelerCard } from "@/components/TravelerCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Zonas DreamVille" };

export default function DreamvillePage({ searchParams }: { searchParams: { zona?: string } }) {
  const zones = getDreamvilleZones();
  const selected = searchParams.zona && zones.some((z) => z.zone === searchParams.zona) ? searchParams.zona : null;

  if (selected) {
    const d = getDreamvilleDetail(selected);
    return (
      <div className="space-y-6">
        <Link href="/dreamville" className="focusable inline-flex items-center gap-1 text-sm text-muted hover:text-ivory">
          <ArrowLeft size={16} aria-hidden /> Todas las zonas
        </Link>
        <header className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/25 text-gold"><Tent aria-hidden /></span>
            <div>
              <h1 className="display text-2xl text-ivory">{d.zone}</h1>
              <p className="text-sm text-muted">{d.count} {d.count === 1 ? "persona" : "personas"}</p>
            </div>
          </div>
          <div className="gold-rule my-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted"><CalendarDays size={13} aria-hidden /> Llegadas más frecuentes</p>
              <ul className="text-sm text-ivory/85">{d.topDates.map(([k, n]) => <li key={k}>{k} · {n}</li>)}</ul>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted"><PlaneTakeoff size={13} aria-hidden /> Salidas más frecuentes</p>
              <ul className="text-sm text-ivory/85">{d.topDepartures.map(([k, n]) => <li key={k}>{k} · {n}</li>)}</ul>
            </div>
          </div>
        </header>
        <div className="grid gap-3">
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <h1 className="display text-3xl text-ivory">Zonas DreamVille</h1>
        <p className="text-sm text-muted">Descubre quién estará en tu misma zona.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {zones.map(({ zone, count }) => (
          <Link key={zone} href={`/dreamville?zona=${encodeURIComponent(zone)}`}
            className="focusable glass group flex items-center justify-between rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/25 text-gold"><Tent size={20} aria-hidden /></span>
              <div>
                <div className="display text-lg text-ivory">{zone}</div>
                <div className="text-xs text-muted">{count} {count === 1 ? "persona" : "personas"}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
