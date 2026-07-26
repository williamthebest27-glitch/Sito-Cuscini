# lib/integrations

Predisposizione (non attiva) per i sistemi esterni. Nessuna chiamata di rete è
implementata: gli adapter sono **stub** che restano inattivi finché non vengono
fornite le credenziali via variabili d'ambiente.

## Struttura

```
integrations/
  types.ts        # contratti comuni (Fulfillment/Inventory/Shipping + Address, OrderLine…)
  index.ts        # registry: getFulfillmentProvider(), getInventoryProvider(), getShippingProvider()
  amazon-mcf/     # Amazon Multi-Channel Fulfillment  → FulfillmentProvider
  webbee/         # WebBee (magazzino multicanale)     → InventoryProvider
  erp/            # ERP generico (SAP/Odoo/Danea…)     → InventoryProvider
  couriers/       # Corrieri (BRT/GLS/Poste/DHL…)      → ShippingProvider
```

## Come attivare un'integrazione (in futuro)

1. Popolare le variabili d'ambiente in `.env.local` (elenco nei commenti di ogni
   adapter). Esempio Amazon MCF:
   ```
   AMAZON_MCF_CLIENT_ID=...
   AMAZON_MCF_CLIENT_SECRET=...
   AMAZON_MCF_REFRESH_TOKEN=...
   ```
2. Implementare il corpo dei metodi dell'adapter (oggi lanciano
   `IntegrationNotConfiguredError`).
3. Nessun'altra modifica: il resto dell'app usa solo le interfacce di `types.ts`
   tramite `index.ts`.

## Principio

Il codice applicativo non conosce i fornitori: dipende dalle **interfacce**. Così
si può cambiare corriere, gestionale o sistema di fulfillment senza riscrivere
pagine, carrello o checkout.
