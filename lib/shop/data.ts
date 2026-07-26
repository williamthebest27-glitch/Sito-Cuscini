/**
 * CATALOGO — unica fonte di verità dei prodotti.
 *
 * Questo file è l'unico punto che conosce i dati "grezzi". La UI non lo importa
 * mai direttamente: passa sempre dal `repository`, così sostituirlo con DB / CMS
 * / API / WebBee significa scrivere una nuova implementazione del repository,
 * senza toccare le pagine né i componenti.
 *
 * Prezzi in centesimi di euro. Gli helper in fondo servono solo a comporre i
 * literal in modo leggibile: il valore prodotto è comunque un `Product` puro,
 * identico a ciò che restituirebbe un'API.
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
 * Vocabolari condivisi (misura / rigidità / colore)
 * ------------------------------------------------------------------ */

const MISURE = {
  "40x60": "40 × 60 cm",
  "50x70": "50 × 70 cm",
  "60x80": "60 × 80 cm",
  compatto: "Compatto",
  unica: "Taglia unica",
} as const;

const RIGIDITA = {
  morbido: "Morbido",
  medio: "Medio",
  rigido: "Rigido",
} as const;

const COLORS = {
  naturale: { label: "Naturale", hex: "#EDE7DB", tone: ["#FAF7F2", "#E4DBCB"] },
  sabbia: { label: "Sabbia", hex: "#D8CEBD", tone: ["#EDE4D3", "#CDBD9F"] },
  argilla: { label: "Argilla", hex: "#C7A57B", tone: ["#E4CFAE", "#C7A57B"] },
  grafite: { label: "Grafite", hex: "#3A352D", tone: ["#6B6155", "#2A2620"] },
  salvia: { label: "Salvia", hex: "#A9AE97", tone: ["#C9CEBB", "#9AA187"] },
} as const;

type MisuraId = keyof typeof MISURE;
type RigiditaId = keyof typeof RIGIDITA;
type ColoreId = keyof typeof COLORS;

/* ------------------------------------------------------------------ *
 * Helper di composizione (leggibilità dei literal)
 * ------------------------------------------------------------------ */

const misuraOption = (...ids: MisuraId[]): ProductOption => ({
  type: "misura",
  label: "Misura",
  values: ids.map((id) => ({ id, label: MISURE[id] })),
});

const rigiditaOption = (...ids: RigiditaId[]): ProductOption => ({
  type: "rigidita",
  label: "Rigidità",
  values: ids.map((id) => ({ id, label: RIGIDITA[id] })),
});

const coloreOption = (...ids: ColoreId[]): ProductOption => ({
  type: "colore",
  label: "Colore",
  values: ids.map((id) => ({
    id,
    label: COLORS[id].label,
    hex: COLORS[id].hex,
    tone: [...COLORS[id].tone] as [string, string],
  })),
});

function variant(
  sku: string,
  options: Partial<Record<OptionType, string>>,
  price: number,
  extra: { compareAt?: number; stock?: number } = {},
): Variant {
  const colore = options.colore ? COLORS[options.colore as ColoreId] : undefined;
  return {
    sku,
    options,
    price,
    compareAtPrice: extra.compareAt,
    stock: extra.stock ?? 14,
    tone: colore ? ([...colore.tone] as [string, string]) : undefined,
  };
}

const img = (
  id: string,
  alt: string,
  tone: [string, string],
): ProductImage => ({ id, alt, tone });

/* ------------------------------------------------------------------ *
 * Categorie
 * ------------------------------------------------------------------ */

export const CATEGORIES: Category[] = [
  { id: "cervicale", label: "Cervicale" },
  { id: "classico", label: "Classico" },
  { id: "raffreddante", label: "Fresco" },
  { id: "viaggio", label: "Viaggio" },
  { id: "gravidanza", label: "Gravidanza" },
  { id: "lombare", label: "Supporto" },
  { id: "bambino", label: "Bambino" },
];

/* Toni immagine ricorrenti (placeholder brandizzati, in palette) */
const T = {
  warm: ["#FAF7F2", "#E4DBCB"] as [string, string],
  warm2: ["#F2ECE1", "#D8CEBD"] as [string, string],
  clay: ["#E4CFAE", "#C7A57B"] as [string, string],
  graphite: ["#6B6155", "#2A2620"] as [string, string],
  sage: ["#C9CEBB", "#9AA187"] as [string, string],
  sand: ["#EDE4D3", "#CDBD9F"] as [string, string],
};

/* ------------------------------------------------------------------ *
 * Prodotti (~20 prodotti / ~41 SKU)
 * ------------------------------------------------------------------ */

