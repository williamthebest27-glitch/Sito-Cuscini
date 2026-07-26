/**
 * Prezzo con eventuale prezzo pieno barrato e prefisso "da" per i range.
 * Puramente presentazionale; i valori sono in centesimi.
 */
import { formatPrice } from "@/lib/shop/format";

export default function Price({
  amount,
  compareAt,
  from = false,
  size = "md",
}: {
  amount: number;
  compareAt?: number;
  /** Mostra "da" (per prodotti con più prezzi di variante). */
  from?: boolean;
  size?: "md" | "lg";
}) {
  const showCompare = compareAt !== undefined && compareAt > amount;
  return (
    <span className="price">
      {from ? <span className="price__from">da</span> : null}
      <span
        className={size === "lg" ? "price__amount price__amount--lg" : "price__amount"}
      >
        {formatPrice(amount)}
      </span>
      {showCompare ? (
        <span className="price__compare">{formatPrice(compareAt!)}</span>
      ) : null}
    </span>
  );
}
