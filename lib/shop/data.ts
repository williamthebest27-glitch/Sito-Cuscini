/**
 * CATALOGO — unica fonte di verità dei prodotti.
 *
 * Prodotti reali The Double Twenty (fonte: store Amazon.it). Lo **SKU coincide
 * con l'ASIN** Amazon: così MCF può evadere usando lo stesso identificatore
 * (se il tuo Seller SKU/MSKU differisce dall'ASIN, mappalo in AMAZON_MCF_SKU_MAP
 * — vedi lib/integrations). I prezzi sono in centesimi di euro.
 *
 * La UI non importa questo file: passa sempre dal `repository`, così sostituirlo
 * con DB / CMS / API / WooCommerce non richiede modifiche a pagine o componenti.
 */
import type {
  Category,
  OptionType,
  Product,
  ProductImage,
  ProductOption,
  Variant,
} from "./types";

/* ------------------------------------------------------------------ *
 * Vocabolari condivisi (altezza / federa)
 * ------------------------------------------------------------------ */

// Asse "misura" riusato per l'ALTEZZA del cuscino.
const ALTEZZE = {
  "8": "8 cm",
  "10": "10 cm",
  "12": "12 cm",
  "13": "13 cm",
  "15": "15 cm",
  "18": "18 cm",
} as const;

// Asse "colore" riusato per la FEDERA (tessuto rivestimento).
const FEDERE = {
  bamboo: { label: "Bamboo", hex: "#C9B79A", tone: ["#EDE4D3", "#CDBD9F"] },
  aloe: { label: "Aloe Vera", hex: "#A9AE97", tone: ["#C9CEBB", "#9AA187"] },
  silver: { label: "Silver", hex: "#C6C7C4", tone: ["#E8E8E6", "#C4C4C0"] },
  cotone: { label: "Cotone", hex: "#EDE7DB", tone: ["#FAF7F2", "#E4DBCB"] },
} as const;

type AltezzaId = keyof typeof ALTEZZE;
type FederaId = keyof typeof FEDERE;

/* ------------------------------------------------------------------ *
 * Helper di composizione
 * ------------------------------------------------------------------ */

const altezzaOption = (...ids: AltezzaId[]): ProductOption => ({
  type: "misura",
  label: "Altezza",
  values: ids.map((id) => ({ id, label: ALTEZZE[id] })),
});

const federaOption = (...ids: FederaId[]): ProductOption => ({
  type: "colore",
  label: "Federa",
  values: ids.map((id) => ({
    id,
    label: FEDERE[id].label,
    hex: FEDERE[id].hex,
    tone: [...FEDERE[id].tone] as [string, string],
  })),
});

function variant(
  sku: string,
  options: Partial<Record<OptionType, string>>,
  price: number,
  extra: { compareAt?: number; stock?: number } = {},
): Variant {
  const federa = options.colore ? FEDERE[options.colore as FederaId] : undefined;
  return {
    sku,
    options,
    price,
    compareAtPrice: extra.compareAt,
    stock: extra.stock ?? 40,
    tone: federa ? ([...federa.tone] as [string, string]) : undefined,
  };
}

const img = (id: string, alt: string, tone: [string, string]): ProductImage => ({
  id,
  alt,
  tone,
});

/* ------------------------------------------------------------------ *
 * Categorie
 * ------------------------------------------------------------------ */

export const CATEGORIES: Category[] = [
  { id: "cervicale", label: "Cervicale" },
  { id: "classico", label: "Classico" },
  { id: "gravidanza", label: "Gravidanza" },
  { id: "bambino", label: "Bambino" },
];

/* Toni immagine ricorrenti (placeholder brandizzati, in palette) */
const T = {
  warm: ["#FAF7F2", "#E4DBCB"] as [string, string],
  warm2: ["#F2ECE1", "#D8CEBD"] as [string, string],
  sand: ["#EDE4D3", "#CDBD9F"] as [string, string],
  sage: ["#C9CEBB", "#9AA187"] as [string, string],
  silver: ["#E8E8E6", "#C4C4C0"] as [string, string],
};

/* ------------------------------------------------------------------ *
 * Prodotti reali (SKU = ASIN Amazon)
 * ------------------------------------------------------------------ */

