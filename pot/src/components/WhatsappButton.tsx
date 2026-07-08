import { MessageCircle } from "lucide-react";

export function WhatsappButton({
  id, hasWhatsapp, size = "sm",
}: { id: string; hasWhatsapp: boolean; size?: "sm" | "lg" }) {
  const base =
    "focusable inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors";
  const dims = size === "lg" ? "w-full px-5 py-3 text-base min-h-[52px]" : "px-4 py-2 text-sm min-h-[44px]";

  if (!hasWhatsapp) return null;

  return (
    <a
      href={`/contact/${id}`}
      className={`${base} ${dims} bg-[#25D366] text-white hover:bg-[#1fbc5a]`}
      aria-label="Chatear por WhatsApp"
    >
      <MessageCircle size={18} aria-hidden /> Chatear
    </a>
  );
}
