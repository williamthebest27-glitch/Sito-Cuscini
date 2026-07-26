/**
 * CATALOGO — unica fonte di verità dei prodotti.
 *
 * Prodotti reali The Double Twenty, allineati alle inserzioni Amazon.it con le
 * **varianti reali** (colori/misure): ogni combinazione mappa all'**ASIN**
 * corretto, usato come **SKU** (così MCF evade con lo stesso identificatore; se
 * il tuo Seller SKU differisce, mappalo in AMAZON_MCF_SKU_MAP).
 *
 * Prezzi in centesimi. La descrizione riporta i punti elenco Amazon, uno per riga.
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
 * Colori / federe (asse "colore")
 * ------------------------------------------------------------------ */

const COLORS = {
  bamboo: { label: "Bamboo", hex: "#C9B79A", tone: ["#EDE4D3", "#CDBD9F"] },
  aloe: { label: "Aloe Vera", hex: "#A9AE97", tone: ["#C9CEBB", "#9AA187"] },
  silver: { label: "Argento Silver", hex: "#C6C7C4", tone: ["#E8E8E6", "#C4C4C0"] },
  cotone: { label: "Cotone", hex: "#EDE7DB", tone: ["#FAF7F2", "#E4DBCB"] },
  memoryblu: { label: "Memory Blu", hex: "#6E86A8", tone: ["#AEC0D6", "#5E79A0"] },
  memoryrosa: { label: "Memory Rosa", hex: "#D8A7B4", tone: ["#EBCAD3", "#C98BA0"] },
  beige: { label: "Beige", hex: "#D8C6AE", tone: ["#EFE6D5", "#CBB894"] },
  blu: { label: "Blu", hex: "#6E86A8", tone: ["#AEC0D6", "#5E79A0"] },
  giallo: { label: "Giallo", hex: "#D9C169", tone: ["#ECD98F", "#C9AE4E"] },
  grigio: { label: "Grigio", hex: "#9A9A97", tone: ["#C7C7C4", "#8A8A86"] },
  rosa: { label: "Rosa", hex: "#D8A7B4", tone: ["#EBCAD3", "#C98BA0"] },
  verde: { label: "Verde", hex: "#8DA57F", tone: ["#C9CEBB", "#9AA187"] },
} as const;

type ColorId = keyof typeof COLORS;

/* ------------------------------------------------------------------ *
 * Helper opzioni / varianti
 * ------------------------------------------------------------------ */

const coloreOption = (label: string, ...ids: ColorId[]): ProductOption => ({
  type: "colore",
  label,
  values: ids.map((id) => ({
    id,
    label: COLORS[id].label,
    hex: COLORS[id].hex,
    tone: [...COLORS[id].tone] as [string, string],
  })),
});

const sizeOption = (
  label: string,
  values: { id: string; label: string }[],
): ProductOption => ({ type: "misura", label, values });

const formatoOption = (
  ...values: { id: string; label: string }[]
): ProductOption => ({ type: "rigidita", label: "Formato", values });

function variant(
  sku: string,
  options: Partial<Record<OptionType, string>>,
  price: number,
  extra: { compareAt?: number; stock?: number } = {},
): Variant {
  const colore = options.colore ? COLORS[options.colore as ColorId] : undefined;
  return {
    sku,
    options,
    price,
    compareAtPrice: extra.compareAt,
    stock: extra.stock ?? 100,
    tone: colore ? ([...colore.tone] as [string, string]) : undefined,
  };
}

const img = (id: string, alt: string, tone: [string, string]): ProductImage => ({
  id,
  alt,
  tone,
});

const T = {
  warm: ["#FAF7F2", "#E4DBCB"] as [string, string],
  warm2: ["#F2ECE1", "#D8CEBD"] as [string, string],
  sand: ["#EDE4D3", "#CDBD9F"] as [string, string],
  sage: ["#C9CEBB", "#9AA187"] as [string, string],
  silver: ["#E8E8E6", "#C4C4C0"] as [string, string],
};

