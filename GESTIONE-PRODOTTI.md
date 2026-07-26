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

> **1 prodotto = 1 ASIN.** Ogni prodotto rispecchia 1:1 un'inserzione Amazon
> (titolo, descrizione e prezzo identici) e lo **SKU è l'ASIN** (es. `B0FR6HG72B`),
> così MCF evade con lo stesso identificatore. Se il tuo Seller SKU differisce
> dall'ASIN, mappalo in `AMAZON_MCF_SKU_MAP` (vedi `.env.example`).

Ogni prodotto è un blocco `prod({ ... })`. I campi principali:

```ts
prod({
  id: "onda-bamboo",                 // id interno univoco
  slug: "cervicale-doppia-onda-bamboo", // → /prodotti/<slug>
  sku: "B0FR6HG72B",                 // = ASIN Amazon
  name: "The Double Twenty - Cuscino Cervicale ...", // titolo Amazon esatto
  tagline: "Frase breve per la card.",
  categoryId: "cervicale",           // deve esistere in CATEGORIES
  price: 3189,                        // in centesimi → 31,89 €
  bullets: [                          // = descrizione (bullet Amazon), uno per riga
    "SUPPORTO: ...",
    "2 ALTEZZE: ...",
  ],
  specs: [{ label: "Dimensione", value: "40 × 70 cm" }],
  materials: ["Memory foam", "Bamboo"],
  tone: T.sand,                       // colore del placeholder immagine
  createdAt: "2025-03-01",
  featured: true,                     // opzionale
}),
```

### Cambiare un prezzo
Modifica `price` (in centesimi). Es. a 27,90 €:
```ts
price: 2790,
```

### Mettere in offerta (badge −%)
Aggiungi `compareAt` al blocco `prod({...})` (prezzo pieno barrato, maggiore di
`price`); lo sconto % e il badge si calcolano da soli. Nota: `compareAt` va
passato alla variante — apri `data.ts`, nella funzione `prod` la variante è
`{ sku, options: {}, price, stock }`: aggiungi `compareAtPrice`:
```ts
variants: [{ sku: p.sku, options: {}, price: p.price, compareAtPrice: 3189, stock: 100 }],
```
(Oppure aggiungi un campo `compareAt` a `ProdInput` e passalo lì.)

### Segnare "esaurito"
Nella variante dentro `prod`, metti `stock: 0`. Sotto le 5 unità compare
"Ultimi N pezzi"; a 0 diventa "Esaurito" e il pulsante si disabilita.

### Badge "Novità" / "In evidenza"
Sono proprietà del blocco `prod({...})`:
```ts
isNew: true,     // badge "Novità" + spinta nell'ordinamento "Novità"
featured: true,  // spinta nell'ordinamento "Rilevanza"
```

### Cambiare titolo, descrizione, ecc.
Nel blocco `prod`: `name` (titolo), `tagline` (frase breve card), `bullets`
(descrizione, un punto per riga), `specs` (tabella), `materials` (chip).

### Aggiungere un nuovo prodotto
Copia un blocco `prod({...})` esistente e cambia i campi. **Regole:** `id`,
`slug` e `sku` (ASIN) devono essere **univoci**; `categoryId` deve esistere in
`CATEGORIES`. Toni immagine disponibili: `T.warm`, `T.warm2`, `T.sand`,
`T.sage`, `T.silver`.

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
