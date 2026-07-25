# The Double Twenty — Hero premium (cuscini ergonomici)

Hero cinematografica in stile Awwwards costruita **solo** come sezione d'apertura,
già modulare e pronta per essere estesa con le sezioni successive.

**Sequenza d'apertura**
1. All'apertura, il **logo "The Double Twenty" al centro** su fondo caldo.
2. Il logo **zooma in avanti** e si dissolve: la camera lo attraversa e rivela il
   sito **con il solo video** del prodotto (il reveal del cuscino riparte da zero,
   sincronizzato con lo zoom).
3. A fine intro entrano **menu e pulsanti** della navigazione.
4. Il **video gioca una volta e si ferma** sull'ultimo frame (niente loop). Quando
   si ferma, al **centro** emerge la headline *"Il comfort prende forma."* (GSAP
   SplitText) con i **2 pulsanti**.
5. Allo **scroll** il fotogramma fermo si rimpicciolisce in una card arrotondata,
   il testo si dissolve e si passa alla sezione Collezione — come un piano sequenza.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS 3.4** (design tokens warm-neutral campionati dal video)
- **GSAP + ScrollTrigger + SplitText** — timeline scrubbed, pin, reveal del testo
- **Lenis** — smooth scroll a 60fps, sincronizzato col ticker GSAP
- **Framer Motion** — micro-animazioni d'ingresso (nav, sezione Collezione)

## Avvio

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # build di produzione
```

## Struttura

```
app/
  layout.tsx              # font (Fraunces + Inter), SEO, JSON-LD, lang="it"
  page.tsx                # render di <Experience/>
  globals.css             # design tokens + classi Intro/Hero/Nav/teaser
components/
  Experience.tsx          # orchestratore: stato intro (context) + composizione
  Intro.tsx               # ⭐ sequenza logo -> zoom -> reveal video (+ failsafe)
  SmoothScroll.tsx        # provider Lenis <-> GSAP ScrollTrigger
  Nav.tsx                 # barra minimale, entra a fine intro
  Hero.tsx                # ⭐ pin + timeline cinematografica + SplitText
  CollectionTeaser.tsx    # sezione "La Collezione"
  WhyDifferent.tsx        # ⭐ sezione "Perché è diverso" — 4 card a ventaglio
public/
  videos/hero.mp4|.webm   # video originale (forward, ottimizzato per il web)
  images/hero-poster.jpg  # poster / OG image
  images/logo.png         # logo "The Double Twenty" usato nell'intro
```

## Personalizzazione rapida

- **Logo intro**: sostituisci `public/images/logo.png` (PNG nero su bianco: il CSS
  usa `mix-blend-mode: multiply` per far sparire il bianco). Tempi/zoom in
  `components/Intro.tsx`.
- **Video**: sostituisci `public/videos/hero.*` e `public/images/hero-poster.jpg`.
  Sorgente `definitivo_1.mp4`: rimosse le bande nere (crop 1112×834), tagliato a
  ~5,9s per fermarsi sul cuscino pulito (senza watermark), ottimizzato (H.264 + VP9).
  Il reveal del testo è legato all'evento `ended` del video in `components/Hero.tsx`.
- **Brand / copy**: `components/Nav.tsx` (wordmark "The Double Twenty"),
  `components/Hero.tsx` (headline, sottotitolo, CTA). Metadati SEO in `app/layout.tsx`.
- **Colori**: `tailwind.config.ts` → `colors` e le variabili in `globals.css`.

## Note tecniche

- **Accessibilità**: rispetto completo di `prefers-reduced-motion` (nessun pin,
  nessun autoplay, testo sempre leggibile), focus visibili, HTML semantico, `lang="it"`.
- **Performance**: pagina statica (SSG), video `preload="metadata"` + poster,
  font `display: swap`, `will-change` mirato sugli elementi animati.
- **Lenis + ScrollTrigger**: `lenis.resize()` è agganciato al `refresh` di
  ScrollTrigger — indispensabile, altrimenti lo spacer del pin non viene misurato
  e la pagina resta "bloccata" prima della fine della timeline.
