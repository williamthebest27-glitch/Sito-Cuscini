"use client";

/**
 * Gallery prodotto: immagine principale con zoom (click) e miniature.
 * `resetKey` (es. il colore selezionato) riporta la vista alla prima immagine
 * quando la variante cambia il tono.
 */
import { useEffect, useRef, useState } from "react";
import type { ProductImage } from "@/lib/shop/types";
import ProductMedia from "./ProductMedia";
import { IconZoom } from "./icons";

export default function ProductGallery({
  images,
  badges,
  resetKey,
}: {
  images: ProductImage[];
  badges?: React.ReactNode;
  resetKey?: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(0);
    setZoom(false);
  }, [resetKey]);

  const current = images[Math.min(active, images.length - 1)];

  const onMove = (e: React.MouseEvent) => {
    if (!zoom || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <div className="gallery">
      <div
        ref={stageRef}
        className="gallery__stage"
        data-zoom={zoom}
        onClick={() => setZoom((z) => !z)}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(false)}
        role="button"
        tabIndex={0}
        aria-label={zoom ? "Riduci immagine" : "Ingrandisci immagine"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setZoom((z) => !z);
          }
        }}
      >
        {badges ? <div className="gallery__badges">{badges}</div> : null}
        <div
          className="gallery__img"
          style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
        >
          <ProductMedia
            image={current}
            glyph={current.alt.charAt(0)}
            sizes="(max-width: 900px) 100vw, 620px"
            priority
          />
        </div>
        {!zoom ? (
          <span className="gallery__hint">
            <IconZoom style={{ width: 13, height: 13 }} /> Zoom
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="gallery__thumbs" role="tablist" aria-label="Miniature">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className="gallery__thumb"
              data-active={i === active}
              onClick={() => {
                setActive(i);
                setZoom(false);
              }}
              role="tab"
              aria-selected={i === active}
              aria-label={img.alt}
            >
              <ProductMedia image={img} glyph={img.alt.charAt(0)} sizes="74px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
