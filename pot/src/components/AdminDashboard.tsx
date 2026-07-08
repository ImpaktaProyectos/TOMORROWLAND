"use client";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";

type AdminData = {
  summary: any;
  columns: { sheet: string; headers: string[]; mapping: Record<string, string> };
  invalidRecords: any[];
  duplicates: any[];
};

function toCsv(rows: any[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: any) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}
function download(name: string, content: string, type = "text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

function Stat({ k, v }: { k: string; v: any }) {
  return <div className="rounded-lg border border-white/10 bg-night-2/50 p-3"><div className="text-lg text-gold">{v}</div><div className="text-[11px] text-muted">{k}</div></div>;
}
const DlBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="focusable inline-flex items-center gap-1 rounded-lg border border-gold/25 px-3 py-1.5 text-xs text-gold-soft">
    <Download size={13} aria-hidden /> {label}
  </button>
);

export function AdminDashboard({ data, onLogout }: { data: AdminData; onLogout: () => void }) {
  const s = data.summary;
  const [q, setQ] = useState("");
  const invFiltered = useMemo(() =>
    data.invalidRecords.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase())),
  [q, data.invalidRecords]);

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="display text-2xl text-ivory">Panel de revisión</h1>
        <button onClick={onLogout} className="focusable text-xs text-muted underline">Salir</button>
      </div>

      <section>
        <h2 className="display mb-2 text-lg text-gold-soft">Resumen de importación</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat k="Personas" v={s.totalImported} />
          <Stat k="Nombres únicos" v={s.uniqueNames} />
          <Stat k="Tel. válidos" v={s.validPhones} />
          <Stat k="Tel. inválidos" v={s.invalidPhones} />
          <Stat k="Sin fecha" v={s.withoutDate} />
          <Stat k="Sin hora" v={s.withoutTime} />
          <Stat k="Localidades" v={s.uniqueLocations} />
          <Stat k="Salidas" v={s.uniqueDepartures} />
          <Stat k="Duplicados" v={s.possibleDuplicates} />
          <Stat k="Advertencias" v={s.warnings} />
          <Stat k="Zonas DV" v={s.detectedDreamville.length} />
          <Stat k="Fechas" v={s.detectedDates.length} />
        </div>
        {!s.consentColumnDetected && (
          <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
            ⚠ El Excel no contiene columna de consentimiento/autorización para compartir el contacto.
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <DlBtn label="Resumen JSON" onClick={() => download("import-summary.json", JSON.stringify(s, null, 2), "application/json")} />
          <DlBtn label="Inválidos CSV" onClick={() => download("invalid-records.csv", toCsv(data.invalidRecords))} />
          <DlBtn label="Duplicados CSV" onClick={() => download("possible-duplicates.csv", toCsv(data.duplicates))} />
        </div>
      </section>

      <section>
        <h2 className="display mb-2 text-lg text-gold-soft">Columnas detectadas · hoja “{data.columns.sheet}”</h2>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="text-muted"><tr><th className="p-2">Campo</th><th className="p-2">Columna del Excel</th></tr></thead>
            <tbody>{Object.entries(data.columns.mapping).map(([f, h]) => (
              <tr key={f} className="border-t border-white/5"><td className="p-2 text-gold-soft">{f}</td><td className="p-2 text-ivory/80">{h}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="display mb-2 text-lg text-gold-soft">Teléfonos inválidos ({data.invalidRecords.length})</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…"
          className="focusable mb-2 min-h-[40px] w-full rounded-lg border border-gold/25 bg-night-2 px-3 py-2 text-sm text-ivory" />
        <div className="max-h-72 overflow-y-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-night-2 text-muted"><tr><th className="p-2">Fila</th><th className="p-2">Nombre</th><th className="p-2">Motivo</th></tr></thead>
            <tbody>{invFiltered.map((r, i) => (
              <tr key={i} className="border-t border-white/5"><td className="p-2">{r.sourceRow}</td><td className="p-2 text-ivory/80">{r.nombre ?? "—"}</td><td className="p-2 text-muted">{r.motivo}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="display mb-2 text-lg text-gold-soft">Posibles duplicados ({data.duplicates.length})</h2>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-night-2 text-muted"><tr><th className="p-2">Motivo</th><th className="p-2">Confianza</th><th className="p-2">Filas</th></tr></thead>
            <tbody>{data.duplicates.map((d, i) => (
              <tr key={i} className="border-t border-white/5"><td className="p-2 text-ivory/80">{d.motivo}</td><td className="p-2">{d.confianza}</td><td className="p-2 text-muted">{d.filas}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-night-2/40 p-4 text-xs text-muted">
        <p><strong className="text-ivory/80">Nueva importación:</strong> en Vercel sin base de datos externa, los datos se generan en tiempo de build. Para actualizar: ejecuta <code className="text-gold-soft">npm run import-excel -- ./ruta.xlsx</code> en local, súbelo a GitHub y Vercel redesplegará. Los cambios no se guardan desde esta pantalla.</p>
      </section>
    </div>
  );
}
