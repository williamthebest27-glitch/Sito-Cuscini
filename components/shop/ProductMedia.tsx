/**
 * Media prodotto: usa una foto reale (next/image) se `image.src` è presente,
 * altrimenti un placeholder brandizzato a gradiente tonale — coerente con le
 * card a gradiente del sito. Sostituendo i dati con foto reali, il componente
 * passa automaticamente a next/image, senza modifiche ai chiamanti.
 */
import Image from "next/image";
import type { ProductImage } from "@/lib/shop/types";

const DEFAULT_TONE: [string, string] = ["#F2ECE1", "#D8CEBD"];

export default function ProductMedia({
  image,
  glyph,
  sizes,
  priority = false,
  className = "",
}: {
  image: ProductImage;
  /** Lettera/iniziale mostrata nel placeholder (di norma l'iniziale del prodotto). */
  glyph?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (image.src) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes ?? "(max-width: 700px) 50vw, 33vw"}
        priority={priority}
        className={className}
        style={{ objectFit: "cover" }}
      />
    );
  }

  const [inner, outer] = image.tone ?? DEFAULT_TONE;
  return (
    <div
      className={`media-fill ${className}`}
      role="img"
      aria-label={image.alt}
      style={{
        background: `radial-gradient(80% 65% at 50% 32%, ${inner} 0%, ${outer} 100%)`,
      }}
    >
      {glyph ? <span className="media-fill__glyph">{glyph}</span> : null}
    </div>
  );
}
