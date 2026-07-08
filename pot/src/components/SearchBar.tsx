"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({
  defaultValue = "", placeholder = "Buscar por nombre, apodo, ciudad o provincia...",
  onSubmitPush = true, onChange,
}: {
  defaultValue?: string; placeholder?: string; onSubmitPush?: boolean;
  onChange?: (v: string) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  return (
    <div role="search" className="relative">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        inputMode="search"
        aria-label="Buscar personas"
        value={q}
        placeholder={placeholder}
        onChange={(e) => { setQ(e.target.value); onChange?.(e.target.value); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmitPush && q.trim())
            router.push(`/personas?search=${encodeURIComponent(q.trim())}`);
        }}
        className="focusable min-h-[52px] w-full rounded-full border border-gold/25 bg-night-2/70 py-3 pl-11 pr-4 text-ivory placeholder:text-muted/80"
      />
    </div>
  );
}
