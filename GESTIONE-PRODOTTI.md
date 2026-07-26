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

Ogni prodotto ha una o più **varianti** (SKU). Il prezzo, l'offerta e la giacenza
sono **per variante**, dentro la funzione `variant(...)`:

```ts
variant("AUR-MED", { rigidita: "medio" }, 8900, { compareAt: 10900, stock: 22 }),
//        SKU        opzione scelta        prezzo   prezzo pieno       giacenza
//                                         (89,00€) (109,00€ barrato)
```

### Cambiare un prezzo
Modifica il numero del prezzo (in centesimi). Es. Aurora Medio a 79,90 €:
```ts
variant("AUR-MED", { rigidita: "medio" }, 7990, { compareAt: 10900, stock: 22 }),
```

### Mettere in offerta (badge −%)
Aggiungi `compareAt` (prezzo pieno barrato) **maggiore** del prezzo. Lo sconto %
e il badge si calcolano da soli:
```ts
variant("NUV-MOR", { rigidita: "morbido" }, 5900, { compareAt: 6900, stock: 26 }),
// mostra 59,00 € con 69,00 € barrato e badge −14%
```
Per **togliere** l'offerta: rimuovi `compareAt`.

### Segnare "esaurito"
Metti `stock: 0`. Sotto le 5 unità compare "Ultimi N pezzi"; a 0 diventa "Esaurito"
e il pulsante si disabilita.
```ts
variant("RIV-6080", { misura: "60x80" }, 11200, { stock: 0 }),
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
  options: [rigiditaOption("medio", "rigido")], // oppure misuraOption / coloreOption
  variants: [
    variant("NEW-MED", { rigidita: "medio" }, 8900, { stock: 15 }),
    variant("NEW-RIG", { rigidita: "rigido" }, 8900, { stock: 10 }),
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

### Opzioni disponibili (misura / rigidità / colore)
Gli helper in cima al file definiscono i valori ammessi:
- `misuraOption("40x60", "50x70", "60x80", "compatto", "unica")`
- `rigiditaOption("morbido", "medio", "rigido")`
- `coloreOption("naturale", "sabbia", "argilla", "grafite", "salvia")`

Per aggiungere un nuovo valore (es. una nuova misura), aggiungilo alle mappe
`MISURE` / `RIGIDITA` / `COLORS` in cima a `data.ts`.

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
