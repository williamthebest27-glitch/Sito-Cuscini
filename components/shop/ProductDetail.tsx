"use client";

/**
 * Sezione interattiva della scheda: gallery + colonna acquisto.
 * Il cambio di variante aggiorna prezzo, immagine, disponibilità e SKU senza
 * ricaricare la pagina. Possiede la selezione e la quantità.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/shop/cart/CartContext";
import { toCartLine } from "@/lib/shop/cart/line";
import { formatPrice } from "@/lib/shop/format";
import {
  findVariant,
  getDefaultVariant,
  getRatingSummary,
  getVariantAvailability,
} from "@/lib/shop/selectors";
import type { OptionType, Product, ProductImage } from "@/lib/shop/types";
import { NewBadge, SaleBadge } from "./Badges";
import Price from "./Price";
import ProductGallery from "./ProductGallery";
import QuantityStepper from "./QuantityStepper";
import Rating from "./Rating";
import VariantSelector from "./VariantSelector";
import {
  IconBag,
  IconLeaf,
  IconRefresh,
  IconShield,
  IconTruck,
} from "./icons";

const AVAILABILITY_LABEL = {
  "in-stock": "Disponibile · pronto per la spedizione",
  "low-stock": "Ultimi pezzi disponibili",
  "out-of-stock": "Momentaneamente esaurito",
} as const;

export default function ProductDetail({ product }: { product: Product }) {
  const { addLine } = useCart();
  const rating = getRatingSummary(product);

  const [selection, setSelection] = useState<Partial<Record<OptionType, string>>>(
    () => ({ ...getDefaultVariant(product).options }),
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const variant = useMemo(
    () => findVariant(product, selection) ?? getDefaultVariant(product),
    [product, selection],
  );

  const availability = getVariantAvailability(variant);
  const soldOut = availability === "out-of-stock";

  // Immagini con il tono della variante colore applicato alla copertina.
  const images: ProductImage[] = useMemo(() => {
    if (!variant.tone) return product.images;
    return product.images.map((img, i) =>
      i === 0 ? { ...img, tone: variant.tone } : img,
    );
  }, [product.images, variant.tone]);

  // Barra acquisto sticky (mobile): appare quando le azioni escono dallo schermo.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onSelect = (axis: OptionType, valueId: string) => {
    setSelection((prev) => ({ ...prev, [axis]: valueId }));
    setAdded(false);
  };

  const handleAdd = () => {
    if (soldOut) return;
    addLine(toCartLine(product, variant, quantity));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const galleryBadges = (
    <>
      {variant.compareAtPrice && variant.compareAtPrice > variant.price ? (
        <SaleBadge
          percent={Math.round((1 - variant.price / variant.compareAtPrice) * 100)}
        />
      ) : null}
      {product.isNew ? <NewBadge /> : null}
    </>
  );

  return (
    <>
      <div className="pdp">
        <ProductGallery
          images={images}
          badges={galleryBadges}
          resetKey={variant.tone ? variant.sku : undefined}
        />

        <div className="pdp__buy">
          <span className="pdp__cat">{product.tagline}</span>
          <h1 className="pdp__title">{product.name}</h1>

          {rating.count > 0 ? (
            <div className="pdp__rating">
              <Rating value={rating.average} count={rating.count} />
            </div>
          ) : null}

          <div className="pdp__price">
            <Price
              amount={variant.price}
              compareAt={variant.compareAtPrice}
              size="lg"
            />
          </div>

          <VariantSelector
            product={product}
            selection={selection}
            onSelect={onSelect}
          />

          <div className="stock" data-state={availability}>
            <span className="stock__dot" />
            {availability === "low-stock"
              ? `Ultimi ${variant.stock} pezzi`
              : AVAILABILITY_LABEL[availability]}
          </div>

          <div className="pdp__actions" ref={actionsRef}>
            <QuantityStepper
              value={quantity}
              max={Math.max(1, variant.stock)}
              onChange={setQuantity}
            />
            <button
              type="button"
              className="btn btn--primary pdp__add"
              onClick={handleAdd}
              disabled={soldOut}
              data-added={added}
            >
              {soldOut ? (
                "Esaurito"
              ) : added ? (
                "Aggiunto ✓"
              ) : (
                <>
                  <IconBag style={{ width: 18, height: 18 }} />
                  Aggiungi al carrello · {formatPrice(variant.price * quantity)}
                </>
              )}
            </button>
          </div>

          <div className="pdp__reassure">
            <span className="reassure__row">
              <IconTruck /> Spedizione gratuita da 69 € · consegna in 2–4 giorni
            </span>
            <span className="reassure__row">
              <IconRefresh /> Reso gratuito e prova comfort entro 30 giorni
            </span>
            <span className="reassure__row">
              <IconShield /> 2 anni di garanzia · pagamenti sicuri
            </span>
            <span className="reassure__row">
              <IconLeaf /> Materiali certificati OEKO-TEX · SKU {variant.sku}
            </span>
          </div>
        </div>
      </div>

      {/* Barra acquisto sticky su mobile */}
      <div className="buybar" data-show={showBar && !soldOut}>
        <div className="buybar__price">
          <span className="buybar__name">{product.name}</span>
          <Price amount={variant.price} compareAt={variant.compareAtPrice} />
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleAdd}
          disabled={soldOut}
        >
          <IconBag style={{ width: 16, height: 16 }} />
          Aggiungi
        </button>
      </div>
    </>
  );
}