export const PRODUCTS: Product[] = [
  {
    id: "aurora",
    slug: "aurora-cervicale",
    name: "Aurora",
    tagline: "Sostegno cervicale che segue la curva del collo.",
    description:
      "Aurora nasce per chi cerca un risveglio senza tensioni. Il profilo a doppia onda accompagna la cervicale in ogni posizione, distribuendo la pressione e mantenendo la colonna allineata. Il cuore in memory foam a lenta reazione si adatta al calore del corpo e torna in forma notte dopo notte.",
    categoryId: "cervicale",
    featured: true,
    isNew: true,
    options: [rigiditaOption("medio", "rigido")],
    variants: [
      variant("AUR-MED", { rigidita: "medio" }, 8900, { compareAt: 10900, stock: 22 }),
      variant("AUR-RIG", { rigidita: "rigido" }, 9500, { compareAt: 11500, stock: 9 }),
    ],
    images: [
      img("aurora-1", "Cuscino cervicale Aurora, vista fronte", T.warm),
      img("aurora-2", "Aurora, dettaglio del profilo a onda", T.warm2),
      img("aurora-3", "Aurora ambientato sul letto", T.clay),
    ],
    features: [
      "Profilo a doppia onda ergonomico",
      "Memory foam a lenta reazione",
      "Fodera in bamboo lavabile a 40°",
      "Traspirante, con canali di ventilazione",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam viscoelastico" },
      { label: "Altezza onde", value: "10 / 12 cm" },
      { label: "Densità", value: "55 kg/m³" },
      { label: "Fodera", value: "Bamboo + poliestere, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX Standard 100" },
    ],
    materials: ["Memory foam", "Bamboo"],
    reviews: [
      { id: "aurora-r1", author: "Giulia M.", rating: 5, date: "2024-11-08", title: "Addio torcicollo", body: "Dopo anni di risvegli col collo bloccato, finalmente dormo bene. Il medio è perfetto per me.", verified: true },
      { id: "aurora-r2", author: "Marco T.", rating: 4, date: "2024-10-19", body: "Ottimo sostegno, ci ho messo un paio di notti ad abituarmi all'altezza.", verified: true },
      { id: "aurora-r3", author: "Elena R.", rating: 5, date: "2024-09-30", title: "Qualità evidente", body: "Materiali di livello e fodera davvero traspirante. Consigliato.", verified: true },
    ],
    relatedIds: ["onda", "vega", "eos"],
    createdAt: "2024-09-01",
  },
  {
    id: "onda",
    slug: "onda-lattice",
    name: "Onda",
    tagline: "Lattice naturale, elastico e fresco.",
    description:
      "Onda è il cuscino cervicale in puro lattice naturale: reattivo, elastico e naturalmente traspirante. La struttura a bolle interne favorisce il ricircolo dell'aria mantenendo una temperatura costante tutta la notte. Ideale per chi dorme supino o di lato.",
    categoryId: "cervicale",
    options: [misuraOption("50x70", "60x80")],
    variants: [
      variant("OND-5070", { misura: "50x70" }, 7900, { stock: 18 }),
      variant("OND-6080", { misura: "60x80" }, 9500, { stock: 11 }),
    ],
    images: [
      img("onda-1", "Cuscino Onda in lattice, vista fronte", T.warm2),
      img("onda-2", "Onda, dettaglio della struttura a bolle", T.warm),
    ],
    features: [
      "Puro lattice naturale",
      "Struttura a bolle traspirante",
      "Antiacaro e antibatterico naturale",
      "Elevata elasticità di punto",
    ],
    specs: [
      { label: "Materiale", value: "Lattice naturale 100%" },
      { label: "Densità", value: "65 kg/m³" },
      { label: "Fodera", value: "Cotone bio, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX, Eurolatex" },
    ],
    materials: ["Lattice naturale", "Cotone bio"],
    reviews: [
      { id: "onda-r1", author: "Paolo V.", rating: 5, date: "2024-11-02", title: "Fresco davvero", body: "Non si scalda mai, cosa che con il memory non avevo mai avuto. Promosso.", verified: true },
      { id: "onda-r2", author: "Sara L.", rating: 4, date: "2024-08-14", body: "Elastico e comodo. La 60×80 è generosa, valutate bene la misura.", verified: true },
    ],
    relatedIds: ["aurora", "luna", "fresco"],
    createdAt: "2024-06-12",
  },
  {
    id: "nuvola",
    slug: "nuvola-classico",
    name: "Nuvola",
    tagline: "Morbidezza avvolgente, notte dopo notte.",
    description:
      "Nuvola è il classico che coccola. Il memory foam schiumato ad aria offre un abbraccio soffice senza rinunciare al sostegno. Perfetto per chi ama affondare leggermente nel cuscino e cerca una sensazione di accoglienza immediata.",
    categoryId: "classico",
    featured: true,
    options: [rigiditaOption("morbido", "medio")],
    variants: [
      variant("NUV-MOR", { rigidita: "morbido" }, 6900, { stock: 26 }),
      variant("NUV-MED", { rigidita: "medio" }, 6900, { stock: 20 }),
    ],
    images: [
      img("nuvola-1", "Cuscino classico Nuvola, vista fronte", T.warm),
      img("nuvola-2", "Nuvola, dettaglio della superficie morbida", T.warm2),
    ],
    features: [
      "Memory foam schiumato ad aria",
      "Sensazione soffice e avvolgente",
      "Fodera in tencel setosa",
      "Ipoallergenico",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam air-cell" },
      { label: "Altezza", value: "13 cm" },
      { label: "Densità", value: "50 kg/m³" },
      { label: "Fodera", value: "Tencel, sfoderabile" },
    ],
    materials: ["Memory foam", "Tencel"],
    reviews: [
      { id: "nuvola-r1", author: "Francesca B.", rating: 5, date: "2024-10-05", title: "Soffice al punto giusto", body: "Sembra di dormire su una nuvola, il nome è azzeccato.", verified: true },
      { id: "nuvola-r2", author: "Davide C.", rating: 4, date: "2024-07-22", body: "Molto comodo, per me che dormo a pancia in giù il morbido è l'ideale.", verified: true },
    ],
    relatedIds: ["quiete", "notte", "meridia"],
    createdAt: "2024-05-20",
  },
  {
    id: "quiete",
    slug: "quiete-lattice",
    name: "Quiete",
    tagline: "Il classico in lattice, in tre nuance calde.",
    description:
      "Quiete unisce il comfort del cuscino tradizionale alla freschezza del lattice naturale. Disponibile in tre tonalità sabbia, per intonarsi alla camera senza rinunciare alla qualità del sonno.",
    categoryId: "classico",
    options: [coloreOption("naturale", "sabbia", "argilla")],
    variants: [
      variant("QUI-NAT", { colore: "naturale" }, 7500, { stock: 16 }),
      variant("QUI-SAB", { colore: "sabbia" }, 7500, { stock: 13 }),
      variant("QUI-ARG", { colore: "argilla" }, 7900, { stock: 7 }),
    ],
    images: [
      img("quiete-1", "Cuscino Quiete in lattice, vista fronte", T.sand),
      img("quiete-2", "Quiete, dettaglio della fodera", T.warm2),
    ],
    features: [
      "Puro lattice naturale traspirante",
      "Tre nuance calde coordinabili",
      "Fodera in lino lavato",
      "Antiacaro naturale",
    ],
    specs: [
      { label: "Materiale", value: "Lattice naturale 100%" },
      { label: "Altezza", value: "12 cm" },
      { label: "Fodera", value: "Lino lavato, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX" },
    ],
    materials: ["Lattice naturale", "Lino"],
    reviews: [
      { id: "quiete-r1", author: "Chiara P.", rating: 5, date: "2024-09-11", title: "Bello ed elegante", body: "La nuance argilla sta benissimo in camera e il cuscino è comodissimo.", verified: true },
      { id: "quiete-r2", author: "Luca F.", rating: 4, date: "2024-08-01", body: "Buon prodotto, fodera in lino di qualità.", verified: false },
    ],
    relatedIds: ["nuvola", "meridia", "onda"],
    createdAt: "2024-04-18",
  },
  {
    id: "brezza",
    slug: "brezza-gel",
    name: "Brezza",
    tagline: "Memory con gel raffreddante per notti fresche.",
    description:
      "Brezza mette al centro la temperatura. L'infusione di gel termoregolante disperde il calore in eccesso, mentre il memory foam sostiene la cervicale. Il lato preferito da chi soffre il caldo di notte.",
    categoryId: "raffreddante",
    isNew: true,
    options: [rigiditaOption("medio", "rigido")],
    variants: [
      variant("BRE-MED", { rigidita: "medio" }, 9900, { stock: 15 }),
      variant("BRE-RIG", { rigidita: "rigido" }, 9900, { stock: 6 }),
    ],
    images: [
      img("brezza-1", "Cuscino raffreddante Brezza, vista fronte", T.sage),
      img("brezza-2", "Brezza, dettaglio dello strato gel", T.warm2),
    ],
    features: [
      "Strato in gel termoregolante",
      "Memory foam a supporto cervicale",
      "Fodera fresh-touch",
      "Dissipa il calore in eccesso",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam + gel" },
      { label: "Altezza", value: "11 cm" },
      { label: "Densità", value: "55 kg/m³" },
      { label: "Fodera", value: "Tessuto fresh-touch, sfoderabile" },
    ],
    materials: ["Memory foam", "Gel"],
    reviews: [
      { id: "brezza-r1", author: "Antonio G.", rating: 5, date: "2024-11-15", title: "Finalmente fresco", body: "D'estate era un incubo, con Brezza dormo senza girare il cuscino mille volte.", verified: true },
      { id: "brezza-r2", author: "Martina D.", rating: 4, date: "2024-10-28", body: "Fa il suo lavoro, il lato gel è piacevole.", verified: true },
    ],
    relatedIds: ["fresco", "aura-gel", "aurora"],
    createdAt: "2024-10-10",
  },
  {
    id: "vega",
    slug: "vega-cervicale",
    name: "Vega",
    tagline: "Tre rigidità per trovare la tua misura di sonno.",
    description:
      "Vega è il cuscino cervicale modulare: scegli la rigidità che preferisci e affina il sostegno sulla tua postura. Il memory foam profilato riduce i punti di pressione su collo e spalle.",
    categoryId: "cervicale",
    options: [rigiditaOption("morbido", "medio", "rigido")],
    variants: [
      variant("VEG-MOR", { rigidita: "morbido" }, 8500, { stock: 17 }),
      variant("VEG-MED", { rigidita: "medio" }, 8500, { stock: 21 }),
      variant("VEG-RIG", { rigidita: "rigido" }, 8500, { stock: 12 }),
    ],
    images: [
      img("vega-1", "Cuscino cervicale Vega, vista fronte", T.warm2),
      img("vega-2", "Vega, dettaglio del profilo", T.warm),
    ],
    features: [
      "Profilo cervicale sagomato",
      "Tre livelli di rigidità",
      "Fodera in aloe vera",
      "Riduce i punti di pressione",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam profilato" },
      { label: "Altezza", value: "11 cm" },
      { label: "Densità", value: "55 kg/m³" },
      { label: "Fodera", value: "Aloe vera, sfoderabile" },
    ],
    materials: ["Memory foam", "Aloe vera"],
    reviews: [
      { id: "vega-r1", author: "Roberto S.", rating: 5, date: "2024-09-22", title: "Ho scelto il rigido", body: "Dormo di lato e il rigido tiene la spalla alla giusta altezza. Perfetto.", verified: true },
      { id: "vega-r2", author: "Ilaria N.", rating: 4, date: "2024-08-09", body: "Comodo, la fodera profuma leggermente di aloe all'inizio.", verified: true },
    ],
    relatedIds: ["aurora", "eos", "luna"],
    createdAt: "2024-03-30",
  },
  {
    id: "meridia",
    slug: "meridia-classico",
    name: "Meridia",
    tagline: "Il guanciale di casa, in tre misure.",
    description:
      "Meridia è il cuscino di famiglia: lattice naturale, comodo e versatile, disponibile in tre misure per adattarsi a ogni letto. Un classico affidabile che dura negli anni.",
    categoryId: "classico",
    options: [misuraOption("40x60", "50x70", "60x80")],
    variants: [
      variant("MER-4060", { misura: "40x60" }, 5500, { stock: 24 }),
      variant("MER-5070", { misura: "50x70" }, 6500, { stock: 28 }),
      variant("MER-6080", { misura: "60x80" }, 7500, { stock: 14 }),
    ],
    images: [
      img("meridia-1", "Guanciale Meridia, vista fronte", T.warm),
      img("meridia-2", "Meridia, dettaglio della cucitura", T.sand),
    ],
    features: [
      "Lattice naturale versatile",
      "Tre misure disponibili",
      "Fodera in cotone matelassé",
      "Sostegno equilibrato",
    ],
    specs: [
      { label: "Materiale", value: "Lattice naturale" },
      { label: "Altezza", value: "13 cm" },
      { label: "Fodera", value: "Cotone matelassé, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX" },
    ],
    materials: ["Lattice naturale", "Cotone"],
    reviews: [
      { id: "meridia-r1", author: "Anna V.", rating: 5, date: "2024-07-30", title: "Ne ho presi due", body: "Comodi e ben fatti, ho preso la coppia per il letto matrimoniale.", verified: true },
      { id: "meridia-r2", author: "Giorgio M.", rating: 4, date: "2024-06-05", body: "Buon rapporto qualità prezzo, la 50×70 è la misura giusta.", verified: true },
    ],
    relatedIds: ["nuvola", "quiete", "piuma"],
    createdAt: "2024-02-14",
  },
  {
    id: "rotta",
    slug: "rotta-viaggio",
    name: "Rotta",
    tagline: "Il collo protetto, ovunque tu vada.",
    description:
      "Rotta è il cuscino da viaggio in memory foam che avvolge il collo a 360°. Si comprime nella custodia inclusa e torna in forma all'istante. Il compagno di aerei, treni e lunghe attese.",
    categoryId: "viaggio",
    isNew: true,
    options: [coloreOption("grafite", "sabbia")],
    variants: [
      variant("ROT-GRA", { colore: "grafite" }, 3900, { stock: 30 }),
      variant("ROT-SAB", { colore: "sabbia" }, 3900, { stock: 19 }),
    ],
    images: [
      img("rotta-1", "Cuscino da viaggio Rotta, vista fronte", T.graphite),
      img("rotta-2", "Rotta, con custodia da viaggio", T.sand),
    ],
    features: [
      "Memory foam avvolgente a U",
      "Custodia comprimibile inclusa",
      "Chiusura frontale regolabile",
      "Fodera lavabile",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam" },
      { label: "Formato", value: "A ferro di cavallo" },
      { label: "Fodera", value: "Velluto, sfoderabile" },
      { label: "In dotazione", value: "Custodia + moschettone" },
    ],
    materials: ["Memory foam", "Velluto"],
    reviews: [
      { id: "rotta-r1", author: "Valentina C.", rating: 5, date: "2024-11-01", title: "Salvavita in aereo", body: "Voli lunghi molto più sopportabili. Si comprime pochissimo nello zaino.", verified: true },
      { id: "rotta-r2", author: "Simone P.", rating: 4, date: "2024-09-18", body: "Comodo, la chiusura frontale aiuta a non far cadere la testa.", verified: true },
    ],
    relatedIds: ["zeffiro", "stella", "nuvola"],
    createdAt: "2024-10-01",
  },
  {
    id: "serena",
    slug: "serena-gravidanza",
    name: "Serena",
    tagline: "Un abbraccio a forma di C per la gravidanza.",
    description:
      "Serena accompagna i mesi della gravidanza e l'allattamento con un sostegno morbido e continuo. La forma a C avvolge schiena, pancia e gambe, alleggerendo la pressione lombare e favorendo il sonno di lato.",
    categoryId: "gravidanza",
    featured: true,
    options: [coloreOption("naturale", "salvia")],
    variants: [
      variant("SER-NAT", { colore: "naturale" }, 11900, { stock: 12 }),
      variant("SER-SAL", { colore: "salvia" }, 11900, { stock: 8 }),
    ],
    images: [
      img("serena-1", "Cuscino gravidanza Serena a forma di C", T.warm),
      img("serena-2", "Serena, dettaglio del sostegno lombare", T.sage),
    ],
    features: [
      "Forma a C avvolgente",
      "Sostegno lombare e per le gambe",
      "Imbottitura in fibra soffice",
      "Fodera sfoderabile e lavabile",
    ],
    specs: [
      { label: "Materiale", value: "Microfibra siliconata" },
      { label: "Lunghezza", value: "150 cm" },
      { label: "Fodera", value: "Cotone jersey, sfoderabile" },
      { label: "Uso", value: "Gravidanza + allattamento" },
    ],
    materials: ["Microfibra", "Cotone jersey"],
    reviews: [
      { id: "serena-r1", author: "Federica L.", rating: 5, date: "2024-10-12", title: "Non ne posso più fare a meno", body: "Ultimo trimestre salvato. Sostiene la pancia e la schiena alla perfezione.", verified: true },
      { id: "serena-r2", author: "Beatrice R.", rating: 5, date: "2024-09-03", body: "Ottima anche per l'allattamento. Fodera morbidissima.", verified: true },
    ],
    relatedIds: ["ancora", "dorsa", "nuvola"],
    createdAt: "2024-08-22",
  },
  {
    id: "dorsa",
    slug: "dorsa-lombare",
    name: "Dorsa",
    tagline: "Supporto lombare per letto e scrivania.",
    description:
      "Dorsa sostiene la curva lombare quando sei seduto o disteso. Il memory foam sagomato scarica la tensione della zona bassa della schiena, ideale alla scrivania, in auto o a letto durante la lettura.",
    categoryId: "lombare",
    options: [misuraOption("unica")],
    variants: [variant("DOR-UNI", { misura: "unica" }, 4900, { stock: 20 })],
    images: [
      img("dorsa-1", "Supporto lombare Dorsa, vista fronte", T.clay),
      img("dorsa-2", "Dorsa, dettaglio del profilo sagomato", T.warm2),
    ],
    features: [
      "Profilo lombare ergonomico",
      "Cinghia di fissaggio regolabile",
      "Memory foam ad alta densità",
      "Fodera traspirante in mesh",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam ad alta densità" },
      { label: "Uso", value: "Sedia, auto, letto" },
      { label: "Fodera", value: "Mesh 3D, sfoderabile" },
      { label: "Fissaggio", value: "Cinghia elastica" },
    ],
    materials: ["Memory foam", "Mesh"],
    reviews: [
      { id: "dorsa-r1", author: "Stefano B.", rating: 5, date: "2024-08-27", title: "Schiena ringrazia", body: "Otto ore alla scrivania senza più mal di schiena. Lo porto anche in ufficio.", verified: true },
      { id: "dorsa-r2", author: "Laura T.", rating: 4, date: "2024-07-14", body: "Comodo in auto per i viaggi lunghi.", verified: true },
    ],
    relatedIds: ["ancora", "serena", "vega"],
    createdAt: "2024-05-05",
  },
  {
    id: "piuma",
    slug: "piuma-classico",
    name: "Piuma",
    tagline: "La leggerezza soffice della microfibra.",
    description:
      "Piuma ricrea la sensazione ovattata del piumino con fibra tecnica anallergica. Soffice, leggero e gonfio, si scuote e riprende volume ogni mattina. Per chi ama i cuscini alti e morbidi.",
    categoryId: "classico",
    options: [misuraOption("50x70", "60x80")],
    variants: [
      variant("PIU-5070", { misura: "50x70" }, 5900, { stock: 22 }),
      variant("PIU-6080", { misura: "60x80" }, 6900, { stock: 15 }),
    ],
    images: [
      img("piuma-1", "Cuscino Piuma in microfibra, vista fronte", T.warm),
      img("piuma-2", "Piuma, dettaglio del volume soffice", T.warm2),
    ],
    features: [
      "Fibra tecnica effetto piuma",
      "Anallergico e lavabile",
      "Alto e voluminoso",
      "Fodera in percalle di cotone",
    ],
    specs: [
      { label: "Materiale", value: "Microfibra siliconata" },
      { label: "Altezza", value: "15 cm" },
      { label: "Fodera", value: "Percalle di cotone" },
      { label: "Lavaggio", value: "In lavatrice a 40°" },
    ],
    materials: ["Microfibra", "Cotone"],
    reviews: [
      { id: "piuma-r1", author: "Monica D.", rating: 4, date: "2024-06-20", title: "Alto e morbido", body: "Come piace a me, bello gonfio. Lavabile in lavatrice, comodissimo.", verified: true },
      { id: "piuma-r2", author: "Nicola F.", rating: 5, date: "2024-05-11", body: "Sembra un piumino vero ma senza problemi di allergie.", verified: true },
    ],
    relatedIds: ["nuvola", "meridia", "quiete"],
    createdAt: "2024-03-08",
  },
  {
    id: "luna",
    slug: "luna-cervicale",
    name: "Luna",
    tagline: "Lattice cervicale per chi dorme di lato.",
    description:
      "Luna è pensata per chi riposa sul fianco: l'altezza calibrata mantiene testa e colonna allineate, mentre il lattice naturale garantisce elasticità e freschezza. Sostegno preciso, senza cedimenti.",
    categoryId: "cervicale",
    options: [rigiditaOption("medio", "rigido")],
    variants: [
      variant("LUN-MED", { rigidita: "medio" }, 9200, { stock: 16 }),
      variant("LUN-RIG", { rigidita: "rigido" }, 9200, { stock: 10 }),
    ],
    images: [
      img("luna-1", "Cuscino cervicale Luna in lattice, vista fronte", T.warm2),
      img("luna-2", "Luna, dettaglio dell'altezza calibrata", T.sand),
    ],
    features: [
      "Altezza calibrata per il fianco",
      "Puro lattice naturale",
      "Sostegno elastico e fresco",
      "Fodera in cotone bio",
    ],
    specs: [
      { label: "Materiale", value: "Lattice naturale" },
      { label: "Altezza", value: "13 cm" },
      { label: "Densità", value: "70 kg/m³" },
      { label: "Fodera", value: "Cotone bio, sfoderabile" },
    ],
    materials: ["Lattice naturale", "Cotone bio"],
    reviews: [
      { id: "luna-r1", author: "Cristina P.", rating: 5, date: "2024-09-14", title: "Perfetto per il fianco", body: "Altezza ideale, la spalla non fa più male al risveglio.", verified: true },
      { id: "luna-r2", author: "Alberto G.", rating: 4, date: "2024-07-08", body: "Buon sostegno, materiale fresco. Consigliato a chi dorme di lato.", verified: true },
    ],
    relatedIds: ["onda", "vega", "aurora"],
    createdAt: "2024-04-02",
  },
  {
    id: "stella",
    slug: "stella-bambino",
    name: "Stella",
    tagline: "Il primo cuscino, dolce e sicuro.",
    description:
      "Stella è il cuscino pensato per i più piccoli: altezza ridotta, materiali certificati e traspiranti, forma sagomata per accompagnare la crescita. Delicato sulla pelle e facilissimo da lavare.",
    categoryId: "bambino",
    options: [coloreOption("naturale", "salvia")],
    variants: [
      variant("STE-NAT", { colore: "naturale" }, 3500, { stock: 25 }),
      variant("STE-SAL", { colore: "salvia" }, 3500, { stock: 18 }),
    ],
    images: [
      img("stella-1", "Cuscino per bambino Stella, vista fronte", T.warm),
      img("stella-2", "Stella, dettaglio della forma sagomata", T.sage),
    ],
    features: [
      "Altezza ridotta per bambini",
      "Materiali certificati e sicuri",
      "Traspirante e anallergico",
      "Fodera lavabile in cotone bio",
    ],
    specs: [
      { label: "Materiale", value: "Schiuma soft certificata" },
      { label: "Altezza", value: "6 cm" },
      { label: "Età", value: "Dai 3 anni" },
      { label: "Fodera", value: "Cotone bio, sfoderabile" },
    ],
    materials: ["Schiuma soft", "Cotone bio"],
    reviews: [
      { id: "stella-r1", author: "Silvia M.", rating: 5, date: "2024-10-20", title: "Perfetto per mia figlia", body: "Altezza giusta, materiali che danno sicurezza. La fodera salvia è bellissima.", verified: true },
      { id: "stella-r2", author: "Emanuele T.", rating: 5, date: "2024-08-30", body: "Traspirante e morbido, mio figlio dorme benissimo.", verified: true },
    ],
    relatedIds: ["nuvola", "rotta", "piuma"],
    createdAt: "2024-07-01",
  },
  {
    id: "fresco",
    slug: "fresco-lattice",
    name: "Fresco",
    tagline: "Lattice ventilato per chi ha sempre caldo.",
    description:
      "Fresco porta la traspirazione all'estremo: il lattice a canali forati abbinato alla fodera tecnica dissipa umidità e calore, per una superficie sempre asciutta. Il preferito nelle notti d'estate.",
    categoryId: "raffreddante",
    options: [misuraOption("50x70", "60x80")],
    variants: [
      variant("FRE-5070", { misura: "50x70" }, 8900, { compareAt: 9900, stock: 14 }),
      variant("FRE-6080", { misura: "60x80" }, 10500, { compareAt: 11500, stock: 9 }),
    ],
    images: [
      img("fresco-1", "Cuscino Fresco in lattice ventilato, vista fronte", T.sage),
      img("fresco-2", "Fresco, dettaglio dei canali di ventilazione", T.warm2),
    ],
    features: [
      "Lattice a canali forati",
      "Fodera tecnica traspirante",
      "Dissipa calore e umidità",
      "Antiacaro naturale",
    ],
    specs: [
      { label: "Materiale", value: "Lattice naturale forato" },
      { label: "Altezza", value: "12 cm" },
      { label: "Fodera", value: "Coolmax, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX, Eurolatex" },
    ],
    materials: ["Lattice naturale", "Coolmax"],
    reviews: [
      { id: "fresco-r1", author: "Gabriele S.", rating: 5, date: "2024-08-05", title: "Il migliore per l'estate", body: "Non si scalda mai. Con il caldo di luglio ha fatto la differenza.", verified: true },
      { id: "fresco-r2", author: "Debora N.", rating: 4, date: "2024-07-19", body: "Fresco e sostenuto, forse un filo alto per me.", verified: true },
    ],
    relatedIds: ["brezza", "aura-gel", "onda"],
    createdAt: "2024-05-28",
  },
  {
    id: "zeffiro",
    slug: "zeffiro-viaggio",
    name: "Zeffiro",
    tagline: "Ultraleggero e comprimibile, per lo zaino.",
    description:
      "Zeffiro è il cuscino da viaggio essenziale: comprimibile fino a un palmo di mano, leggerissimo, si aggancia allo zaino. Il sostegno giusto per un pisolino in movimento senza ingombro.",
    categoryId: "viaggio",
    options: [misuraOption("compatto")],
    variants: [variant("ZEF-CMP", { misura: "compatto" }, 2900, { stock: 34 })],
    images: [
      img("zeffiro-1", "Cuscino da viaggio Zeffiro compresso", T.sand),
      img("zeffiro-2", "Zeffiro, agganciato allo zaino", T.warm),
    ],
    features: [
      "Comprimibile in custodia",
      "Ultraleggero (180 g)",
      "Moschettone da zaino incluso",
      "Fodera lavabile",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam sbriciolato" },
      { label: "Peso", value: "180 g" },
      { label: "Fodera", value: "Nylon soft, sfoderabile" },
      { label: "In dotazione", value: "Custodia + moschettone" },
    ],
    materials: ["Memory foam", "Nylon"],
    reviews: [
      { id: "zeffiro-r1", author: "Marta V.", rating: 4, date: "2024-09-25", title: "Comodo e mini", body: "Occupa pochissimo, perfetto per i viaggi in treno.", verified: true },
      { id: "zeffiro-r2", author: "Andrea L.", rating: 4, date: "2024-08-11", body: "Leggero e pratico, buono per il prezzo.", verified: true },
    ],
    relatedIds: ["rotta", "stella", "dorsa"],
    createdAt: "2024-06-30",
  },
  {
    id: "ancora",
    slug: "ancora-lettura",
    name: "Àncora",
    tagline: "Il cuneo che ti sostiene mentre leggi.",
    description:
      "Àncora è il cuscino a cuneo per leggere e riposare semiseduti. L'inclinazione studiata sostiene schiena e collo sul letto o sul divano, alleggerendo la zona cervicale e lombare durante lo smart working.",
    categoryId: "lombare",
    options: [misuraOption("unica")],
    variants: [variant("ANC-UNI", { misura: "unica" }, 5500, { stock: 17 })],
    images: [
      img("ancora-1", "Cuscino a cuneo Àncora, vista laterale", T.clay),
      img("ancora-2", "Àncora, in uso sul letto per la lettura", T.warm2),
    ],
    features: [
      "Forma a cuneo inclinata",
      "Sostegno schiena e collo",
      "Doppia densità di schiuma",
      "Fodera in velluto sfoderabile",
    ],
    specs: [
      { label: "Materiale", value: "Schiuma HR + memory" },
      { label: "Inclinazione", value: "45°" },
      { label: "Fodera", value: "Velluto, sfoderabile" },
      { label: "Uso", value: "Lettura, TV, smart working" },
    ],
    materials: ["Schiuma HR", "Memory foam", "Velluto"],
    reviews: [
      { id: "ancora-r1", author: "Paola R.", rating: 5, date: "2024-10-02", title: "Leggo comodissima", body: "Sostiene benissimo la schiena, ci lavoro anche al pc a letto.", verified: true },
      { id: "ancora-r2", author: "Fabio C.", rating: 4, date: "2024-08-22", body: "Solido e ben fatto, il velluto è piacevole.", verified: true },
    ],
    relatedIds: ["dorsa", "serena", "vega"],
    createdAt: "2024-04-25",
  },
  {
    id: "notte",
    slug: "notte-classico",
    name: "Notte",
    tagline: "Il memory classico, in tre rigidità.",
    description:
      "Notte è il memory foam di tutti i giorni: accogliente ma sostenuto, disponibile in tre rigidità per assecondare la tua posizione preferita. Un equilibrio collaudato tra morbidezza e supporto.",
    categoryId: "classico",
    featured: true,
    options: [rigiditaOption("morbido", "medio", "rigido")],
    variants: [
      variant("NOT-MOR", { rigidita: "morbido" }, 7200, { stock: 23 }),
      variant("NOT-MED", { rigidita: "medio" }, 7200, { stock: 27 }),
      variant("NOT-RIG", { rigidita: "rigido" }, 7200, { stock: 13 }),
    ],
    images: [
      img("notte-1", "Cuscino classico Notte in memory, vista fronte", T.warm),
      img("notte-2", "Notte, dettaglio della superficie", T.warm2),
    ],
    features: [
      "Memory foam bilanciato",
      "Tre rigidità disponibili",
      "Fodera in tencel traspirante",
      "Ipoallergenico",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam" },
      { label: "Altezza", value: "12 cm" },
      { label: "Densità", value: "52 kg/m³" },
      { label: "Fodera", value: "Tencel, sfoderabile" },
    ],
    materials: ["Memory foam", "Tencel"],
    reviews: [
      { id: "notte-r1", author: "Serena B.", rating: 5, date: "2024-09-08", title: "Il classico che non sbaglia", body: "Ho preso il medio, comodo per dormire supina e di lato.", verified: true },
      { id: "notte-r2", author: "Michele D.", rating: 4, date: "2024-07-26", body: "Buon memory, giusto compromesso morbido/sostegno.", verified: true },
      { id: "notte-r3", author: "Lucia F.", rating: 5, date: "2024-06-17", body: "Qualità ottima e prezzo onesto. Consigliato.", verified: true },
    ],
    relatedIds: ["nuvola", "meridia", "piuma"],
    createdAt: "2024-03-19",
  },
  {
    id: "riva",
    slug: "riva-laterale",
    name: "Riva",
    tagline: "Rigido e alto, il fianco allineato.",
    description:
      "Riva è il cuscino dedicato a chi dorme di lato e cerca il massimo sostegno: profilo alto e rigido che riempie lo spazio tra spalla e testa, mantenendo la colonna dritta tutta la notte.",
    categoryId: "cervicale",
    options: [misuraOption("50x70", "60x80")],
    variants: [
      variant("RIV-5070", { misura: "50x70" }, 9800, { stock: 12 }),
      variant("RIV-6080", { misura: "60x80" }, 11200, { stock: 7 }),
    ],
    images: [
      img("riva-1", "Cuscino laterale Riva, vista fronte", T.warm2),
      img("riva-2", "Riva, dettaglio del profilo alto", T.sand),
    ],
    features: [
      "Profilo alto e rigido",
      "Ideale per chi dorme di lato",
      "Memory foam ad alta densità",
      "Fodera traspirante lavabile",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam alta densità" },
      { label: "Altezza", value: "15 cm" },
      { label: "Densità", value: "60 kg/m³" },
      { label: "Fodera", value: "Bamboo, sfoderabile" },
    ],
    materials: ["Memory foam", "Bamboo"],
    reviews: [
      { id: "riva-r1", author: "Tommaso G.", rating: 5, date: "2024-10-16", title: "Alto come serviva", body: "Spalle larghe, finalmente un cuscino che riempie lo spazio giusto.", verified: true },
      { id: "riva-r2", author: "Erica S.", rating: 4, date: "2024-09-01", body: "Molto sostenuto, per chi ama il rigido è perfetto.", verified: true },
    ],
    relatedIds: ["luna", "vega", "aurora"],
    createdAt: "2024-05-14",
  },
  {
    id: "aura-gel",
    slug: "aura-gel-raffreddante",
    name: "Aura Gel",
    tagline: "Doppia faccia: lato fresco, lato accogliente.",
    description:
      "Aura Gel offre due anime in un solo cuscino: un lato con placca in gel raffreddante per le notti calde e un lato in memory soffice per quelle fredde. Basta girarlo per cambiare sensazione.",
    categoryId: "raffreddante",
    isNew: true,
    options: [coloreOption("naturale", "grafite")],
    variants: [
      variant("AUG-NAT", { colore: "naturale" }, 10500, { stock: 13 }),
      variant("AUG-GRA", { colore: "grafite" }, 10500, { stock: 8 }),
    ],
    images: [
      img("aura-1", "Cuscino Aura Gel a doppia faccia, vista fronte", T.warm),
      img("aura-2", "Aura Gel, lato con placca raffreddante", T.graphite),
    ],
    features: [
      "Lato gel + lato memory",
      "Doppia sensazione termica",
      "Placca raffreddante integrata",
      "Fodera fresh-touch sfoderabile",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam + placca gel" },
      { label: "Altezza", value: "12 cm" },
      { label: "Densità", value: "55 kg/m³" },
      { label: "Fodera", value: "Fresh-touch, sfoderabile" },
    ],
    materials: ["Memory foam", "Gel"],
    reviews: [
      { id: "aura-r1", author: "Riccardo P.", rating: 5, date: "2024-11-12", title: "Geniale il doppio lato", body: "D'inverno il memory, d'estate il gel. Un cuscino per tutto l'anno.", verified: true },
      { id: "aura-r2", author: "Noemi L.", rating: 4, date: "2024-10-24", body: "Il lato gel è davvero fresco. Ottimo.", verified: true },
    ],
    relatedIds: ["brezza", "fresco", "aurora"],
    createdAt: "2024-10-05",
  },
  {
    id: "eos",
    slug: "eos-cervicale",
    name: "Eos",
    tagline: "Cervicale su misura: scegli rigidità.",
    description:
      "Eos combina un profilo cervicale ergonomico con la possibilità di scegliere la rigidità. Il memory foam profilato sostiene la testa in posizione neutra, riducendo tensioni al risveglio.",
    categoryId: "cervicale",
    options: [rigiditaOption("medio", "rigido")],
    variants: [
      variant("EOS-MED", { rigidita: "medio" }, 8800, { compareAt: 9800, stock: 19 }),
      variant("EOS-RIG", { rigidita: "rigido" }, 8800, { compareAt: 9800, stock: 11 }),
    ],
    images: [
      img("eos-1", "Cuscino cervicale Eos, vista fronte", T.warm2),
      img("eos-2", "Eos, dettaglio del profilo ergonomico", T.warm),
    ],
    features: [
      "Profilo cervicale neutro",
      "Due rigidità in offerta",
      "Fodera in bamboo antibatterica",
      "Riduce le tensioni al risveglio",
    ],
    specs: [
      { label: "Materiale", value: "Memory foam profilato" },
      { label: "Altezza", value: "11 cm" },
      { label: "Densità", value: "55 kg/m³" },
      { label: "Fodera", value: "Bamboo, sfoderabile" },
    ],
    materials: ["Memory foam", "Bamboo"],
    reviews: [
      { id: "eos-r1", author: "Claudia M.", rating: 5, date: "2024-09-29", title: "Ottimo in offerta", body: "Preso in sconto, qualità superiore al prezzo. Collo riposato.", verified: true },
      { id: "eos-r2", author: "Dario V.", rating: 4, date: "2024-08-18", body: "Buon cervicale, il medio va bene per dormire supino.", verified: true },
    ],
    relatedIds: ["aurora", "vega", "luna"],
    createdAt: "2024-06-02",
  },
];
