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

> **SKU = ASIN Amazon.** Ogni variante usa l'ASIN come SKU (es. `B0FR6HG72B`),
> così MCF evade con lo stesso identificatore. Se il tuo Seller SKU differisce
> dall'ASIN, mappalo in `AMAZON_MCF_SKU_MAP` (vedi `.env.example`).

Ogni prodotto ha una o più **varianti** (SKU). Il prezzo, l'offerta e la giacenza
sono **per variante**, dentro la funzione `variant(...)`:

```ts
variant("B0FR6HG72B", { colore: "bamboo" }, 3189, { stock: 120 }),
//        SKU=ASIN      federa scelta         prezzo   giacenza
//                                            (31,89€)
```
Gli assi possibili sono `{ misura: "..." }` (etichetta **Altezza**, es. "10","13","15")
e `{ colore: "..." }` (etichetta **Federa**, es. "bamboo","aloe","silver","cotone").
I prodotti a variante unica usano `options: []` e `variant("ASIN", {}, prezzo, {...})`.

### Cambiare un prezzo
Modifica il numero del prezzo (in centesimi). Es. a 27,90 €:
```ts
variant("B0FR6HG72B", { colore: "bamboo" }, 2790, { stock: 120 }),
```

### Mettere in offerta (badge −%)
Aggiungi `compareAt` (prezzo pieno barrato) **maggiore** del prezzo. Lo sconto %
e il badge si calcolano da soli:
```ts
variant("B0FR6HG72B", { colore: "bamboo" }, 2790, { compareAt: 3189, stock: 120 }),
// mostra 27,90 € con 31,89 € barrato e badge −13%
```
Per **togliere** l'offerta: rimuovi `compareAt`.

### Segnare "esaurito"
Metti `stock: 0`. Sotto le 5 unità compare "Ultimi N pezzi"; a 0 diventa "Esaurito"
e il pulsante si disabilita.
```ts
variant("B0H26LC3FH", { colore: "cotone" }, 2657, { stock: 0 }),
```

### Badge "Novità" / "In evidenza"
Sono proprietà **del prodotto** (non della variante):
```ts
{
  id: "aurora",
  // ...
  isNew: true,     // badge "Novità" + spinta nell'ordinamento "Novità"
  featured: true,  // spinta nell'ordinamento "Rilevanza"
}
```

### Cambiare nome, sottotitolo, descrizione, ecc.
Sempre sul prodotto: `name`, `tagline` (frase breve), `description` (testo lungo),
`features` (elenco caratteristiche), `specs` (tabella `{ label, value }`),
`materials` (chip).

### Aggiungere un nuovo prodotto
Copia un blocco esistente e cambia i campi. **Regole:** `id`, `slug` e ogni `sku`
devono essere **univoci**. `categoryId` deve esistere in `CATEGORIES` (vedi sotto).
Struttura minima:
```ts
{
  id: "nuovo-id",
  slug: "nuovo-slug",           // diventa /prodotti/nuovo-slug
  name: "Nome",
  tagline: "Frase breve.",
  description: "Descrizione lunga…",
  categoryId: "cervicale",       // deve esistere in CATEGORIES
  isNew: true,                   // opzionale
  options: [federaOption("bamboo", "aloe")], // oppure altezzaOption(...) o [] se unica
  variants: [
    variant("B0XXXXXX01", { colore: "bamboo" }, 3189, { stock: 40 }),
    variant("B0XXXXXX02", { colore: "aloe" }, 3189, { stock: 40 }),
  ],
  images: [
    img("new-1", "Descrizione immagine", ["#F2ECE1", "#D8CEBD"]), // tono placeholder
  ],
  features: ["Caratteristica 1", "Caratteristica 2"],
  specs: [{ label: "Materiale", value: "Memory foam" }],
  materials: ["Memory foam"],
  reviews: [],                   // può restare vuoto
  createdAt: "2026-07-26",       // guida "Novità" e ordinamento per data
},
```
Lo `sku` di ogni `variant` è l'**ASIN** del prodotto/variante su Amazon.

### Opzioni disponibili (altezza / federa)
Gli helper in cima al file definiscono i valori ammessi:
- `altezzaOption("8", "10", "12", "13", "15", "18")`  → asse **Altezza**
- `federaOption("bamboo", "aloe", "silver", "cotone")` → asse **Federa** (con swatch)

Per aggiungere un nuovo valore (es. una nuova altezza o federa), aggiungilo alle
mappe `ALTEZZE` / `FEDERE` in cima a `data.ts`.

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
