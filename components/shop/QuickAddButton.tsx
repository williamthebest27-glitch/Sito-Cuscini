"use client";

/**
 * Quick-add dalla griglia: aggiunge la variante di default al carrello e apre
 * il drawer. Per i prodotti con più varianti l'utente potrà poi rifinire la
 * scelta nel carrello o nella scheda.
 */
import { useCart } from "@/lib/shop/cart/CartContext";
import { toCartLine } from "@/lib/shop/cart/line";
import { getDefaultVariant, getTotalStock } from "@/lib/shop/selectors";
import type { Product } from "@/lib/shop/types";
import { IconBag } from "./icons";

export default function QuickAddButton({ product }: { product: Product }) {
  const { addLine } = useCart();
  const soldOut = getTotalStock(product) <= 0;

  const onAdd = () => {
    if (soldOut) return;
    const variant = getDefaultVariant(product);
    addLine(toCartLine(product, variant, 1));
  };

  return (
    <button
      type="button"
      className="btn btn--primary pcard__quick"
      onClick={onAdd}
      disabled={soldOut}
      aria-label={`Aggiungi ${product.name} al carrello`}
    >
      <IconBag style={{ width: 16, height: 16 }} />
      {soldOut ? "Esaurito" : "Aggiungi"}
    </button>
  );
}
