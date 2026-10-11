# SEO in ogni lingua + lingua del paese (thedoubletwenty.it)

Frammento: [`tdt-seo-lingue.php`](tdt-seo-lingue.php). Il file pronto da incollare,
senza tag PHP, è [`tdt-seo-lingue-DA-INCOLLARE.txt`](tdt-seo-lingue-DA-INCOLLARE.txt).
Lavora insieme al plugin **TDT Lingue**, che resta com'è.

## Cosa cambia

| Prima | Dopo |
|---|---|
| Un solo indirizzo per pagina: Google conosceva solo l'italiano | Ogni lingua ha i suoi indirizzi: `/negozio/`, `/en/negozio/`, `/fr/negozio/`, `/de/negozio/`, `/es/negozio/` |
| Chi apriva il sito dalla Germania lo vedeva in italiano | Alla prima visita il sito si apre nella lingua del paese (Germania e Austria in tedesco, Francia in francese, Spagna in spagnolo...) |

**Per Google e Bing**, ogni versione contiene:
- i link `hreflang` verso tutte le lingue, più `x-default` che punta all'inglese;
- canonical, `og:url`, `og:locale` e lingua della pagina corretti;
- il titolo già tradotto;
- la meta description tradotta. Se la traduzione manca, la description viene tolta e Google scrive il riassunto dal testo tradotto.

Inoltre:
- i link interni restano nella lingua della pagina;
- c'è una sitemap con tutte le lingue, `/sitemap-lingue.xml`, già aggiunta all'indice di Yoast e a robots.txt.

**Lingua del paese**:
- Il paese si ricava dall'indirizzo IP, con la geolocalizzazione di WooCommerce. Se non risponde, si usa il fuso orario del dispositivo.
- Svizzera, Belgio, Lussemburgo e Canada hanno più lingue: si usa la lingua del telefono, se è una di quelle del paese.
- Nei paesi senza una lingua del sito (Olanda, Polonia...) si usa la lingua del telefono, se il sito ce l'ha, altrimenti l'inglese.
- La scelta fatta dal selettore vince sempre e resta per le visite successive.
- Google e le anteprime dei link (WhatsApp, Facebook) non vengono mai spostati.

**Cosa non cambia**:
- Carrello, pagamento e account restano a `/carrello/`, `/pagamento/` e `/mio-account/` e si traducono come prima.
- Nutrex Lab e le pagine escluse in TDT Lingue restano solo in italiano.
- Nel database non cambia niente.

## Installazione

1. In WordPress apri **WPCode** (o Code Snippets) e scegli **Aggiungi nuovo**, tipo **PHP Snippet**.
2. Incolla tutto il contenuto di `tdt-seo-lingue-DA-INCOLLARE.txt`. Non usare il file `.php`: la sua prima riga dà "syntax error".
3. Imposta Inserimento **ovunque** ("Run Everywhere"), poi salva e attiva.
4. Svuota la cache di SiteGround: **Speed Optimizer → Purge**.
5. In **Google Search Console**, alla voce **Sitemap**, aggiungi `sitemap-lingue.xml`. Se usi anche Bing Webmaster Tools, aggiungila lì.

## Come provarlo

- **Pagine tradotte**: apri `https://thedoubletwenty.it/de/` (oppure `/en/`, `/fr/`, `/es/`). Con "Visualizza sorgente pagina" vedi il `<title>` tradotto e i link `hreflang`.
- **Lingua del paese senza viaggiare**: apri una finestra in incognito e vai su `https://thedoubletwenty.it/?paese=DE` (oppure `FR`, `ES`, `GB`, `CH`, `IT`...). Va bene anche una VPN impostata su un altro paese.
- **Ogni prova va fatta in una nuova finestra in incognito**: il sito si ricorda la lingua, quindi dalla seconda visita la decisione è già presa.
- **Strumenti di Google**: in Search Console usa "Controllo URL" su un indirizzo `/de/...` e guarda la pagina come la vede Google.

## Titoli e descrizioni ancora in italiano

Le traduzioni vengono dagli stessi dizionari di TDT Lingue, quindi:

1. Le meta description di Yoast (e i titoli) senza traduzione compaiono da sole in **Impostazioni → TDT Lingue → Testi senza traduzione**. Compaiono appena una pagina `/de/...` (o di un'altra lingua) viene aperta da un visitatore o da Google.
2. Traducili in **Traduzioni aggiunte**, oppure copia l'elenco in JSON, fallo tradurre e incollalo in **Importa traduzioni**.
3. Al salvataggio la cache si svuota da sola e le pagine tradotte mostrano subito la nuova descrizione.

## Tempi

Google deve scoprire e indicizzare le nuove pagine: di solito servono **da qualche giorno a qualche settimana**. La sitemap aiuta.

Il testo delle pagine lo traduce TDT Lingue nel browser, mentre la pagina si carica. Google esegue quello script e indicizza il testo tradotto. Il titolo, invece, è già tradotto nel codice della pagina.

## Impostazioni (facoltative)

In cima al frammento, nella funzione `tdtseo_config()`:

| Chiave | Valore | Effetto |
|---|---|---|
| `x_default` | `'en'` | La versione per chi cerca in una lingua che il sito non ha. |
| `auto` | `true` | Lingua del paese alla prima visita. Con `false` restano solo gli indirizzi per lingua e la scelta salvata. |
| `geo_ip` | `true` | Paese dall'indirizzo IP. Con `false` contano solo il fuso orario e la lingua del dispositivo. |

**Privacy**: senza una chiave MaxMind, WooCommerce chiede il paese a un servizio esterno, mandandogli l'indirizzo IP del visitatore. Per farlo restare sul sito, inserisci la chiave gratuita di MaxMind in **WooCommerce → Impostazioni → Integrazione**. Al browser torna solo la sigla del paese e non viene salvato nulla.

## Per spegnerlo

Disattiva il frammento e svuota la cache. Il sito torna com'era: un solo indirizzo, con la traduzione nel browser.