export const PRODUCTS: Product[] = [
  {
    id: "doppia-onda",
    slug: "cervicale-doppia-onda",
    name: "Cervicale Doppia Onda",
    tagline: "Doppia altezza 9/11 cm, memory forato traspirante.",
    description:
      "Il cuscino ortopedico cervicale a doppia onda, ideale per il supporto al collo in due diverse posizioni: lato basso da 9 cm per chi cerca un cuscino contenuto, lato alto da 11 cm per un sostegno più deciso. Il memory foam forato garantisce un'elevata traspirazione, il compromesso ideale tra freschezza e sostegno. 100% Made in Italy, certificato OEKO-TEX.",
    categoryId: "cervicale",
    featured: true,
    options: [federaOption("bamboo", "cotone")],
    variants: [
      variant("B0FR6HG72B", { colore: "bamboo" }, 3189, { stock: 120 }),
      variant("B0H26LC3FH", { colore: "cotone" }, 2657, { stock: 90 }),
    ],
    images: [
      img("onda-1", "Cuscino cervicale a doppia onda, vista fronte", T.sand),
      img("onda-2", "Dettaglio del memory foam forato", T.warm2),
    ],
    features: [
      "Profilo a doppia onda, due altezze 9 / 11 cm",
      "Memory foam forato ad alta traspirazione",
      "Federa sfoderabile lavabile con zip laterale",
      "100% Made in Italy · certificato OEKO-TEX",
    ],
    specs: [
      { label: "Dimensione", value: "40 × 70 cm" },
      { label: "Altezze", value: "9 cm / 11 cm" },
      { label: "Materiale", value: "Gel di memory foam forato" },
      { label: "Federa", value: "Bamboo o cotone, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Bamboo"],
    reviews: [
      { id: "onda-r1", author: "Giulia M.", rating: 4, date: "2025-05-18", title: "Comodo e fresco", body: "Il lato alto è perfetto per me che dormo di lato. Federa in bamboo davvero morbida.", verified: true },
      { id: "onda-r2", author: "Marco T.", rating: 4, date: "2025-04-02", body: "Buon sostegno cervicale, ci si abitua in un paio di notti.", verified: true },
    ],
    relatedIds: ["doppia-altezza", "cervicale-silver", "memory-basso-8"],
    createdAt: "2025-03-01",
  },
  {
    id: "doppia-altezza",
    slug: "cervicale-doppia-altezza",
    name: "Cervicale Doppia Altezza",
    tagline: "Ortopedico 12,5/9 cm, federa lavabile a scelta.",
    description:
      "Cuscino cervicale ortopedico a doppia altezza 12,5 / 9 cm: due profili in un unico guanciale per adattarsi alla tua posizione preferita. La federa lavabile è disponibile in Aloe Vera traspirante o in Bamboo antibatterico, entrambe sfoderabili con zip.",
    categoryId: "cervicale",
    isNew: true,
    options: [federaOption("bamboo", "aloe")],
    variants: [
      variant("B0GZLDWFY8", { colore: "bamboo" }, 3100, { stock: 80 }),
      variant("B0GZL1T2CT", { colore: "aloe" }, 3100, { stock: 75 }),
    ],
    images: [
      img("da-1", "Cuscino cervicale doppia altezza, vista fronte", T.sage),
      img("da-2", "Dettaglio della federa sfoderabile", T.sand),
    ],
    features: [
      "Doppia altezza 12,5 / 9 cm",
      "Federa lavabile Aloe Vera o Bamboo",
      "Memory foam ergonomico massaggiante",
      "Sfoderabile con zip",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezze", value: "12,5 cm / 9 cm" },
      { label: "Materiale", value: "Memory foam" },
      { label: "Federa", value: "Aloe Vera o Bamboo, sfoderabile" },
    ],
    materials: ["Memory foam", "Aloe Vera"],
    reviews: [
      { id: "da-r1", author: "Elena R.", rating: 5, date: "2025-06-01", title: "Ottimo", body: "Federa aloe fresca e profumata, altezza perfetta.", verified: true },
      { id: "da-r2", author: "Paolo V.", rating: 4, date: "2025-05-09", body: "Buon prodotto, il lato da 12,5 è quello giusto per me.", verified: true },
    ],
    relatedIds: ["doppia-onda", "cervicale-aloe", "cervicale-silver"],
    createdAt: "2025-04-20",
  },
  {
    id: "cervicale-silver",
    slug: "cervicale-memory-silver",
    name: "Cervicale Memory Silver",
    tagline: "Federa Silver antibatterica, tre altezze.",
    description:
      "Cuscino cervicale in memory foam con federa Silver Argento naturale, dalle proprietà antibatteriche. Disponibile in tre altezze (10, 13 e 15 cm) per assecondare corporatura e posizione del sonno. Ergonomico e massaggiante.",
    categoryId: "cervicale",
    options: [altezzaOption("10", "13", "15")],
    variants: [
      variant("B0FYY516P8", { misura: "10" }, 2834, { stock: 60 }),
      variant("B0FYY2CC9Y", { misura: "13" }, 3189, { stock: 70 }),
      variant("B0FYY2732M", { misura: "15" }, 3455, { stock: 55 }),
    ],
    images: [
      img("silver-1", "Cuscino cervicale memory federa Silver, vista fronte", T.silver),
      img("silver-2", "Dettaglio della federa Silver", T.warm2),
    ],
    features: [
      "Federa Silver Argento antibatterica",
      "Tre altezze: 10 / 13 / 15 cm",
      "Memory foam ergonomico massaggiante",
      "Sfoderabile e lavabile",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezze", value: "10 / 13 / 15 cm" },
      { label: "Materiale", value: "Memory foam" },
      { label: "Federa", value: "Silver Argento, sfoderabile" },
    ],
    materials: ["Memory foam", "Fibra Silver"],
    reviews: [
      { id: "silver-r1", author: "Francesca B.", rating: 5, date: "2025-05-22", title: "Altezza giusta", body: "Ho scelto la 13 cm, sostegno perfetto. Federa antibatterica un plus.", verified: true },
      { id: "silver-r2", author: "Davide C.", rating: 4, date: "2025-03-30", body: "Comodo, la 15 cm è bella alta per chi dorme di lato.", verified: true },
    ],
    relatedIds: ["cervicale-aloe", "doppia-onda", "doppia-altezza"],
    createdAt: "2025-02-10",
  },
  {
    id: "cervicale-aloe",
    slug: "cervicale-memory-aloe-vera",
    name: "Cervicale Memory Aloe Vera",
    tagline: "Federa Aloe Vera traspirante, due altezze.",
    description:
      "Cuscino cervicale in memory foam con federa in Aloe Vera, morbida e traspirante. Disponibile nelle altezze 12 e 15 cm per un sostegno ergonomico e massaggiante, ideale per alleviare le tensioni del collo.",
    categoryId: "cervicale",
    options: [altezzaOption("12", "15")],
    variants: [
      variant("B0F5HWLJ9Z", { misura: "12" }, 3181, { stock: 65 }),
      variant("B0FLSLDKGV", { misura: "15" }, 3712, { stock: 50 }),
    ],
    images: [
      img("aloe-1", "Cuscino cervicale memory federa Aloe Vera, vista fronte", T.sage),
      img("aloe-2", "Dettaglio della federa Aloe Vera", T.warm2),
    ],
    features: [
      "Federa in Aloe Vera traspirante",
      "Due altezze: 12 / 15 cm",
      "Memory foam ergonomico massaggiante",
      "Sfoderabile e lavabile",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezze", value: "12 / 15 cm" },
      { label: "Materiale", value: "Memory foam" },
      { label: "Federa", value: "Aloe Vera, sfoderabile" },
    ],
    materials: ["Memory foam", "Aloe Vera"],
    reviews: [
      { id: "aloe-r1", author: "Chiara P.", rating: 5, date: "2025-06-11", title: "Fresco e comodo", body: "La federa aloe è piacevolissima. Presa la 15 cm, ottima.", verified: true },
      { id: "aloe-r2", author: "Luca F.", rating: 4, date: "2025-04-15", body: "Buon cervicale, la 12 cm va bene per dormire supino.", verified: true },
    ],
    relatedIds: ["cervicale-silver", "doppia-altezza", "doppia-onda"],
    createdAt: "2025-01-28",
  },
  {
    id: "memory-basso-8",
    slug: "memory-basso-8cm",
    name: "Memory Basso 8 cm",
    tagline: "Profilo basso, sostegno deciso ad alta densità.",
    description:
      "Cuscino in memory foam dal profilo basso (8 cm) e ad alta densità, per un sostegno cervicale deciso. Ideale per chi dorme prevalentemente supino o preferisce un guanciale contenuto senza rinunciare all'ergonomia.",
    categoryId: "cervicale",
    options: [],
    variants: [variant("B0FLS3RBY9", {}, 2650, { stock: 70 })],
    images: [
      img("basso-1", "Cuscino memory basso 8 cm, vista fronte", T.warm),
      img("basso-2", "Dettaglio del profilo basso", T.warm2),
    ],
    features: [
      "Profilo basso da 8 cm",
      "Memory foam ad alta densità",
      "Sostegno cervicale deciso",
      "Made in Italy",
    ],
    specs: [
      { label: "Altezza", value: "8 cm" },
      { label: "Materiale", value: "Memory foam alta densità" },
      { label: "Sostegno", value: "Deciso" },
      { label: "Origine", value: "Made in Italy" },
    ],
    materials: ["Memory foam"],
    reviews: [
      { id: "basso-r1", author: "Anna V.", rating: 4, date: "2025-05-03", title: "Basso come cercavo", body: "Finalmente un cuscino non troppo alto ma sostenuto. Perfetto supino.", verified: true },
    ],
    relatedIds: ["doppia-onda", "cervicale-silver", "cervicale-aloe"],
    createdAt: "2025-03-15",
  },
  {
    id: "antirussamento-18",
    slug: "antirussamento-antireflusso-18cm",
    name: "Antirussamento & Antireflusso",
    tagline: "Guanciale alto 18 cm, ergonomico per adulti.",
    description:
      "Guanciale ortopedico ergonomico alto 18 cm, studiato per contrastare russamento e reflusso favorendo una posizione rialzata del busto e del collo. Il memory foam sostiene la cervicale mantenendo le vie respiratorie più libere.",
    categoryId: "cervicale",
    options: [],
    variants: [variant("B0FYY9LLDX", {}, 4164, { stock: 45 })],
    images: [
      img("anti-1", "Cuscino antirussamento 18 cm, vista laterale", T.warm2),
      img("anti-2", "Dettaglio del profilo rialzato", T.sand),
    ],
    features: [
      "Profilo alto 18 cm",
      "Aiuta contro russamento e reflusso",
      "Memory foam ergonomico",
      "Sostegno cervicale rialzato",
    ],
    specs: [
      { label: "Altezza", value: "18 cm" },
      { label: "Materiale", value: "Memory foam" },
      { label: "Uso", value: "Antirussamento · antireflusso" },
      { label: "Origine", value: "Made in Italy" },
    ],
    materials: ["Memory foam"],
    reviews: [
      { id: "anti-r1", author: "Roberto S.", rating: 4, date: "2025-06-05", title: "Mi aiuta a dormire", body: "Rialzato al punto giusto, il reflusso notturno è molto migliorato.", verified: true },
    ],
    relatedIds: ["doppia-onda", "cervicale-silver", "memory-basso-8"],
    createdAt: "2025-04-10",
  },
  {
    id: "allattamento",
    slug: "cuscino-allattamento",
    name: "Cuscino Allattamento",
    tagline: "A ferro di cavallo, fiocco memory e fibra.",
    description:
      "Cuscino per l'allattamento a forma di ferro di cavallo (58 × 50 cm), imbottito in fiocco di memory foam e fibra di poliestere per un sostegno morbido e avvolgente. Sfoderabile e lavabile, accompagna mamma e bambino nei momenti di riposo.",
    categoryId: "gravidanza",
    options: [],
    variants: [variant("B0GVSV5SBH", {}, 2391, { stock: 60 })],
    images: [
      img("all-1", "Cuscino allattamento a ferro di cavallo", T.warm),
      img("all-2", "Dettaglio dell'imbottitura", T.sage),
    ],
    features: [
      "Forma a ferro di cavallo",
      "Imbottitura in fiocco memory + fibra",
      "Sfoderabile e lavabile",
      "Sostegno morbido per allattamento",
    ],
    specs: [
      { label: "Dimensione", value: "58 × 50 cm" },
      { label: "Imbottitura", value: "Fiocco memory + fibra poliestere" },
      { label: "Fodera", value: "Sfoderabile, lavabile" },
      { label: "Uso", value: "Allattamento · relax" },
    ],
    materials: ["Fiocco memory", "Fibra poliestere"],
    reviews: [
      { id: "all-r1", author: "Federica L.", rating: 5, date: "2025-05-27", title: "Morbidissimo", body: "Comodo per l'allattamento e anche come sostegno lombare. Consigliato.", verified: true },
    ],
    relatedIds: ["baby-antisoffoco", "fiocco-memory", "doppia-onda"],
    createdAt: "2025-05-01",
  },
  {
    id: "baby-antisoffoco",
    slug: "baby-antisoffoco",
    name: "Baby Antisoffoco",
    tagline: "Neonato 50×30, 100% memory millefori.",
    description:
      "Cuscino per neonato antisoffoco 50 × 30 cm, in 100% memory foam con tecnica millefori per la massima traspirazione. Ipoallergenico e delicato, pensato per accompagnare il riposo dei più piccoli in sicurezza.",
    categoryId: "bambino",
    // Nota: su Amazon esiste una seconda variante colore (ASIN B0FYYF4MMF)
    // da aggiungere qui come ulteriore variant() se distinta.
    options: [],
    variants: [variant("B0FYYH1TMR", {}, 1772, { stock: 100 })],
    images: [
      img("baby-1", "Cuscino baby antisoffoco, vista fronte", T.warm),
      img("baby-2", "Dettaglio della tecnica millefori", T.warm2),
    ],
    features: [
      "Formato neonato 50 × 30 cm",
      "100% memory foam, tecnica millefori",
      "Traspirante e ipoallergenico",
      "Delicato e sicuro",
    ],
    specs: [
      { label: "Dimensione", value: "50 × 30 cm" },
      { label: "Materiale", value: "100% memory foam millefori" },
      { label: "Caratteristica", value: "Antisoffoco · ipoallergenico" },
      { label: "Uso", value: "Neonato" },
    ],
    materials: ["Memory foam"],
    reviews: [
      { id: "baby-r1", author: "Silvia M.", rating: 5, date: "2025-06-08", title: "Perfetto e traspirante", body: "Leggero e forato, per il neonato è l'ideale. Materiali sicuri.", verified: true },
    ],
    relatedIds: ["allattamento", "fiocco-memory", "letto-microfibra"],
    createdAt: "2025-05-12",
  },
  {
    id: "fiocco-memory",
    slug: "cuscino-fiocco-memory",
    name: "Fiocco di Memory",
    tagline: "40×70, imbottitura in fiocco traspirante.",
    description:
      "Guanciale ortopedico ergonomico 40 × 70 cm imbottito in fiocco di memory foam: morbido, avvolgente e traspirante. Un classico versatile per il riposo di tutti i giorni, adatto anche a chi cerca un cuscino modellabile.",
    categoryId: "classico",
    options: [],
    variants: [variant("B0GGJC4PBB", {}, 1772, { stock: 85 })],
    images: [
      img("fiocco-1", "Cuscino in fiocco di memory 40x70, vista fronte", T.warm),
      img("fiocco-2", "Dettaglio dell'imbottitura in fiocco", T.warm2),
    ],
    features: [
      "Imbottitura in fiocco di memory",
      "Formato 40 × 70 cm",
      "Morbido e modellabile",
      "Traspirante",
    ],
    specs: [
      { label: "Dimensione", value: "40 × 70 cm" },
      { label: "Imbottitura", value: "Fiocco di memory foam" },
      { label: "Sostegno", value: "Morbido, modellabile" },
      { label: "Origine", value: "Made in Italy" },
    ],
    materials: ["Fiocco memory"],
    reviews: [
      { id: "fiocco-r1", author: "Monica D.", rating: 4, date: "2025-04-28", title: "Morbido", body: "Bello soffice e si adatta bene alla testa. Buon prezzo.", verified: true },
    ],
    relatedIds: ["letto-microfibra", "baby-antisoffoco", "allattamento"],
    createdAt: "2025-03-22",
  },
  {
    id: "letto-microfibra",
    slug: "cuscino-letto-microfibra",
    name: "Cuscino Letto Microfibra",
    tagline: "40×70 sfoderabile, altezza regolabile.",
    description:
      "Cuscino da letto 40 × 70 cm con imbottitura in fibra di poliestere e altezza regolabile: aggiungi o togli imbottitura per trovare il tuo comfort. Sfoderabile e facile da lavare, il classico soffice ed economico.",
    categoryId: "classico",
    options: [],
    variants: [variant("B0FTK35KDP", {}, 1329, { stock: 110 })],
    images: [
      img("micro-1", "Cuscino letto in microfibra 40x70, vista fronte", T.warm2),
      img("micro-2", "Dettaglio della fodera sfoderabile", T.warm),
    ],
    features: [
      "Formato 40 × 70 cm",
      "Imbottitura in fibra di poliestere",
      "Altezza regolabile",
      "Sfoderabile e lavabile",
    ],
    specs: [
      { label: "Dimensione", value: "40 × 70 cm" },
      { label: "Imbottitura", value: "Fibra di poliestere" },
      { label: "Altezza", value: "Regolabile" },
      { label: "Fodera", value: "Sfoderabile, lavabile" },
    ],
    materials: ["Microfibra"],
    reviews: [
      { id: "micro-r1", author: "Nicola F.", rating: 4, date: "2025-05-15", title: "Buon economico", body: "Soffice e leggero, comodo poter regolare l'imbottitura.", verified: true },
    ],
    relatedIds: ["fiocco-memory", "baby-antisoffoco", "doppia-onda"],
    createdAt: "2025-02-25",
  },
];
