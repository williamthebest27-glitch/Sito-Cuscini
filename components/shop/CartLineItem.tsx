"use client";

/** Riga di carrello (drawer + pagina carrello): media, opzioni, quantità, prezzo. */
import Link from "next/link";
import { useCart } from "@/lib/shop/cart/CartContext";
import type { CartLine } from "@/lib/shop/cart/types";
import { formatPrice } from "@/lib/shop/format";
import ProductMedia from "./ProductMedia";
import QuantityStepper from "./QuantityStepper";

export default function CartLineItem({
  line,
  onNavigate,
}: {
  line: CartLine;
  /** Callback opzionale (es. chiudere il drawer al click sul nome). */
  onNavigate?: () => void;
}) {
  const { setQuantity, removeLine } = useCart();
  const lineTotal = line.unitPrice * line.quantity;
  const compareTotal = line.compareAtPrice
    ? line.compareAtPrice * line.quantity
    : undefined;

  return (
    <div className="line">
      <Link
        href={`/prodotti/${line.slug}`}
        className="line__media"
        onClick={onNavigate}
        aria-label={line.name}
      >
        <ProductMedia image={line.image} glyph={line.name.charAt(0)} sizes="72px" />
      </Link>

      <div className="line__info">
        <Link href={`/prodotti/${line.slug}`} className="line__name" onClick={onNavigate}>
          {line.name}
        </Link>
        {line.optionsLabel ? (
          <span className="line__opts">{line.optionsLabel}</span>
        ) : null}
        <div className="line__controls">
          <QuantityStepper
            value={line.quantity}
            max={line.maxStock}
            size="sm"
            onChange={(q) => setQuantity(line.sku, q)}
          />
          <button
            type="button"
            className="line__remove"
            onClick={() => removeLine(line.sku)}
          >
            Rimuovi
          </button>
        </div>
      </div>

      <div className="line__price">
        <span className="price__amount">{formatPrice(lineTotal)}</span>
        {compareTotal ? (
          <span className="price__compare">{formatPrice(compareTotal)}</span>
        ) : null}
      </div>
    </div>
  );
}
