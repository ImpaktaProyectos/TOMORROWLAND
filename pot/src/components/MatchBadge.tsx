export function MatchBadge({ label, score }: { label?: string; score?: number }) {
  if (!label) return null;
  const tone =
    (score ?? 0) >= 80 ? "border-turquoise/50 text-turquoise"
    : (score ?? 0) >= 60 ? "border-gold/50 text-gold-soft"
    : "border-white/15 text-muted";
  return (
    <span className={`chip ${tone}`} title={score != null ? `Afinidad ${score}` : undefined}>
      {label}
    </span>
  );
}
