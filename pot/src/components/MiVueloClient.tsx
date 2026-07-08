"use client";
import { useState } from "react";
import { PlaneTakeoff, CalendarDays, Clock, ArrowRight, Loader2 } from "lucide-react";
import type { TravelerPublic } from "@/lib/types";
import type { Options } from "./Filters";
import { TravelerCard } from "./TravelerCard";

const selectCls = "focusable min-h-[52px] w-full rounded-xl border border-gold/25 bg-night-2 px-4 py-3 text-ivory";

function dateLabel(iso: string) {
  const [y, m, d] = iso.split("-");
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
}
function toMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

export function MiVueloClient({ options }: { options: Options }) {
  const [departure, setDeparture] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [list, setList] = useState<TravelerPublic[]>([]);

  const search = async () => {
    setLoading(true); setDone(false);
    const p = new URLSearchParams({ limit: "60" });
    if (departure) p.set("departure", departure);
    if (date) p.set("date", date);
    const res = await fetch(`/api/travelers?${p}`);
    const data = await res.json();
    setList(data.results); setLoading(false); setDone(true);
  };

  const target = time ? toMin(time) : null;
  const group = (min: number, max: number) =>
    target === null ? [] : list.filter((t) => t.departureMinutes != null && Math.abs(t.departureMinutes - target) >= min && Math.abs(t.departureMinutes - target) <= max);
  const exact = target !== null ? list.filter((t) => t.departureMinutes === target) : [];
  const w30 = group(1, 30);
  const w60 = group(31, 60);
  const rest = target !== null ? list.filter((t) => t.departureMinutes == null || Math.abs(t.departureMinutes - target) > 60) : list;

  const Section = ({ title, items }: { title: string; items: TravelerPublic[] }) =>
    items.length === 0 ? null : (
      <section className="space-y-3">
        <h2 className="display text-xl text-gold-soft">{title} <span className="text-sm text-muted">({items.length})</span></h2>
        {items.map((t) => <TravelerCard key={t.id} t={t} />)}
      </section>
    );

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <h1 className="display text-3xl text-ivory">Encuentra tu vuelo</h1>
        <p className="text-sm text-muted">Responde tres preguntas y te mostramos quién viaja contigo.</p>
      </header>

      <div className="glass space-y-5 rounded-2xl p-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm text-ivory"><PlaneTakeoff size={16} className="text-gold/70" aria-hidden /> ¿Desde dónde sales?</span>
          <select className={selectCls} value={departure} onChange={(e) => setDeparture(e.target.value)}>
            <option value="">Elige tu salida</option>
            {options.departures.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm text-ivory"><CalendarDays size={16} className="text-gold/70" aria-hidden /> ¿Qué día viajas?</span>
          <select className={selectCls} value={date} onChange={(e) => setDate(e.target.value)}>
            <option value="">Elige el día</option>
            {options.dates.map((d) => <option key={d} value={d}>{dateLabel(d)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm text-ivory"><Clock size={16} className="text-gold/70" aria-hidden /> ¿A qué hora sale tu vuelo?</span>
          <input type="time" className={selectCls} value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <button onClick={search} disabled={loading || (!departure && !date)}
          className="focusable inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-cobalt py-3 font-medium text-white disabled:opacity-40">
          {loading ? <Loader2 className="animate-spin" aria-hidden /> : <>Ver coincidencias <ArrowRight size={18} aria-hidden /></>}
        </button>
      </div>

      {done && (
        list.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-ivory">No hemos encontrado personas con esa salida y día.</p>
            <p className="mt-1 text-sm text-muted">Prueba con otra ciudad o quita el día.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <Section title="Misma hora exacta" items={exact} />
            <Section title="A menos de 30 min" items={w30} />
            <Section title="A menos de 60 min" items={w60} />
            <Section title={time ? "Mismo lugar y día" : "Mismo lugar y día"} items={rest} />
          </div>
        )
      )}
    </div>
  );
}
