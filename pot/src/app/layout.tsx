import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "People of Tomorrow 2026";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | Encuentra a tus compañeros de viaje`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Busca personas por ciudad de salida, vuelo y zona DreamVille para organizar tu viaje a Tomorrowland Belgium 2026.",
  applicationName: APP_NAME,
  metadataBase: new URL("https://people-of-tomorrow.vercel.app"),
  openGraph: {
    title: `${APP_NAME} | Encuentra a tus compañeros de viaje`,
    description:
      "Encuentra a las personas que compartirán tu viaje a Tomorrowland Belgium 2026 · Weekend 1.",
    type: "website",
    locale: "es_ES",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#070a16" />
      </head>
      <body className="starfield">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-cobalt focus:px-4 focus:py-2">
          Saltar al contenido
        </a>
        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-4 pb-28 pt-6 sm:px-6">
          <main id="contenido" className="flex-1">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
