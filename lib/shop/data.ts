/**
 * CATALOGO — unica fonte di verità dei prodotti.
 *
 * Prodotti reali The Double Twenty, allineati 1:1 alle inserzioni Amazon.it:
 * **titolo, descrizione e prezzo identici**, e **SKU = ASIN** (così MCF evade
 * con lo stesso identificatore; se il tuo Seller SKU differisce, mappalo in
 * AMAZON_MCF_SKU_MAP). Un prodotto = un ASIN.
 *
 * Prezzi in centesimi di euro. La descrizione riporta i punti elenco Amazon
 * ("Informazioni su questo articolo"), uno per riga.
 *
 * La UI non importa questo file: passa sempre dal `repository`.
 */
import type { Category, Product, ProductImage } from "./types";

const img = (id: string, alt: string, tone: [string, string]): ProductImage => ({
  id,
  alt,
  tone,
});

/* Toni immagine (placeholder brandizzati, in palette) */
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

interface ProdInput {
  id: string;
  slug: string;
  /** = ASIN Amazon. */
  sku: string;
  /** Titolo Amazon esatto. */
  name: string;
  /** Frase breve per card/scheda. */
  tagline: string;
  categoryId: string;
  /** Prezzo in centesimi. */
  price: number;
  /** Punti elenco Amazon ("Informazioni su questo articolo"). */
  bullets: string[];
  specs: { label: string; value: string }[];
  materials: string[];
  tone: [string, string];
  createdAt: string;
  isNew?: boolean;
  featured?: boolean;
  relatedIds?: string[];
}

/** Compone un Product a variante unica (SKU = ASIN) dai dati Amazon. */
function prod(p: ProdInput): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.bullets.join("\n\n"),
    categoryId: p.categoryId,
    isNew: p.isNew,
    featured: p.featured,
    options: [],
    variants: [{ sku: p.sku, options: {}, price: p.price, stock: 100 }],
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

