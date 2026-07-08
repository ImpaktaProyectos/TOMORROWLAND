"use client";
import { X } from "lucide-react";

export type Options = {
  cities: string[]; provinces: string[]; departures: string[]; dates: string[]; dreamville: string[];
};
export type FilterState = {
  city: string; province: string; departure: string; date: string;
  time: string; timeTolerance: string; dreamville: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
const selectCls =
  "focusable min-h-[44px] w-full rounded-lg border border-gold/25 bg-night-2 px-3 py-2 text-sm text-ivory";

function dateLabel(iso: string) {
  const [y, m, d] = iso.split("-");
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
}

export function FiltersForm({
  options, state, setState,
}: { options: Options; state: FilterState; setState: (s: Partial<FilterState>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Localidad">
        <select className={selectCls} value={state.city} onChange={(e) => setState({ city: e.target.value })}>
          <option value="">Todas</option>
          {options.cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Provincia">
        <select className={selectCls} value={state.province} onChange={(e) => setState({ province: e.target.value })}>
          <option value="">Todas</option>
          {options.provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Ciudad / aeropuerto de salida">
        <select className={selectCls} value={state.departure} onChange={(e) => setState({ departure: e.target.value })}>
          <option value="">Todas</option>
          {options.departures.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
      <Field label="Día del vuelo">
        <select className={selectCls} value={state.date} onChange={(e) => setState({ date: e.target.value })}>
          <option value="">Cualquiera</option>
          {options.dates.map((d) => <option key={d} value={d}>{dateLabel(d)}</option>)}
        </select>
      </Field>
      <Field label="Hora del vuelo">
        <input type="time" className={selectCls} value={state.time}
          onChange={(e) => setState({ time: e.target.value })} />
      </Field>
      <Field label="Margen horario">
        <select className={selectCls} value={state.timeTolerance}
          onChange={(e) => setState({ timeTolerance: e.target.value })}>
          <option value="0">Hora exacta</option>
          <option value="30">± 30 min</option>
          <option value="60">± 60 min</option>
          <option value="120">± 120 min</option>
        </select>
      </Field>
      <Field label="Zona DreamVille">
        <select className={selectCls} value={state.dreamville} onChange={(e) => setState({ dreamville: e.target.value })}>
          <option value="">Todas</option>
          {options.dreamville.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
      </Field>
    </div>
  );
}

export function ActiveChips({
  state, onClear, onClearAll,
}: { state: FilterState; onClear: (k: keyof FilterState) => void; onClearAll: () => void }) {
  const labels: Partial<Record<keyof FilterState, string>> = {
    city: "Localidad", province: "Provincia", departure: "Salida",
    date: "Día", time: "Hora", dreamville: "DreamVille",
  };
  const active = (Object.keys(labels) as (keyof FilterState)[]).filter((k) => state[k]);
  if (active.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map((k) => (
        <button key={k} onClick={() => onClear(k)}
          className="focusable chip hover:border-gold/60"
          aria-label={`Quitar filtro ${labels[k]}`}>
          {labels[k]}: {state[k]}{k === "time" && state.timeTolerance !== "0" ? ` (±${state.timeTolerance})` : ""}
          <X size={12} aria-hidden />
        </button>
      ))}
      <button onClick={onClearAll}
        className="focusable text-xs text-turquoise underline underline-offset-4">
        Limpiar todo
      </button>
    </div>
  );
}