export const CATEGORIES: Category[] = [
  { id: "cervicale", label: "Cervicale" },
  { id: "classico", label: "Classico" },
  { id: "gravidanza", label: "Gravidanza" },
  { id: "bambino", label: "Bambino" },
];

interface MkInput {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  categoryId: string;
  bullets: string[];
  specs: { label: string; value: string }[];
  materials: string[];
  tone: [string, string];
  createdAt: string;
  options: ProductOption[];
  variants: Variant[];
  isNew?: boolean;
  featured?: boolean;
  relatedIds?: string[];
}

function mk(p: MkInput): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.bullets.join("\n\n"),
    categoryId: p.categoryId,
    isNew: p.isNew,
    featured: p.featured,
    options: p.options,
    variants: p.variants,
    images: [
      img(`${p.id}-1`, p.name.slice(0, 70), p.tone),
      img(`${p.id}-2`, `${p.name.slice(0, 50)} — dettaglio`, T.warm2),
    ],
    features: [],
    specs: p.specs,
    materials: p.materials,
    reviews: [],
    relatedIds: p.relatedIds,
    createdAt: p.createdAt,
  };
}

/* Varianti allattamento/gravidanza: Formato × Colore (12 SKU) */
const ALLATT_ASINS: Record<"allattamento" | "gravidanza", Record<string, string>> = {
  allattamento: {
    beige: "B0GVSV5SBH",
    blu: "B0GVT44MX1",
    giallo: "B0GVT7QFYL",
    grigio: "B0GVSXQPGM",
    rosa: "B0GVT3XQ5R",
    verde: "B0GVT5ZR4N",
  },
  gravidanza: {
    beige: "B0GVSZ6SZ2",
    blu: "B0GVT1LHBB",
    giallo: "B0GVT1361T",
    grigio: "B0GVT1SN73",
    rosa: "B0GVT14JCT",
    verde: "B0GVSXRPSF",
  },
};
const ALLATT_PRICE = { allattamento: 2391, gravidanza: 3278 } as const;
const allattamentoVariants: Variant[] = (
  ["allattamento", "gravidanza"] as const
).flatMap((formato) =>
  (["beige", "blu", "giallo", "grigio", "rosa", "verde"] as const).map((colore) =>
    variant(ALLATT_ASINS[formato][colore], { rigidita: formato, colore }, ALLATT_PRICE[formato]),
  ),
);

/* ------------------------------------------------------------------ *
 * Prodotti (SKU = ASIN; varianti reali Amazon)
 * ------------------------------------------------------------------ */

