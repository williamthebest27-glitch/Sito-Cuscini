# Gestione prodotti e prezzi (senza pannello admin)

Guida pratica per modificare prezzi, offerte, giacenze e prodotti **direttamente nel
codice**. Ci sono due negozi indipendenti:

- **`/negozio`** → catalogo in [`lib/shop/data.ts`](lib/shop/data.ts) (lo shop completo)
- **`/collezione`** → WooCommerce; finché non colleghi uno store reale, mostra i demo
  in [`lib/woocommerce.ts`](lib/woocommerce.ts)

> **Importante sui prezzi di `/negozio`:** sono in **centesimi di euro**.
> `8900` = 89,00 € · `12990` = 129,90 € · `990` = 9,90 €.

---

## 1) `/negozio` — modifiche in `lib/shop/data.ts`

> **SKU = ASIN.** Ogni prodotto rispecchia un'inserzione Amazon con le sue
> **varianti** (colori/misure): ogni combinazione ha il suo **ASIN come SKU**,
> così MCF evade con l'identificatore giusto. Se il tuo Seller SKU differisce,
> mappalo in `AMAZON_MCF_SKU_MAP` (vedi `.env.example`).

Ogni prodotto è un blocco `mk({ ... })`. Il prezzo, l'offerta e la giacenza sono
**per variante**, dentro le `variant(...)`:

```ts
mk({
  id: "doppia-onda",
  slug: "cervicale-doppia-onda",     // → /prodotti/<slug>
  name: "The Double Twenty - Cuscino Cervicale ...", // titolo Amazon
  tagline: "Frase breve per la card.",
  categoryId: "cervicale",           // deve esistere in CATEGORIES
  options: [coloreOption("Federa", "bamboo", "aloe")], // gli assi variante
  variants: [
    variant("B0FR6HG72B", { colore: "bamboo" }, 3189), // SKU=ASIN, opzione, prezzo(cent)
    variant("B0GWN465B1", { colore: "aloe" }, 3189),
  ],
  bullets: [ "SUPPORTO: ...", "2 ALTEZZE: ..." ], // = descrizione, una riga per punto
  specs: [{ label: "Dimensione", value: "40 × 70 cm" }],
  materials: ["Memory foam", "Bamboo"],
  tone: T.sand,                       // colore placeholder immagine
  createdAt: "2025-03-01",
  featured: true,                     // opzionale
}),
```
Assi variante disponibili:
- `coloreOption("Etichetta", "bamboo", "aloe", ...)` → swatch colore/federa (valori in `COLORS`)
- `sizeOption("Altezza", [{ id: "15", label: "15 cm" }, ...])` → misure/altezze
- `formatoOption({ id: "gravidanza", label: "Gravidanza" }, ...)` → un secondo asse (es. formato)

Prodotto a variante unica: `options: []` e `variants: [variant("ASIN", {}, prezzo)]`.

### Cambiare un prezzo
Modifica il numero prezzo nella `variant(...)` (in centesimi). Es. a 27,90 €:
```ts
variant("B0FR6HG72B", { colore: "bamboo" }, 2790),
```

### Mettere in offerta (badge −%)
Aggiungi un 4° argomento `{ compareAt }` alla variante (prezzo pieno barrato,
maggiore del prezzo). Lo sconto % e il badge si calcolano da soli:
```ts
variant("B0FR6HG72B", { colore: "bamboo" }, 2790, { compareAt: 3189 }),
```

### Segnare "esaurito"
Nella variante aggiungi `{ stock: 0 }`. Sotto le 5 unità compare "Ultimi N pezzi";
a 0 diventa "Esaurito" e il pulsante si disabilita.
```ts
variant("B0FR6HG72B", { colore: "bamboo" }, 3189, { stock: 0 }),
```

### Badge "Novità" / "In evidenza"
Proprietà del blocco `mk({...})`: `isNew: true` (badge Novità), `featured: true`
(spinta in "Rilevanza").

### Cambiare titolo, descrizione, ecc.
Nel blocco `mk`: `name` (titolo), `tagline`, `bullets` (descrizione), `specs`,
`materials`.

### Aggiungere un valore colore
Aggiungilo alla mappa `COLORS` in cima a `data.ts` (`id: { label, hex, tone }`),
poi usalo in `coloreOption(...)` e nelle `variant(..., { colore: "id" }, ...)`.

### Aggiungere un nuovo prodotto
Copia un blocco `mk({...})` e cambia i campi. **Regole:** `id`, `slug` e ogni
`sku` (ASIN) univoci; `categoryId` deve esistere in `CATEGORIES`. Toni immagine:
`T.warm`, `T.warm2`, `T.sand`, `T.sage`, `T.silver`.

### Categorie
Sono nell'array `CATEGORIES` (sempre in `data.ts`):
```ts
export const CATEGORIES = [
  { id: "cervicale", label: "Cervicale" },
  // aggiungi qui { id: "...", label: "..." }
];
```

### Foto reali (al posto dei placeholder)
Metti le immagini in `public/images/products/` e nella `img(...)` aggiungi `src`:
```ts
img("aurora-1", "Cuscino Aurora", ["#FAF7F2", "#E4DBCB"], /* tono di riserva */),
// diventa:
{ id: "aurora-1", alt: "Cuscino Aurora", src: "/images/products/aurora-1.jpg" },
```
Con `src` presente, il componente passa automaticamente a foto ottimizzate.

---

## 2) Altre leve commerciali

- **Spedizione gratuita e costo** → [`lib/shop/cart/pricing.ts`](lib/shop/cart/pricing.ts):
  ```ts
  export const FREE_SHIPPING_THRESHOLD = 6900; // 69,00 €
  export const STANDARD_SHIPPING = 490;        // 4,90 €
  ```
- **Codici sconto** → [`lib/shop/discounts.ts`](lib/shop/discounts.ts), array `RULES`:
  ```ts
  { code: "BENVENUTO10", kind: "percent", value: 10, label: "Benvenuto −10%" },
  { code: "PROMO20", kind: "fixed", value: 2000, label: "−20,00 €", minSubtotal: 10000 },
  ```

---

## 3) `/collezione` — prodotti demo WooCommerce

Finché non colleghi un vero WooCommerce, i prodotti sono i **demo** in
[`lib/woocommerce.ts`](lib/woocommerce.ts), array `DEMO_PRODUCTS`. Qui i prezzi sono
**stringhe già formattate**:
```ts
{ id: "duo", name: "Set Duo", slug: "set-duo", price: "€ 239",
  regularPrice: "€ 258", onSale: true, permalink: "#",
  shortDescription: "Due cuscini Classico…" },
```
Per collegare un WooCommerce reale: imposta la variabile d'ambiente
`WC_STORE_URL=https://tuo-store.com` in `.env.local`. Da quel momento `/collezione`
legge i prodotti dallo store e li gestisci dal **wp-admin** di WordPress.

---

## 4) Come vedere e pubblicare le modifiche

**In locale (anteprima immediata):**
```bash
npm run dev
```
Apri `http://localhost:3000/negozio` — le modifiche a `data.ts` si vedono al volo.

**Pubblicare online:**
```bash
git add -A
git commit -m "Aggiorna prezzi/prodotti"
git push
```
Le pagine `/negozio` e `/prodotti/[slug]` sono statiche (SSG): in produzione i nuovi
prezzi compaiono dopo la **ricostruzione** (automatica se il repo è collegato a
Vercel/Netlify; altrimenti `npm run build && npm start`).
