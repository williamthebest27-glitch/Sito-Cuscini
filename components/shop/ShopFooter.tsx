/**
 * Footer minimale dello shop (il sito originale non ne ha uno: viene aggiunto
 * solo alle pagine del negozio, coerente con la palette e la tipografia).
 */
import Link from "next/link";

export default function ShopFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="shop-footer">
      <div className="shop-container shop-footer__inner">
        <div>
          <Link href="/" className="shop-footer__brand" aria-label="The Double Twenty — home">
            <span className="nav__brand-the">The</span>
            <span className="nav__brand-name">Double Twenty</span>
          </Link>
          <p className="shop-footer__note">
            © {year} The Double Twenty · Cuscini ergonomici in puro lattice.
          </p>
        </div>
        <nav className="shop-footer__links" aria-label="Link utili">
          <Link href="/negozio">Negozio</Link>
          <Link href="/carrello">Carrello</Link>
          <Link href="/#collezione">Collezione</Link>
          <Link href="/#perche">Perché</Link>
        </nav>
      </div>
    </footer>
  );
}
