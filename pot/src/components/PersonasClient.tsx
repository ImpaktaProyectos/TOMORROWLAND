"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, SearchX } from "lucide-react";
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
      const res = await fetch(`/api/travelers?${params.toString()}&limit=300`);
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
      {/* Barra de búsqueda */}
      <SearchBar defaultValue={search} onSubmitPush={false} onChange={setSearch} />

      {/* Filtros siempre visibles */}
      <div className="rounded-2xl border border-gold/15 bg-night-2/40 p-4">
        <FiltersForm options={options} state={state} setState={setState} />
      </div>

      {/* Chips activos */}
      <ActiveChips state={state}
        onClear={(k) => setState({ [k]: "", ...(k === "time" ? { timeTolerance: "0" } : {}) } as Partial<FilterState>)}
        onClearAll={() => { setStateRaw(EMPTY); setSearch(""); }} />

      {/* Barra de resultados + ordenar */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted" aria-live="polite">
          {loading ? "Buscando…" : `${total} ${total === 1 ? "persona" : "personas"}`}
        </span>
        <label className="flex items-center gap-2 text-xs text-muted">
          Ordenar
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="focusable min-h-[36px] rounded-lg border border-gold/25 bg-night-2 px-2 py-1 text-xs text-ivory">
            {sorts.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </label>
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
          <p className="mt-1 text-sm text-muted">Prueba eliminando algún filtro.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((t) => <TravelerCard key={t.id} t={t} />)}
          {total > results.length && (
            <p className="pt-2 text-center text-xs text-muted">Mostrando {results.length} de {total}. Afina la búsqueda para ver más.</p>
          )}
        </div>
      )}
    </div>
  );
}