export const PRODUCTS: Product[] = [
  mk({
    id: "doppia-onda",
    slug: "cervicale-doppia-onda",
    name: "The Double Twenty - Cuscino Cervicale per Dormire a Doppia Onda Elevato Supporto Collo - Guanciale Memory Foam Federa Lavabile",
    tagline: "Cervicale a doppia onda 9/11 cm, memory forato traspirante.",
    categoryId: "cervicale",
    featured: true,
    options: [coloreOption("Federa", "bamboo", "aloe")],
    variants: [
      variant("B0FR6HG72B", { colore: "bamboo" }, 3189),
      variant("B0GWN465B1", { colore: "aloe" }, 3189),
    ],
    bullets: [
      "SUPPORTO: cuscino ortopedico cervicale a doppia onda ideale per supporto al collo, il nostro cuscino letto è utilizzabile in due differenti posizioni previene e tratta dolore, russamento e apnee",
      "2 ALTEZZE: cuscino per cervicale di dimensione 40x70cm con lati di altezza differenti 9cm ideale per chi cerca un cuscino basso per dormire e 11cm perfetto per chi sta cercando un cuscino alto",
      "LAVABILE: cuscino ergonomico cervicale con rivestimento sfoderabile con zip laterale, il tessuto è la miglior opzione per chi cerca un cuscino antiacaro anallergico facile da lavare",
      "MEMORY FOAM FORATO: cuscino per dormire ad alto potere traspirante grazie alla sua struttura forata, il nostro guanciale letto è il compromesso ideale tra freschezza e supporto cervicale e lombare",
      "100% MADE IN ITALY: produciamo cuscini letto matrimoniale e singolo sul territorio, ogni nostro cuscino in memory foam è privo di sostanze nocive, per l'uomo e l'ambiente con certificazione OEKO TEX",
    ],
    specs: [
      { label: "Dimensione", value: "40 × 70 cm" },
      { label: "Altezze", value: "9 cm / 11 cm" },
      { label: "Materiale", value: "Memory foam forato" },
      { label: "Federa", value: "Bamboo o Aloe Vera, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Bamboo", "Aloe Vera"],
    tone: T.sand,
    createdAt: "2025-03-01",
    relatedIds: ["doppia-altezza", "cervicale-silver", "antirussamento"],
  }),
  mk({
    id: "doppia-altezza",
    slug: "cervicale-doppia-altezza-farfalla",
    name: "The Double Twenty – Cuscino Cervicale per Dormire Ortopedico Doppia Altezza 12,5/9cm - Memory Foam Antirussamento a Farfalla - Made in Italy e Oeko Tex",
    tagline: "Ortopedico a farfalla, doppia altezza 12,5/9 cm, 3 posizioni.",
    categoryId: "cervicale",
    isNew: true,
    options: [coloreOption("Federa", "bamboo", "aloe", "silver")],
    variants: [
      variant("B0GZLDWFY8", { colore: "bamboo" }, 3100),
      variant("B0GZL1T2CT", { colore: "aloe" }, 3100),
      variant("B0GYZ7VFXF", { colore: "silver" }, 3100),
    ],
    bullets: [
      "FEDERA LAVABILE, TRASPIRANTE, IPOALLERGENICA: federa naturalmente termoregolante, morbida e ipoallergenica. Sfoderabile e lavabile in lavatrice.",
      "CUSCINO CERVICALE ORTOPEDICO – 3 POSIZIONI DI DORMITA: Forma a farfalla con zone differenziate: sostiene collo e colonna in posizione supina, laterale e prona. Braccioli integrati riducono la pressione su spalle e polsi.",
      "DOPPIA ALTEZZA – 12,5 CM E 9 CM: Lato alto per chi dorme sulla schiena, lato basso per chi dorme su un fianco o prono. Basta girarlo: un solo cuscino per ogni corporatura.",
      "ANTI RUSSAMENTO – MEMORY FOAM PREMIUM – 60x35 CM: Mantiene testa e collo allineati per una respirazione più libera. Il memory foam si adatta al corpo e allevia la pressione. Sempre fresco.",
      "MADE IN ITALY – OEKO-TEX STANDARD 100: Progettato e prodotto interamente in Italia. Memory foam certificato OEKO-TEX (1701002 Centexbel): sicuro, privo di sostanze nocive, rispettoso dell'ambiente.",
    ],
    specs: [
      { label: "Dimensione", value: "60 × 35 cm" },
      { label: "Altezze", value: "12,5 cm / 9 cm" },
      { label: "Materiale", value: "Memory foam premium" },
      { label: "Federa", value: "Bamboo, Aloe Vera o Argento Silver" },
      { label: "Certificazioni", value: "OEKO-TEX Standard 100 · Made in Italy" },
    ],
    materials: ["Memory foam", "Bamboo", "Aloe Vera", "Argento"],
    tone: T.sand,
    createdAt: "2025-04-20",
    relatedIds: ["doppia-onda", "cervicale-aloe", "antirussamento"],
  }),
  mk({
    id: "cervicale-silver",
    slug: "cervicale-memory-72x42-silver",
    name: "Double Twenty Cuscino Cervicale Memory 72x42 cm - Federa Silver Argento Naturale Antibatterica - Ergonomico Massaggiante Sfoderabile Antiacaro - Made in Italy",
    tagline: "Cervicale memory, federa argento antibatterica, 4 altezze.",
    categoryId: "cervicale",
    options: [
      sizeOption("Altezza", [
        { id: "8", label: "8 cm" },
        { id: "10", label: "10 cm" },
        { id: "13", label: "13 cm" },
        { id: "15", label: "15 cm" },
      ]),
    ],
    variants: [
      variant("B0H5THM9NZ", { misura: "8" }, 2657),
      variant("B0FYY516P8", { misura: "10" }, 2834),
      variant("B0FYY2CC9Y", { misura: "13" }, 3189),
      variant("B0FYY2732M", { misura: "15" }, 3455),
    ],
    bullets: [
      "4 ALTEZZE – Scegli il Supporto Giusto per Te: altezza pensata per allineare correttamente testa, collo e colonna vertebrale in base alla tua posizione di dormita preferita, tra 4 misure disponibili (8, 10, 13, 15 cm).",
      "SCHIUMA VISCOELASTICA INNOVATIVA – Comfort su Misura: si adatta perfettamente alla forma di collo e testa, per un supporto personalizzato e duraturo notte dopo notte.",
      "FEDERA IN ARGENTO NATURALE – Proprietà Antibatteriche: tessitura con fili d'argento che contrasta i batteri, favorisce la traspirabilità e la sensazione di freschezza tutta la notte.",
      "TECNICA MILLEFORI – Traspirabilità Assicurata: la struttura forata favorisce il passaggio dell'aria, mantenendo il cuscino fresco, igienico e asciutto.",
      "MADE IN ITALY – Certificato OEKO-TEX, Antiacaro ed Ergonomico: qualità italiana con materiali selezionati, sostiene correttamente testa e collo. Sfoderabile e arriva arrotolato, pronto in 5 minuti.",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezze", value: "8 / 10 / 13 / 15 cm" },
      { label: "Materiale", value: "Schiuma viscoelastica millefori" },
      { label: "Federa", value: "Argento naturale, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Fibra d'argento"],
    tone: T.silver,
    createdAt: "2025-02-10",
    relatedIds: ["cervicale-aloe", "doppia-onda", "antirussamento"],
  }),
  mk({
    id: "cervicale-aloe",
    slug: "cervicale-memory-72x42-aloe-vera",
    name: "Double Twenty Cuscino Cervicale Memory 72x42 cm - Federa Aloe Vera Traspirante - Ergonomico Massaggiante Sfoderabile Antiacaro - Made in Italy",
    tagline: "Cervicale memory, federa aloe vera traspirante, 4 altezze.",
    categoryId: "cervicale",
    options: [
      sizeOption("Altezza", [
        { id: "8", label: "8 cm" },
        { id: "10", label: "10 cm" },
        { id: "12", label: "12 cm" },
        { id: "15", label: "15 cm" },
      ]),
    ],
    variants: [
      variant("B0FLS3RBY9", { misura: "8" }, 2650),
      variant("B0H5W7L6QD", { misura: "10" }, 2923),
      variant("B0F5HWLJ9Z", { misura: "12" }, 3181),
      variant("B0FLSLDKGV", { misura: "15" }, 3712),
    ],
    bullets: [
      "SUPPORTO ERGONOMICO AD ALTA DENSITÀ: Realizzato in memory foam viscoelastico ad alta densità, il cuscino sostiene testa e collo favorendo un corretto allineamento della colonna vertebrale durante il riposo.",
      "SOSTEGNO DECISO: Progettato per offrire un supporto cervicale stabile e strutturato, ideale per chi cerca un sostegno più deciso rispetto ai cuscini tradizionali morbidi. Scegli l'altezza più adatta a te.",
      "ADATTAMENTO GRADUALE: Il memory foam reagisce al peso e al calore corporeo adattandosi progressivamente alla forma del corpo. Potrebbe essere necessario un breve periodo iniziale di adattamento.",
      "FEDERA ALOE VERA TRASPIRANTE E LAVABILE: Federa morbida con trattamento Aloe Vera, traspirante, ipoallergenica, sfoderabile e lavabile in lavatrice per garantire freschezza e praticità quotidiana",
      "IDEALE PER POSIZIONE SUPINA E LATERALE: il design ergonomico a saponetta è studiato per offrire supporto a chi dorme prevalentemente sulla schiena o sul fianco.",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezze", value: "8 / 10 / 12 / 15 cm" },
      { label: "Materiale", value: "Memory foam alta densità" },
      { label: "Federa", value: "Aloe Vera, sfoderabile" },
      { label: "Origine", value: "Made in Italy" },
    ],
    materials: ["Memory foam", "Aloe Vera"],
    tone: T.sage,
    createdAt: "2025-01-28",
    relatedIds: ["cervicale-silver", "doppia-onda", "doppia-altezza"],
  }),
  mk({
    id: "antirussamento",
    slug: "antirussamento-antireflusso",
    name: "Double Twenty Cuscino Antirussamento e Antireflusso Adulti in Memory Foam - Guanciale Ortopedico Ergonomico Cervicale - Antiacaro Federa Argento Naturale - Made in Italy",
    tagline: "Antirussamento e antireflusso, memory foam, federa argento.",
    categoryId: "cervicale",
    options: [
      sizeOption("Altezza", [
        { id: "h15", label: "15 cm" },
        { id: "h18", label: "18 cm" },
      ]),
    ],
    variants: [
      variant("B0H5W4KXV8", { misura: "h15" }, 3898),
      variant("B0FYY9LLDX", { misura: "h18" }, 4164),
    ],
    bullets: [
      "AIUTA CONTRO RUSSAMENTO E REFLUSSO: il cuscino antirussamento e antireflusso mantiene l'allineamento di testa, collo e spalle, per un sonno più profondo e rigenerante.",
      "CUSCINO CERVICALE MEMORY FOAM – Guanciale Ergonomico Ortopedico: schiuma viscoelastica automodellante con trama massaggiante, ideale per dormire e sostenere correttamente testa e collo.",
      "FEDERA IN ARGENTO NATURALE – Proprietà Antibatteriche: tessitura con fili d'argento che contrasta i batteri, favorisce la traspirabilità e la sensazione di freschezza tutta la notte.",
      "ANTIACARO E TRASPIRANTE – Certificato OEKO-TEX: protegge da acari e allergeni, sostiene correttamente testa e collo con comfort su misura. Guanciale sfoderabile e facile da lavare.",
      "MADE IN ITALY: cuscino cervicale memory prodotto in Italia con cura nei dettagli. Arriva arrotolato e compatto: basta aprire la confezione e attendere 5 minuti.",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezze", value: "15 cm / 18 cm" },
      { label: "Materiale", value: "Memory foam viscoelastico" },
      { label: "Federa", value: "Argento naturale, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Fibra d'argento"],
    tone: T.silver,
    createdAt: "2025-04-10",
    relatedIds: ["cervicale-silver", "doppia-onda", "doppia-altezza"],
  }),
  mk({
    id: "allattamento",
    slug: "cuscino-allattamento-gravidanza",
    name: "Double Twenty Cuscino Allattamento e Gravidanza a Ferro di Cavallo - Fiocco Memory Foam e Fibra Poliestere - Sfoderabile Lavabile Antiacaro - Made in Italy",
    tagline: "A ferro di cavallo, fiocco memory, formato e colore a scelta.",
    categoryId: "gravidanza",
    options: [
      formatoOption(
        { id: "allattamento", label: "Allattamento" },
        { id: "gravidanza", label: "Gravidanza" },
      ),
      coloreOption("Colore", "beige", "blu", "giallo", "grigio", "rosa", "verde"),
    ],
    variants: allattamentoVariants,
    bullets: [
      "SUPPORTO MORBIDO E STABILE DURANTE L’ALLATTAMENTO: Progettato per offrire una posizione più comoda durante la poppata, aiutando a sostenere delicatamente il bambino e ridurre la pressione su braccia, spalle e schiena della mamma",
      "VERI FIOCCHI DI MEMORY FOAM: L’imbottitura combina veri fiocchi di memory foam e soffice fibra per garantire un comfort più avvolgente, traspirante e sostenitivo rispetto ai classici cuscini imbottiti solo in poliestere",
      "FEDERA IPOALLERGENICA SFODERABILE: La federa antibatterica è morbida e delicata sulla pelle del bambino. Grazie alla pratica zip invisibile può essere facilmente rimossa e lavata per mantenere il cuscino sempre fresco e pulito",
      "IDEALE PER RELAX, GIOCO E TUMMY TIME: Perfetto non solo per l’allattamento, ma anche come supporto per relax, tummy time e momenti di gioco sotto supervisione. Un accessorio versatile pensato per accompagnare la crescita del bambino",
      "OEKO-TEX E MADE IN ITALY: Realizzato in Italia con materiali certificati OEKO-TEX privi di sostanze nocive. Un cuscino progettato per offrire qualità, comfort e sicurezza con uno stile elegante e premium",
    ],
    specs: [
      { label: "Dimensione", value: "58 × 50 cm" },
      { label: "Forma", value: "Ferro di cavallo" },
      { label: "Formato", value: "Allattamento o Gravidanza" },
      { label: "Colori", value: "Beige, Blu, Giallo, Grigio, Rosa, Verde" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Fiocco memory", "Fibra poliestere"],
    tone: T.warm,
    createdAt: "2025-05-01",
    relatedIds: ["baby-antisoffoco", "fiocco-memory", "doppia-onda"],
  }),
  mk({
    id: "baby-antisoffoco",
    slug: "cuscino-baby-antisoffoco",
    name: "Double Twenty Cuscino Baby Memory Antisoffoco 50x30 cm - Cuscino Neonato 100% Memory Puro Tecnica Millefori - Ipoallergenico Antiacaro Sfoderabile - Made in Italy",
    tagline: "Neonato 50×30 antisoffoco, memory millefori, colore a scelta.",
    categoryId: "bambino",
    options: [coloreOption("Variante", "cotone", "memoryblu", "memoryrosa")],
    variants: [
      variant("B0G5BNT8XN", { colore: "cotone" }, 1329),
      variant("B0FYYH1TMR", { colore: "memoryblu" }, 1772),
      variant("B0FYYF4MMF", { colore: "memoryrosa" }, 1772),
    ],
    bullets: [
      "TECNICA MILLEFORI ANTISOFFOCO – Massima Sicurezza: la struttura forata garantisce massima traspirabilità, per un sonno sempre fresco e sicuro dalla nascita.",
      "MEMORY FOAM INNOVATIVA – Si Adatta alla Testa del Bambino: schiuma automodellante che si adatta delicatamente alla testa del neonato, per un sostegno ideale in ogni fase della crescita.",
      "FEDERA IPOALLERGENICA E ANTIACARO – Pelle Sensibile Protetta: tessuto morbido e delicato, protegge la pelle del bambino da acari e allergeni per un riposo sicuro.",
      "PER TUTTE LE ETÀ – Da 0-12 Mesi a 1+ Anni: sostiene naturalmente la testa del neonato seguendo le curve del corpo, e mantiene la sua forma offrendo comfort prolungato durante la crescita.",
      "MADE IN ITALY – Sfoderabile e Lavabile: certificato OEKO-TEX per la sicurezza del tuo bambino, fodera rimovibile e facile da lavare in lavatrice. Cuscino pratico, leggero, arrotolato per il trasporto.",
    ],
    specs: [
      { label: "Dimensione", value: "50 × 30 cm" },
      { label: "Materiale", value: "100% memory foam millefori" },
      { label: "Varianti", value: "Cotone, Memory Blu, Memory Rosa" },
      { label: "Età", value: "Da 0-12 mesi a 1+ anni" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Cotone"],
    tone: T.warm,
    createdAt: "2025-05-12",
    relatedIds: ["allattamento", "fiocco-memory", "microfibra"],
  }),
  mk({
    id: "fiocco-memory",
    slug: "cuscino-fiocco-memory-foam",
    name: "The Double Twenty Cuscino in Fiocco di Memory Foam Ortopedico Ergonomico per Cervicale e Collo, Traspirante e Antiacaro, per Tutte le Posizioni di Sonno, OEKO-TEX, Made in Italy",
    tagline: "Fiocco di memory, ortopedico, in due misure.",
    categoryId: "classico",
    options: [
      sizeOption("Misura", [
        { id: "40x70", label: "40 × 70 cm" },
        { id: "48x78", label: "48 × 78 cm" },
      ]),
    ],
    variants: [
      variant("B0GGJC4PBB", { misura: "40x70" }, 1772),
      variant("B0GSWMZ465", { misura: "48x78" }, 1948),
    ],
    bullets: [
      "Cuscino fiocco memory foam: grazie alla schiuma viscoelastica ad alta densità, il cuscino si adatta perfettamente ai contorni di capo e collo, favorendo un allineamento neutro della colonna vertebrale e riducendo il dolore cervicale al risveglio.",
      "Argento naturale: la fodera, intelaiata con argento, è naturalmente antibatterica e ipoallergenica, ideale per pelli sensibili e soggetti a reazioni allergiche, mantenendo un ambiente di riposo fresco e pulito.",
      "La schiuma ad alta densità distribuisce uniformemente il peso della testa, alleviando i punti di pressione e prevenendo intorpidimenti, per un sonno profondo e rigenerante.",
      "Progettato per offrire sostegno al collo, questo cuscino letto in fiocco di memory foam è ideale per chi alterna posizione supina e laterale, garantendo sempre comfort personalizzato.",
      "Design: i fiocchi in memory, strategicamente posizionati nella struttura favoriscono la circolazione dell’aria interna, migliorando traspirabilità e ventilazione per un sonno asciutto e senza accumulo di umidità.",
    ],
    specs: [
      { label: "Misure", value: "40 × 70 cm / 48 × 78 cm" },
      { label: "Imbottitura", value: "Fiocco di memory foam alta densità" },
      { label: "Federa", value: "Argento naturale, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Fiocco memory", "Fibra d'argento"],
    tone: T.warm2,
    createdAt: "2025-03-22",
    relatedIds: ["microfibra", "allattamento", "doppia-onda"],
  }),
  mk({
    id: "microfibra",
    slug: "cuscino-letto-microfibra-40x70",
    name: "The Double Twenty Cuscino Letto 40x70 cm Sfoderabile in Microfibra – Altezza Regolabile, Imbottitura in Fibra di Poliestere, Lavabili con Cerniera – Certificazione OEKO-TEX®, Made in Italy",
    tagline: "Cuscino letto 40×70 microfibra, altezza regolabile.",
    categoryId: "classico",
    options: [],
    variants: [variant("B0FTK35KDP", {}, 1329)],
    bullets: [
      "Cuscino 40×70 cm – Perfetto per il letto matrimoniale o per aggiornare la qualità del proprio riposo.",
      "Federa in microfibra sfoderabile – Tessuto morbido, traspirante e resistente, dotato di cerniera per un lavaggio pratico.",
      "Altezza regolabile – Puoi aggiungere o rimuovere imbottitura per creare il cuscino ideale per la tua postura.",
      "Imbottitura in fibra di poliestere – Morbida, volumosa e anti-deformazione, per un sostegno costante.",
      "Lavabile – Federa e cuscino sono facilmente lavabili, mantenendo igiene e freschezza nel tempo.",
    ],
    specs: [
      { label: "Dimensione", value: "40 × 70 cm" },
      { label: "Imbottitura", value: "Fibra di poliestere" },
      { label: "Altezza", value: "Regolabile" },
      { label: "Federa", value: "Microfibra, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Microfibra", "Fibra poliestere"],
    tone: T.warm2,
    createdAt: "2025-02-25",
    relatedIds: ["fiocco-memory", "baby-antisoffoco", "allattamento"],
  }),
];
