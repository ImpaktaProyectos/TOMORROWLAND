import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-sm pt-24 text-center">
      <p className="display text-6xl text-gold">404</p>
      <p className="mt-3 text-ivory">No hemos encontrado esta página.</p>
      <Link href="/" className="focusable mt-6 inline-block rounded-full bg-cobalt px-5 py-3 text-sm font-medium text-white">Volver al inicio</Link>
    </div>
  );
}
