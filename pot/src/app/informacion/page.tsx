import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = { title: "Metodología y privacidad" };

export default function InformacionPage() {
  return (
    <div className="space-y-6">
      <Link href="/" className="focusable inline-flex items-center gap-1 text-sm text-muted hover:text-ivory">
        <ArrowLeft size={16} aria-hidden /> Inicio
      </Link>
      <header>
        <h1 className="display text-3xl text-ivory">Metodología y privacidad</h1>
      </header>

      <div className="glass space-y-4 rounded-2xl p-5 text-sm leading-relaxed text-ivory/85">
        <p><strong className="text-ivory">Qué datos usa la app.</strong> Nombre o apodo, localidad, ciudad/aeropuerto de salida, día y hora del vuelo y zona DreamVille. Todo procede del formulario que rellenaste para organizar el viaje.</p>
        <p><strong className="text-ivory">El teléfono no se muestra.</strong> El número nunca aparece en pantalla ni se envía al navegador. El botón de WhatsApp solo abre una conversación a través de una redirección del servidor, sin revelar el número.</p>
        <p><strong className="text-ivory">Para qué sirve el contacto.</strong> Únicamente para facilitar que las personas que coinciden en el viaje puedan organizarse.</p>
        <p><strong className="text-ivory">Corrección o eliminación.</strong> Si quieres corregir un dato o que te eliminemos del directorio, contacta con la persona que organiza el viaje y se actualizará en la siguiente importación.</p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-gold/25 bg-night-2/50 p-4">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-turquoise" aria-hidden />
        <p className="text-sm text-ivory/85">
          Proyecto independiente para organizar el viaje. No es una aplicación oficial de Tomorrowland.
        </p>
      </div>
    </div>
  );
}
