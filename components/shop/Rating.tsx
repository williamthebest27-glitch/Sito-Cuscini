/**
 * Valutazione a stelle. Sovrappone uno strato pieno (clip in %) a uno vuoto,
 * così mostra correttamente le mezze stelle senza icone extra.
 */
import { formatRating } from "@/lib/shop/format";

export default function Rating({
  value,
  count,
  showCount = true,
}: {
  /** Media 0–5. */
  value: number;
  count?: number;
  showCount?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className="rating"
      aria-label={`Valutazione ${formatRating(value)} su 5${
        count !== undefined ? `, ${count} recensioni` : ""
      }`}
    >
      <span className="rating__stars" aria-hidden="true">
        ★★★★★
        <span className="rating__stars-fill" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      {showCount && count !== undefined ? (
        <span className="rating__count">
          {formatRating(value)} ({count})
        </span>
      ) : null}
    </span>
  );
}
