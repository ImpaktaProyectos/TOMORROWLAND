import { Sparkles } from "lucide-react";
import { getOptions } from "@/lib/data";
import { PersonasClient } from "@/components/PersonasClient";

export const dynamic = "force-dynamic";

export default function Home() {
  const options = getOptions();
  return (
    <div className="space-y-6">
      <header className="pt-4 text-center">
        <p className="mb-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-turquoise/80">
          <Sparkles size={13} aria-hidden /> Consciencia · 2026
        </p>
        <h1 className="display text-3xl leading-tight text-ivory sm:text-4xl">
          People of Tomorrow 2026
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ivory/70">
          Encuentra a las personas que compartirán tu viaje a Tomorrowland Belgium · Weekend 1.
        </p>
        <div className="gold-rule mx-auto mt-4 max-w-xs" />
      </header>
      <PersonasClient options={options} />
      <footer className="pb-20 pt-4 text-center text-[11px] text-muted/70">
        <p>Proyecto independiente para organizar el viaje. No es una aplicación oficial de Tomorrowland.</p>
      </footer>
    </div>
  );
}
