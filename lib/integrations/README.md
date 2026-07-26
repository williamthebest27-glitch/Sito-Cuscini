# lib/integrations

Integrazioni con i sistemi esterni dietro interfacce comuni. Ogni adapter si
attiva quando ha le credenziali (via env); altrimenti resta inattivo.

## Struttura

```
integrations/
  types.ts        # contratti comuni (Fulfillment/Inventory/Shipping + Address, OrderLine…)
  index.ts        # registry: getFulfillmentProvider(), getInventoryProvider(), getShippingProvider()
  amazon-mcf/     # Amazon Multi-Channel Fulfillment  → FulfillmentProvider  ✅ IMPLEMENTATO
    config.ts     #   env + endpoint regionali + marketplace + mappa SKU
    client.ts     #   auth LWA (refresh→access token, cache) + fetch SP-API
    index.ts      #   AmazonMcfProvider: create/getStatus/cancel
  webbee/         # WebBee (magazzino multicanale)     → InventoryProvider   (stub)
  erp/            # ERP generico (SAP/Odoo/Danea…)     → InventoryProvider   (stub)
  couriers/       # Corrieri (BRT/GLS/Poste/DHL…)      → ShippingProvider    (stub)
```

## Amazon MCF — attivazione

MCF è l'evasione ordini: Amazon preleva, imballa e spedisce ai tuoi clienti. È già
**implementato** e agganciato al checkout (`app/(shop)/checkout/actions.ts`): quando
un ordine viene inviato e MCF è configurato, viene creato un `fulfillmentOrder`
SP-API.

**Prerequisiti (lato Amazon):**
1. Account **Amazon Seller** con **FBA/MCF** attivo e prodotti già a magazzino
   Amazon (i tuoi *seller SKU*).
2. App **SP-API** in Seller Central → Developer Central → `client_id` + `client_secret`.
3. Autorizza l'app sul tuo account per ottenere il **refresh token** (Login with Amazon).

**Configurazione (lato progetto):** copia `.env.example` in `.env.local` e compila:
```
AMAZON_MCF_CLIENT_ID=...
AMAZON_MCF_CLIENT_SECRET=...
AMAZON_MCF_REFRESH_TOKEN=...
AMAZON_MCF_REGION=eu                      # Italia = eu
AMAZON_MCF_MARKETPLACE_ID=APJ6JRA9NG5V4   # Italia
# AMAZON_MCF_SKU_MAP={"AUR-MED":"AMZ-AUR-MED"}   # solo se gli SKU differiscono
```

**SKU:** gli SKU del catalogo (`lib/shop/data.ts`) devono corrispondere ai seller
SKU su Amazon. Se differiscono, usa `AMAZON_MCF_SKU_MAP` per la traduzione.

> MCF gestisce solo spedizione/evasione. Il **pagamento** è un passaggio separato
> (non ancora integrato): il checkout non addebita nulla.

## Attivare uno stub (WebBee / ERP / corrieri)

1. Popolare le env dell'adapter (vedi commenti nel rispettivo `index.ts`).
2. Implementare il corpo dei metodi (oggi lanciano `IntegrationNotConfiguredError`).
3. Nessun'altra modifica: il resto dell'app usa solo le interfacce di `types.ts`
   tramite `index.ts`.

## Principio

Il codice applicativo non conosce i fornitori: dipende dalle **interfacce**. Così
si può cambiare corriere, gestionale o sistema di fulfillment senza riscrivere
pagine, carrello o checkout.
