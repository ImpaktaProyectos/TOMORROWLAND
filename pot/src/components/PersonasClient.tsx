"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Loader2, SearchX } from "lucide-react";
import type { TravelerPublic } from "@/lib/types";
import { SearchBar } from "./SearchBar";
import { TravelerCard } from "./TravelerCard";
import { FiltersForm, ActiveChips, type Options, type FilterState } from "./Filters";

const EMPTY: FilterState = { city: "", province: "", departure: "", date: "", time: "", timeTolerance: "0", dreamville: "" };

const sorts = [
  { v: "name", l: "Nombre A-Z" },
  { v: "earliest", l: "Salida más temprana" },
  { v: "latest", l: "Salida más tardía" },
  { v: "date", l: "Fecha de salida" },
];

export function PersonasClient({ options }: { options: Options }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [search, setSearch] = useState(sp.get("search") ?? "");
  const [sort, setSort] = useState(sp.get("sort") ?? "name");
  const [state, setStateRaw] = useState<FilterState>({
    city: sp.get("city") ?? "", province: sp.get("province") ?? "",
    departure: sp.get("departure") ?? "", date: sp.get("date") ?? "",
    time: sp.get("time") ?? "", timeTolerance: sp.get("timeTolerance") ?? "0",
    dreamville: sp.get("dreamville") ?? "",
  });
  const [results, setResults] = useState<TravelerPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const setState = (s: Partial<FilterState>) => setStateRaw((prev) => ({ ...prev, ...s }));

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (search.trim()) p.set("search", search.trim());
    (Object.keys(state) as (keyof FilterState)[]).forEach((k) => {
      if (k === "timeTolerance") { if (state.time && state.timeTolerance !== "0") p.set(k, state.timeTolerance); }
      else if (state[k]) p.set(k, state[k]);
    });
    if (sort !== "name") p.set("sort", sort);
    return p;
  }, [search, state, sort]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res = await fetch(`/api/travelers?${params.toString()}&limit=60`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results); setTotal(data.pagination.total);
    } catch { setError(true); setResults([]); setTotal(0); }
    finally { setLoading(false); }
  }, [params]);

  useEffect(() => {
    router.replace(`/${params.toString() ? `?${params}` : ""}`, { scroll: false });
    clearTimeout(debounce.current);
    debounce.current = setTimeout(fetchData, 250);
    return () => clearTimeout(debounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const anyFilter = search.trim() || Object.values(state).some((v, i) => v && Object.keys(state)[i] !== "timeTolerance");

  return (
    <div className="space-y-5">
      <header className="pt-2">
        <h1 className="display text-3xl text-ivory">Directorio de personas</h1>
        <p className="text-sm text-muted">Busca y filtra a tus compañeros de viaje.</p>
      </header>

      <SearchBar defaultValue={search} onSubmitPush={false} onChange={setSearch} />

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted" aria-live="polite">
          {loading ? "Buscando…" : `${total} ${total === 1 ? "persona" : "personas"}`}
        </span>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="sort">Ordenar</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}
            className="focusable min-h-[40px] rounded-lg border border-gold/25 bg-night-2 px-2 py-1 text-xs text-ivory">
            {sorts.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
          <button onClick={() => setDrawer(true)}
            className="focusable inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-gold/25 px-3 py-1 text-xs text-gold-soft md:hidden">
            <SlidersHorizontal size={14} aria-hidden /> Filtros
          </button>
        </div>
      </div>

      <ActiveChips state={state}
        onClear={(k) => setState({ [k]: "", ...(k === "time" ? { timeTolerance: "0" } : {}) } as Partial<FilterState>)}
        onClearAll={() => { setStateRaw(EMPTY); setSearch(""); }} />

      {/* Filtros escritorio */}
      <div className="hidden rounded-2xl border border-gold/15 bg-night-2/40 p-4 md:block">
        <FiltersForm options={options} state={state} setState={setState} />
      </div>

      {/* Resultados */}
      {error ? (
        <p className="glass rounded-xl p-6 text-center text-sm text-muted">
          No hemos podido cargar los datos. Comprueba tu conexión e inténtalo de nuevo.
        </p>
      ) : loading ? (
        <div className="flex justify-center py-12 text-gold/70"><Loader2 className="animate-spin" aria-label="Cargando" /></div>
      ) : results.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <SearchX className="mx-auto mb-3 text-gold/50" aria-hidden />
          <p className="text-ivory">No hemos encontrado personas con estos filtros.</p>
          <p className="mt-1 text-sm text-muted">Prueba ampliando la franja horaria o eliminando algún filtro.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((t) => <TravelerCard key={t.id} t={t} />)}
          {total > results.length && (
            <p className="pt-2 text-center text-xs text-muted">Mostrando {results.length} de {total}. Afina la búsqueda para ver más.</p>
          )}
        </div>
      )}

      {/* Drawer móvil */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-gold/25 bg-night-2 p-5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="display text-xl text-ivory">Filtros</h2>
              <button onClick={() => setDrawer(false)} className="focusable rounded-full p-2 text-muted" aria-label="Cerrar filtros"><X /></button>
            </div>
            <FiltersForm options={options} state={state} setState={setState} />
            <div className="mt-5 flex gap-3">
              <button onClick={() => { setStateRaw(EMPTY); setSearch(""); }}
                className="focusable flex-1 rounded-full border border-gold/25 py-3 text-sm text-gold-soft">Limpiar</button>
              <button onClick={() => setDrawer(false)}
                className="focusable flex-1 rounded-full bg-cobalt py-3 text-sm font-medium text-white">Ver resultados</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
