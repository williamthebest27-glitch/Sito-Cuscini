"use client";

/**
 * Griglia interattiva dello shop: ricerca istantanea + filtri + ordinamento.
 * Il filtro avviene in memoria sul set ricevuto dal server (istantaneo per il
 * catalogo attuale); per cataloghi molto grandi si passerà a `repository.query`
 * lato server con paginazione, senza cambiare questo layout.
 */
import { useEffect, useMemo, useState } from "react";
import { applyQuery, type FilterQuery, type SortKey } from "@/lib/shop/filter";
import type { Facets } from "@/lib/shop/repository";
import type { Product } from "@/lib/shop/types";
import ProductCard from "./ProductCard";
import {
  IconChevron,
  IconClose,
  IconSearch,
  IconSliders,
} from "./icons";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "rilevanza", label: "Rilevanza" },
  { key: "novita", label: "Novità" },
  { key: "prezzo-asc", label: "Prezzo crescente" },
  { key: "prezzo-desc", label: "Prezzo decrescente" },
  { key: "recensioni", label: "Più votati" },
];

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function ShopBrowser({
  products,
  facets,
  categoryLabels,
}: {
  products: Product[];
  facets: Facets;
  categoryLabels: Record<string, string>;
}) {
  const [search, setSearch] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [rigidita, setRigidita] = useState<string[]>([]);
  const [colore, setColore] = useState<string[]>([]);
  const [misura, setMisura] = useState<string[]>([]);
  const [onSale, setOnSale] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [sort, setSort] = useState<SortKey>("rilevanza");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query: FilterQuery = useMemo(
    () => ({
      search,
      categories: cats,
      rigidita,
      colore,
      misura,
      onSale: onSale || undefined,
      isNew: isNew || undefined,
    }),
    [search, cats, rigidita, colore, misura, onSale, isNew],
  );

  const results = useMemo(
    () =>
      applyQuery(products, query, sort, {
        categoryLabel: (id) => categoryLabels[id] ?? id,
      }),
    [products, query, sort, categoryLabels],
  );

  const activeCount =
    cats.length +
    rigidita.length +
    colore.length +
    misura.length +
    (onSale ? 1 : 0) +
    (isNew ? 1 : 0);

  const reset = () => {
    setCats([]);
    setRigidita([]);
    setColore([]);
    setMisura([]);
    setOnSale(false);
    setIsNew(false);
    setSearch("");
  };

  // Blocco scroll quando il bottom-sheet filtri è aperto (mobile).
  useEffect(() => {
    const lenis = (
      window as unknown as { lenis?: { stop: () => void; start: () => void } }
    ).lenis;
    if (filtersOpen) {
      document.documentElement.classList.add("no-scroll");
      lenis?.stop();
    } else {
      document.documentElement.classList.remove("no-scroll");
      lenis?.start();
    }
    return () => {
      document.documentElement.classList.remove("no-scroll");
    };
  }, [filtersOpen]);

  return (
    <div className="browser">
      <div className="browser__toolbar">
        <div className="search">
          <IconSearch className="search__icon" />
          <input
            type="search"
            className="search__input"
            placeholder="Cerca un cuscino, un materiale…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cerca nel negozio"
          />
          {search ? (
            <button
              type="button"
              className="search__clear"
              onClick={() => setSearch("")}
              aria-label="Cancella ricerca"
            >
              <IconClose style={{ width: 14, height: 14 }} />
            </button>
          ) : null}
        </div>

        <span className="toolbar__meta">
          {results.length} {results.length === 1 ? "prodotto" : "prodotti"}
        </span>

        <div className="select">
          <label className="sr-only" htmlFor="sort">
            Ordina
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <IconChevron className="select__chevron" />
        </div>

        <button
          type="button"
          className="filters-toggle"
          onClick={() => setFiltersOpen(true)}
        >
          <IconSliders style={{ width: 16, height: 16 }} />
          Filtri{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>

      <div
        className="filters-backdrop"
        data-open={filtersOpen}
        onClick={() => setFiltersOpen(false)}
        aria-hidden="true"
      />

      <aside className="filters" data-open={filtersOpen} aria-label="Filtri">
        <div className="filters__head">
          <strong>Filtri</strong>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setFiltersOpen(false)}
            aria-label="Chiudi filtri"
          >
            <IconClose style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <fieldset className="filters__group">
          <legend className="filters__legend">Categoria</legend>
          <div className="filters__options">
            {facets.categories.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip"
                data-active={cats.includes(f.id)}
                onClick={() => setCats((c) => toggle(c, f.id))}
              >
                {f.label} <span className="chip__count">{f.count}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {facets.rigidita.length > 0 ? (
          <fieldset className="filters__group">
            <legend className="filters__legend">Rigidità</legend>
            <div className="filters__options">
              {facets.rigidita.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="chip"
                  data-active={rigidita.includes(f.id)}
                  onClick={() => setRigidita((c) => toggle(c, f.id))}
                >
                  {f.label} <span className="chip__count">{f.count}</span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {facets.colore.length > 0 ? (
          <fieldset className="filters__group">
            <legend className="filters__legend">Federa</legend>
            <div className="filters__options">
              {facets.colore.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="chip"
                  data-active={colore.includes(f.id)}
                  onClick={() => setColore((c) => toggle(c, f.id))}
                >
                  <span
                    className="chip__swatch"
                    style={{ background: f.hex }}
                    aria-hidden="true"
                  />
                  {f.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {facets.misura.length > 0 ? (
          <fieldset className="filters__group">
            <legend className="filters__legend">Altezza</legend>
            <div className="filters__options">
              {facets.misura.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="chip"
                  data-active={misura.includes(f.id)}
                  onClick={() => setMisura((c) => toggle(c, f.id))}
                >
                  {f.label} <span className="chip__count">{f.count}</span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset className="filters__group">
          <legend className="filters__legend">Offerte</legend>
          <div className="switch-row">
            <label className="switch">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => setOnSale(e.target.checked)}
              />
              <span className="switch__track" />
              Solo in offerta
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
              />
              <span className="switch__track" />
              Solo novità
            </label>
          </div>
        </fieldset>

        {activeCount > 0 ? (
          <button type="button" className="filters__reset" onClick={reset}>
            Azzera filtri ({activeCount})
          </button>
        ) : null}
      </aside>

      <div>
        {results.length === 0 ? (
          <div className="empty">
            <p className="empty__title">Nessun risultato</p>
            <p>Prova a modificare la ricerca o ad azzerare i filtri.</p>
            {activeCount > 0 || search ? (
              <button
                type="button"
                className="btn btn--ghost"
                style={{ marginTop: "1.2rem" }}
                onClick={reset}
              >
                Azzera tutto
              </button>
            ) : null}
          </div>
        ) : (
          <div className="product-grid" data-cols="3">
            {results.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                categoryLabel={categoryLabels[p.categoryId]}
                priority={i < 3}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