export const PRODUCTS: Product[] = [
  prod({
    id: "onda-bamboo",
    slug: "cervicale-doppia-onda-bamboo",
    sku: "B0FR6HG72B",
    name: "The Double Twenty - Cuscino Cervicale per Dormire a Doppia Onda Elevato Supporto Collo - Guanciale Memory Foam Federa Lavabile in Bamboo",
    tagline: "Cervicale a doppia onda, memory forato, federa bamboo.",
    categoryId: "cervicale",
    price: 3189,
    featured: true,
    bullets: [
      "SUPPORTO: cuscino ortopedico cervicale a doppia onda ideale per supporto al collo, il nostro cuscino letto è utilizzabile in due differenti posizioni previene e tratta dolore, russamento e apnee",
      "2 ALTEZZE: cuscino per cervicale di dimensione 40x70cm con lati di altezza differenti 9cm ideale per chi cerca un cuscino basso per dormire e 11cm perfetto per chi sta cercando un cuscino alto",
      "LAVABILE: cuscino ergonomico cervicale con rivestimento in bamboo sfoderabile con zip laterale, il tessuto in bamboo è la miglior opzione per chi cerca un cuscino antiacaro anallergico facile da lavare",
      "MEMORY FOAM FORATO: cuscino per dormire ad alto potere traspirante grazie alla sua struttura forata, il nostro guanciale letto è il compromesso ideale tra freschezza e supporto cervicale e lombare",
      "100% MADE IN ITALY: produciamo cuscini letto matrimoniale e singolo sul territorio, ogni nostro cuscino in memory foam è privo di sostanze nocive, per l'uomo e l'ambiente con certificazione OEKO TEX",
    ],
    specs: [
      { label: "Dimensione", value: "40 × 70 cm" },
      { label: "Altezze", value: "9 cm / 11 cm" },
      { label: "Materiale", value: "Memory foam forato" },
      { label: "Federa", value: "Bamboo, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Bamboo"],
    tone: T.sand,
    createdAt: "2025-03-01",
    relatedIds: ["onda-aloe", "doppia-altezza-bamboo", "silver-15"],
  }),
  prod({
    id: "onda-aloe",
    slug: "cervicale-doppia-onda-aloe-vera",
    sku: "B0H26LC3FH",
    name: "The Double Twenty Cuscino Cervicale per Dormire a Doppia Onda Elevato Supporto Collo - Guanciale Memory Foam Federa Lavabile in Aloe Vera - Cuscino Memory Foam Made in Italy Certificato Oeko Tex",
    tagline: "Cervicale a doppia onda, memory foam, federa aloe vera.",
    categoryId: "cervicale",
    price: 2657,
    bullets: [
      "SUPPORTO: cuscino ortopedico cervicale a doppia onda ideale per supporto al collo, il nostro cuscino letto è utilizzabile in due differenti posizioni previene e tratta dolore, russamento e apnee",
      "2 ALTEZZE: cuscino per cervicale di dimensione 40x70cm con lati di altezza differenti 9cm ideale per chi cerca un cuscino basso per dormire e 11cm perfetto per chi sta cercando un cuscino alto",
      "LAVABILE: cuscino ergonomico cervicale con rivestimento in bamboo sfoderabile con zip laterale, il tessuto in bamboo è la miglior opzione per chi cerca un cuscino antiacaro anallergico facile da lavare",
      "MEMORY FOAM DENSO: cuscino per dormire ad alto potere traspirante grazie alla sua struttura forata, il nostro guanciale letto è il compromesso ideale tra freschezza e supporto cervicale e lombare",
      "100% MADE IN ITALY: produciamo cuscini letto matrimoniale e singolo sul territorio, ogni nostro cuscino in memory foam è privo di sostanze nocive, per l'uomo e l'ambiente con certificazione OEKO TEX",
    ],
    specs: [
      { label: "Dimensione", value: "40 × 70 cm" },
      { label: "Altezze", value: "9 cm / 11 cm" },
      { label: "Materiale", value: "Memory foam" },
      { label: "Federa", value: "Aloe Vera, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Aloe Vera"],
    tone: T.sage,
    createdAt: "2025-03-05",
    relatedIds: ["onda-bamboo", "doppia-altezza-aloe", "aloe-15"],
  }),
  prod({
    id: "doppia-altezza-bamboo",
    slug: "cervicale-doppia-altezza-bamboo",
    sku: "B0GZLDWFY8",
    name: "The Double Twenty – Cuscino Cervicale per Dormire Ortopedico - Doppia Altezza 12,5/9cm con Federa Lavabile in Bamboo - Cuscino Memory Foam Antirussamento a Farfalla - Made in Italy e Oeko Tex",
    tagline: "Ortopedico a farfalla, doppia altezza, federa bamboo.",
    categoryId: "cervicale",
    price: 3100,
    isNew: true,
    bullets: [
      "FEDERA BAMBOO – FRESCA, TRASPIRANTE, IPOALLERGENICA: Fibra di bamboo naturalmente termoregolante: fresca d'estate, tiepida d'inverno. Morbida, ipoallergenica e sostenibile. Sfoderabile e lavabile in lavatrice.",
      "CUSCINO CERVICALE ORTOPEDICO – 3 POSIZIONI DI DORMITA: Forma a farfalla con zone differenziate: sostiene collo e colonna in posizione supina, laterale e prona. Braccioli integrati riducono la pressione su spalle e polsi.",
      "DOPPIA ALTEZZA – 12,5 CM E 9 CM: Lato alto per chi dorme sulla schiena, lato basso per chi dorme su un fianco o prono. Basta girarlo: un solo cuscino per ogni corporatura.",
      "ANTI RUSSAMENTO – MEMORY FOAM PREMIUM – 60x35 CM: Mantiene testa e collo allineati per una respirazione più libera. Il memory foam si adatta al corpo e allevia la pressione. Sempre fresco.",
      "MADE IN ITALY – OEKO-TEX STANDARD 100: Progettato e prodotto interamente in Italia. Memory foam certificato OEKO-TEX (1701002 Centexbel): sicuro, privo di sostanze nocive, rispettoso dell'ambiente.",
    ],
    specs: [
      { label: "Dimensione", value: "60 × 35 cm" },
      { label: "Altezze", value: "12,5 cm / 9 cm" },
      { label: "Materiale", value: "Memory foam premium" },
      { label: "Federa", value: "Bamboo, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX Standard 100 · Made in Italy" },
    ],
    materials: ["Memory foam", "Bamboo"],
    tone: T.sand,
    createdAt: "2025-04-20",
    relatedIds: ["doppia-altezza-aloe", "onda-bamboo", "antirussamento-18"],
  }),
  prod({
    id: "doppia-altezza-aloe",
    slug: "cervicale-doppia-altezza-aloe-vera",
    sku: "B0GZL1T2CT",
    name: "The Double Twenty – Cuscino Cervicale per Dormire Ortopedico - Doppia Altezza 12,5/9cm con Federa Lavabile in Aloe Vera - Cuscino Memory Foam Antirussamento a Farfalla - Made in Italy e Oeko Tex",
    tagline: "Ortopedico a farfalla, doppia altezza, federa aloe vera.",
    categoryId: "cervicale",
    price: 3100,
    isNew: true,
    bullets: [
      "FEDERA ALOE VERA – MORBIDA E LENITIVA: Tessuto trattato con estratto di Aloe Vera, idratante e delicato sulla pelle. Ideale per pelli sensibili. Sfoderabile e lavabile in lavatrice.",
      "CUSCINO CERVICALE ORTOPEDICO – 3 POSIZIONI DI DORMITA: Forma a farfalla con zone differenziate: sostiene collo e colonna in posizione supina, laterale e prona. Braccioli integrati riducono la pressione su spalle e polsi.",
      "DOPPIA ALTEZZA – 12,5 CM E 9 CM: Lato alto per chi dorme sulla schiena, lato basso per chi dorme su un fianco o prono. Basta girarlo: un solo cuscino per ogni corporatura.",
      "ANTI RUSSAMENTO – MEMORY FOAM PREMIUM – 60x35 CM: Mantiene testa e collo allineati per una respirazione più libera. Il memory foam si adatta al corpo e allevia la pressione. Sempre fresco.",
      "MADE IN ITALY – OEKO-TEX STANDARD 100: Progettato e prodotto interamente in Italia. Memory foam certificato OEKO-TEX (1701002 Centexbel): sicuro, privo di sostanze nocive, rispettoso dell'ambiente.",
    ],
    specs: [
      { label: "Dimensione", value: "60 × 35 cm" },
      { label: "Altezze", value: "12,5 cm / 9 cm" },
      { label: "Materiale", value: "Memory foam premium" },
      { label: "Federa", value: "Aloe Vera, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX Standard 100 · Made in Italy" },
    ],
    materials: ["Memory foam", "Aloe Vera"],
    tone: T.sage,
    createdAt: "2025-04-22",
    relatedIds: ["doppia-altezza-bamboo", "onda-aloe", "aloe-12"],
  }),
  prod({
    id: "silver-15",
    slug: "cervicale-memory-15cm-silver",
    sku: "B0FYY2732M",
    name: "Double Twenty Cuscino Cervicale Memory Altezza 15 cm 72x42 cm - Federa Silver Argento Naturale Antibatterica - Ergonomico Massaggiante Sfoderabile Antiacaro - Made in Italy",
    tagline: "Cervicale memory 15 cm, federa argento antibatterica.",
    categoryId: "cervicale",
    price: 3455,
    bullets: [
      "4 ALTEZZE – Scegli il Supporto Giusto per Te: altezza pensata per allineare correttamente testa, collo e colonna vertebrale in base alla tua posizione di dormita preferita, tra 4 misure disponibili (8, 10, 13, 15 cm).",
      "SCHIUMA VISCOELASTICA INNOVATIVA – Comfort su Misura: si adatta perfettamente alla forma di collo e testa, per un supporto personalizzato e duraturo notte dopo notte.",
      "FEDERA IN ARGENTO NATURALE – Proprietà Antibatteriche: tessitura con fili d'argento che contrasta i batteri, favorisce la traspirabilità e la sensazione di freschezza tutta la notte.",
      "TECNICA MILLEFORI – Traspirabilità Assicurata: la struttura forata favorisce il passaggio dell'aria, mantenendo il cuscino fresco, igienico e asciutto.",
      "MADE IN ITALY – Certificato OEKO-TEX, Antiacaro ed Ergonomico: qualità italiana con materiali selezionati, sostiene correttamente testa e collo. Sfoderabile e arriva arrotolato, pronto in 5 minuti.",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezza", value: "15 cm" },
      { label: "Materiale", value: "Schiuma viscoelastica millefori" },
      { label: "Federa", value: "Argento naturale, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Fibra d'argento"],
    tone: T.silver,
    createdAt: "2025-02-10",
    relatedIds: ["silver-13", "silver-10", "aloe-15"],
  }),
  prod({
    id: "silver-13",
    slug: "cervicale-memory-13cm-silver",
    sku: "B0FYY2CC9Y",
    name: "Double Twenty Cuscino Cervicale Memory Altezza 13 cm 72x42 cm - Federa Silver Argento Naturale Antibatterica - Ergonomico Massaggiante Sfoderabile Antiacaro - Made in Italy",
    tagline: "Cervicale memory 13 cm, federa argento antibatterica.",
    categoryId: "cervicale",
    price: 3189,
    bullets: [
      "4 ALTEZZE – Scegli il Supporto Giusto per Te: altezza pensata per allineare correttamente testa, collo e colonna vertebrale in base alla tua posizione di dormita preferita, tra 4 misure disponibili (8, 10, 13, 15 cm).",
      "SCHIUMA VISCOELASTICA INNOVATIVA – Comfort su Misura: si adatta perfettamente alla forma di collo e testa, per un supporto personalizzato e duraturo notte dopo notte.",
      "FEDERA IN ARGENTO NATURALE – Proprietà Antibatteriche: tessitura con fili d'argento che contrasta i batteri, favorisce la traspirabilità e la sensazione di freschezza tutta la notte.",
      "TECNICA MILLEFORI – Traspirabilità Assicurata: la struttura forata favorisce il passaggio dell'aria, mantenendo il cuscino fresco, igienico e asciutto.",
      "MADE IN ITALY – Certificato OEKO-TEX, Antiacaro ed Ergonomico: qualità italiana con materiali selezionati, sostiene correttamente testa e collo. Sfoderabile e arriva arrotolato, pronto in 5 minuti.",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezza", value: "13 cm" },
      { label: "Materiale", value: "Schiuma viscoelastica millefori" },
      { label: "Federa", value: "Argento naturale, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Fibra d'argento"],
    tone: T.silver,
    createdAt: "2025-02-11",
    relatedIds: ["silver-15", "silver-10", "aloe-12"],
  }),
  prod({
    id: "silver-10",
    slug: "cervicale-memory-10cm-silver",
    sku: "B0FYY516P8",
    name: "Double Twenty Cuscino Cervicale Memory Altezza 10 cm 72x42 cm - Federa Silver Argento Naturale Antibatterica - Ergonomico Massaggiante Sfoderabile Antiacaro - Made in Italy",
    tagline: "Cervicale memory 10 cm, federa argento antibatterica.",
    categoryId: "cervicale",
    price: 2834,
    bullets: [
      "4 ALTEZZE – Scegli il Supporto Giusto per Te: altezza pensata per allineare correttamente testa, collo e colonna vertebrale in base alla tua posizione di dormita preferita, tra 4 misure disponibili (8, 10, 13, 15 cm).",
      "SCHIUMA VISCOELASTICA INNOVATIVA – Comfort su Misura: si adatta perfettamente alla forma di collo e testa, per un supporto personalizzato e duraturo notte dopo notte.",
      "FEDERA IN ARGENTO NATURALE – Proprietà Antibatteriche: tessitura con fili d'argento che contrasta i batteri, favorisce la traspirabilità e la sensazione di freschezza tutta la notte.",
      "TECNICA MILLEFORI – Traspirabilità Assicurata: la struttura forata favorisce il passaggio dell'aria, mantenendo il cuscino fresco, igienico e asciutto.",
      "MADE IN ITALY – Certificato OEKO-TEX, Antiacaro ed Ergonomico: qualità italiana con materiali selezionati, sostiene correttamente testa e collo. Sfoderabile e arriva arrotolato, pronto in 5 minuti.",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezza", value: "10 cm" },
      { label: "Materiale", value: "Schiuma viscoelastica millefori" },
      { label: "Federa", value: "Argento naturale, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Fibra d'argento"],
    tone: T.silver,
    createdAt: "2025-02-12",
    relatedIds: ["silver-13", "silver-15", "basso-8"],
  }),
  prod({
    id: "aloe-15",
    slug: "cervicale-memory-15cm-aloe-vera",
    sku: "B0FLSLDKGV",
    name: "Double Twenty Cuscino Cervicale Memory Altezza 15 cm 72x42 cm - Federa Aloe Vera Traspirante - Ergonomico Massaggiante Sfoderabile Antiacaro - Made in Italy",
    tagline: "Cervicale memory 15 cm, sostegno deciso, federa aloe.",
    categoryId: "cervicale",
    price: 3712,
    bullets: [
      "SUPPORTO ERGONOMICO AD ALTA DENSITÀ: Realizzato in memory foam viscoelastico ad alta densità, il cuscino sostiene testa e collo favorendo un corretto allineamento della colonna vertebrale durante il riposo.",
      "SOSTEGNO DECISO E PROFILO ALTO 15 CM: Progettato per offrire un supporto cervicale stabile e strutturato. La sua altezza e compattezza lo rendono ideale per chi cerca un sostegno più deciso rispetto ai cuscini tradizionali morbidi.",
      "ADATTAMENTO GRADUALE: Il memory foam reagisce al peso e al calore corporeo adattandosi progressivamente alla forma del corpo. Potrebbe essere necessario un breve periodo iniziale di adattamento.",
      "FEDERA ALOE VERA TRASPIRANTE E LAVABILE: Federa morbida con trattamento Aloe Vera, traspirante, ipoallergenica, sfoderabile e lavabile in lavatrice per garantire freschezza e praticità quotidiana",
      "IDEALE PER POSIZIONE SUPINA E LATERALE: L’altezza di 15 cm e il design ergonomico a saponetta sono studiati per offrire supporto a chi dorme prevalentemente sulla schiena o sul fianco.",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezza", value: "15 cm" },
      { label: "Materiale", value: "Memory foam alta densità" },
      { label: "Federa", value: "Aloe Vera, sfoderabile" },
      { label: "Origine", value: "Made in Italy" },
    ],
    materials: ["Memory foam", "Aloe Vera"],
    tone: T.sage,
    createdAt: "2025-01-28",
    relatedIds: ["aloe-12", "silver-15", "onda-aloe"],
  }),
  prod({
    id: "aloe-12",
    slug: "cervicale-memory-12cm-aloe-vera",
    sku: "B0F5HWLJ9Z",
    name: "Double Twenty Cuscino Cervicale Memory Altezza 12 cm 72x42 cm - Federa Aloe Vera Traspirante - Ergonomico Massaggiante Sfoderabile Antiacaro - Made in Italy",
    tagline: "Cervicale memory 12 cm, sostegno deciso, federa aloe.",
    categoryId: "cervicale",
    price: 3181,
    bullets: [
      "SUPPORTO ERGONOMICO AD ALTA DENSITÀ: Realizzato in memory foam viscoelastico ad alta densità, il cuscino sostiene testa e collo favorendo un corretto allineamento della colonna vertebrale durante il riposo.",
      "SOSTEGNO DECISO E PROFILO ALTO 12 CM: Progettato per offrire un supporto cervicale stabile e strutturato. La sua altezza e compattezza lo rendono ideale per chi cerca un sostegno più deciso rispetto ai cuscini tradizionali morbidi.",
      "ADATTAMENTO GRADUALE: Il memory foam reagisce al peso e al calore corporeo adattandosi progressivamente alla forma del corpo. Potrebbe essere necessario un breve periodo iniziale di adattamento.",
      "FEDERA ALOE VERA TRASPIRANTE E LAVABILE: Federa morbida con trattamento Aloe Vera, traspirante, ipoallergenica, sfoderabile e lavabile in lavatrice per garantire freschezza e praticità quotidiana",
      "IDEALE PER POSIZIONE SUPINA E LATERALE: L’altezza di 15 cm e il design ergonomico a saponetta sono studiati per offrire supporto a chi dorme prevalentemente sulla schiena o sul fianco.",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 cm" },
      { label: "Altezza", value: "12 cm" },
      { label: "Materiale", value: "Memory foam alta densità" },
      { label: "Federa", value: "Aloe Vera, sfoderabile" },
      { label: "Origine", value: "Made in Italy" },
    ],
    materials: ["Memory foam", "Aloe Vera"],
    tone: T.sage,
    createdAt: "2025-01-29",
    relatedIds: ["aloe-15", "silver-13", "onda-aloe"],
  }),
  prod({
    id: "basso-8",
    slug: "memory-foam-basso-8cm",
    sku: "B0FLS3RBY9",
    name: "The Double Twenty | Cuscino Memory Foam BASSO 8 cm – Supporto Cervicale Ergonomico ad Alta Densità (Sostegno Deciso) – Modello Saponetta con Federa Aloe Vera – Ideale per Bambini e Posizione Supina",
    tagline: "Profilo basso 8 cm, sostegno deciso, federa aloe.",
    categoryId: "cervicale",
    price: 2650,
    bullets: [
      "SUPPORTO ERGONOMICO AD ALTA DENSITÀ: Memory foam viscoelastico progettato per sostenere testa e collo, favorendo il corretto allineamento della colonna vertebrale",
      "SOSTEGNO DECISO (NON MORBIDO): Struttura compatta pensata per offrire stabilità e supporto cervicale; ideale per chi cerca un cuscino supportivo e non soffice",
      "ADATTAMENTO GRADUALE: Il materiale si adatta progressivamente alla forma del corpo; può essere necessario un breve periodo di adattamento iniziale",
      "DESIGN BASSO 8 CM PER BAMBINI: Altezza ridotta ideale per bambini e per chi dorme in posizione supina o prona, garantendo un supporto equilibrato",
      "FEDERA ALOE VERA TRASPIRANTE E LAVABILE: Federa ipoallergenica, sfoderabile e lavabile in lavatrice, progettata per garantire freschezza, igiene e comfort",
    ],
    specs: [
      { label: "Altezza", value: "8 cm" },
      { label: "Materiale", value: "Memory foam alta densità" },
      { label: "Modello", value: "Saponetta" },
      { label: "Federa", value: "Aloe Vera, sfoderabile" },
      { label: "Origine", value: "Made in Italy" },
    ],
    materials: ["Memory foam", "Aloe Vera"],
    tone: T.sage,
    createdAt: "2025-03-15",
    relatedIds: ["silver-10", "aloe-12", "baby-blu"],
  }),
  prod({
    id: "antirussamento-18",
    slug: "antirussamento-antireflusso-18cm",
    sku: "B0FYY9LLDX",
    name: "Double Twenty Cuscino 18 cm Antirussamento e Antireflusso Adulti in Memory Foam - Guanciale Ortopedico Ergonomico Cervicale - Antiacaro Federa Argento Naturale - Made in Italy",
    tagline: "Alto 18 cm, antirussamento e antireflusso, federa argento.",
    categoryId: "cervicale",
    price: 4164,
    bullets: [
      "ALTEZZA 18 CM – Aiuta Contro Russamento e Reflusso: il cuscino antirussamento e antireflusso mantiene l'allineamento di testa, collo e spalle, per un sonno più profondo e rigenerante.",
      "CUSCINO CERVICALE MEMORY FOAM – Guanciale Ergonomico Ortopedico: schiuma viscoelastica automodellante con trama massaggiante, ideale per dormire e sostenere correttamente testa e collo.",
      "FEDERA IN ARGENTO NATURALE – Proprietà Antibatteriche: tessitura con fili d'argento che contrasta i batteri, favorisce la traspirabilità e la sensazione di freschezza tutta la notte.",
      "ANTIACARO E TRASPIRANTE – Certificato OEKO-TEX: protegge da acari e allergeni, sostiene correttamente testa e collo con comfort su misura. Guanciale sfoderabile e facile da lavare.",
      "MADE IN ITALY – 72x42x18 cm: cuscino cervicale memory prodotto in Italia con cura nei dettagli. Arriva arrotolato e compatto: basta aprire la confezione e attendere 5 minuti.",
    ],
    specs: [
      { label: "Dimensione", value: "72 × 42 × 18 cm" },
      { label: "Altezza", value: "18 cm" },
      { label: "Materiale", value: "Memory foam viscoelastico" },
      { label: "Federa", value: "Argento naturale, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam", "Fibra d'argento"],
    tone: T.silver,
    createdAt: "2025-04-10",
    relatedIds: ["silver-15", "onda-bamboo", "doppia-altezza-bamboo"],
  }),
  prod({
    id: "allattamento-beige",
    slug: "cuscino-allattamento-ferro-di-cavallo",
    sku: "B0GVSV5SBH",
    name: "Double Twenty Cuscino Allattamento a Ferro di Cavallo 58x50 cm - Fiocco Memory Foam e Fibra Poliestere - Sfoderabile Lavabile Antiacaro - 6 Colori - Made in Italy - Beige",
    tagline: "Allattamento a ferro di cavallo, fiocco memory e fibra.",
    categoryId: "gravidanza",
    price: 2391,
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
      { label: "Imbottitura", value: "Fiocco memory + fibra poliestere" },
      { label: "Federa", value: "Ipoallergenica, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Fiocco memory", "Fibra poliestere"],
    tone: T.warm,
    createdAt: "2025-05-01",
    relatedIds: ["baby-blu", "fiocco-memory", "microfibra"],
  }),
  prod({
    id: "baby-blu",
    slug: "cuscino-baby-antisoffoco-blu",
    sku: "B0FYYH1TMR",
    name: "Double Twenty Cuscino Baby Memory Antisoffoco 50x30 cm - Cuscino Neonato 100% Memory Puro Tecnica Millefori - Ipoallergenico Antiacaro Sfoderabile - Made in Italy - Blu",
    tagline: "Baby antisoffoco 50×30, 100% memory millefori (blu).",
    categoryId: "bambino",
    price: 1772,
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
      { label: "Colore", value: "Blu" },
      { label: "Età", value: "Da 0-12 mesi a 1+ anni" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam"],
    tone: T.warm,
    createdAt: "2025-05-12",
    relatedIds: ["baby-rosa", "allattamento-beige", "basso-8"],
  }),
  prod({
    id: "baby-rosa",
    slug: "cuscino-baby-antisoffoco-rosa",
    sku: "B0FYYF4MMF",
    name: "Double Twenty Cuscino Baby Memory Antisoffoco 50x30 cm - Cuscino Neonato 100% Memory Puro Tecnica Millefori - Ipoallergenico Antiacaro Sfoderabile - Made in Italy - Rosa",
    tagline: "Baby antisoffoco 50×30, 100% memory millefori (rosa).",
    categoryId: "bambino",
    price: 1772,
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
      { label: "Colore", value: "Rosa" },
      { label: "Età", value: "Da 0-12 mesi a 1+ anni" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Memory foam"],
    tone: T.warm2,
    createdAt: "2025-05-13",
    relatedIds: ["baby-blu", "allattamento-beige", "basso-8"],
  }),
  prod({
    id: "fiocco-memory",
    slug: "cuscino-fiocco-memory-foam",
    sku: "B0GGJC4PBB",
    name: "The Double Twenty Cuscino in Fiocco di Memory Foam 40 x 70cm Ortopedico Ergonomico per Cervicale e Collo, Traspirante e Antiacaro, per Tutte le Posizioni di Sonno, OEKO-TEX, Made in Italy",
    tagline: "Fiocco di memory 40×70, ortopedico, federa argento.",
    categoryId: "classico",
    price: 1772,
    bullets: [
      "Cuscino fiocco memory foam: grazie alla schiuma viscoelastica ad alta densità, il cuscino si adatta perfettamente ai contorni di capo e collo, favorendo un allineamento neutro della colonna vertebrale e riducendo il dolore cervicale al risveglio.",
      "Argento naturale: la fodera , intelaiata con argento, è naturalmente antibatterica e ipoallergenica, ideale per pelli sensibili e soggetti a reazioni allergiche, mantenendo un ambiente di riposo fresco e pulito.",
      "La schiuma ad alta densità distribuisce uniformemente il peso della testa, alleviando i punti di pressione e prevenendo intorpidimenti, per un sonno profondo e rigenerante.",
      "Progettato per offrire sostegno al collo, questo cuscino letto in fiocco di memory foam è ideale per chi alterna posizione supina e laterale, garantendo sempre comfort personalizzato.",
      "Design: i fiocchi in memory, strategicamente posizionati nella struttura favoriscono la circolazione dell’aria interna, migliorando traspirabilità e ventilazione per un sonno asciutto e senza accumulo di umidità.",
    ],
    specs: [
      { label: "Dimensione", value: "40 × 70 cm" },
      { label: "Imbottitura", value: "Fiocco di memory foam alta densità" },
      { label: "Federa", value: "Argento naturale, sfoderabile" },
      { label: "Certificazioni", value: "OEKO-TEX · Made in Italy" },
    ],
    materials: ["Fiocco memory", "Fibra d'argento"],
    tone: T.warm2,
    createdAt: "2025-03-22",
    relatedIds: ["microfibra", "allattamento-beige", "onda-bamboo"],
  }),
  prod({
    id: "microfibra",
    slug: "cuscino-letto-microfibra-40x70",
    sku: "B0FTK35KDP",
    name: "The Double Twenty Cuscino Letto 40x70 cm Sfoderabile in Microfibra – Altezza Regolabile, Imbottitura in Fibra di Poliestere, Lavabili con Cerniera – Certificazione OEKO-TEX®, Made in Italy",
    tagline: "Cuscino letto 40×70 microfibra, altezza regolabile.",
    categoryId: "classico",
    price: 1329,
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
    relatedIds: ["fiocco-memory", "baby-blu", "allattamento-beige"],
  }),
];
