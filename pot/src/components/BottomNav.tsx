"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ShieldCheck } from "lucide-react";

const items = [
  { href: "/", label: "Directorio", icon: Users },
  { href: "/informacion", label: "Info", icon: ShieldCheck },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/15 bg-night-2/85 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href}
              aria-current={active ? "page" : undefined}
              className={`focusable flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors ${
                active ? "text-gold" : "text-muted hover:text-ivory"
              }`}>
              <Icon size={20} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
