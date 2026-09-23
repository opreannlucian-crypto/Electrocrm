# Oblio în ElectroCRM — configurare și operare

**Stare:** integrare activată pentru emitere controlată din ElectroCRM, cu seria Oblio `EL` și e-Factura/SPV administrată prin Oblio.

> **Atenție fiscală:** verificați seriile de facturare, regimul TVA și setarea SPV din Oblio împreună cu contabilul înainte de prima emitere reală.

## Configurarea pe server

Secretul Oblio se păstrează doar în variabilele de mediu ale serverului. Nu îl introduceți în React, în baza de date, în arhive sau în Git.

```dotenv
OBLIO_EMAIL=contul-oblio@exemplu.ro
OBLIO_SECRET=secretul-api-oblio
OBLIO_CIF=RO23457886
OBLIO_INVOICE_SERIES=EL
OBLIO_SYNC_ENABLED=true
OBLIO_SPV_EXTERN=true
OBLIO_TIMEOUT=20
OBLIO_RETRY_TIMES=2
```

Pentru verificare, administratorul deschide orice factură și apasă **Testează conexiunea**. Această acțiune este numai citire: validează autentificarea și citește nomenclatoarele Oblio. Nu creează documente.

| Setare | Efect |
|---|---|
| `OBLIO_SYNC_ENABLED=true` | Facturile ciornă pot fi emise doar prin butonul **Emite în Oblio**. |
| `OBLIO_INVOICE_SERIES=EL` | Facturile Oblio folosesc seria de document confirmată în nomenclatorul Oblio. |
| `OBLIO_SPV_EXTERN=true` | La emiterea reușită, Oblio devine fluxul ales pentru RO e-Factura/SPV; ElectroCRM blochează transmiterea directă ANAF pentru acea factură. |

## Emiterea unei facturi

1. Creați factura în ElectroCRM; aceasta rămâne în starea **ciornă**.
2. Verificați clientul, pozițiile, TVA-ul, data și scadența.
3. În pagina facturii, apăsați **Emite în Oblio**.
4. Citiți dialogul de confirmare. Confirmarea generează documentul fiscal în Oblio și solicită acestuia fluxul SPV.
5. După răspunsul reușit, pagina reține seria, numărul, linkul Oblio și starea sincronizării.

O cheie persistentă de idempotency este creată pentru fiecare factură. Dacă apare o eroare de rețea, nu recreați manual factura înainte de a verifica jurnalul; reluarea folosește aceeași cheie pentru a reduce riscul dublării.

## Ce nu se întâmplă automat

Facturile existente, deja emise sau plătite, nu sunt modificate și nu sunt trimise retroactiv în Oblio. O factură nouă nu se emite doar prin crearea ei: utilizatorul trebuie să confirme explicit acțiunea de emitere. Încasările nu sunt împinse automat în această etapă; ele rămân înregistrate în ElectroCRM până la implementarea fluxului explicit de sincronizare a încasărilor.

## Audit și depanare

Tabela `oblio_sync_logs` păstrează operațiunile Oblio, rezultatul HTTP, cheia de idempotency și un rezumat fără secrete al requestului/răspunsului. Eroarea prezentabilă este afișată și pe factura afectată prin `oblio_error_message`.

Dacă se schimbă seria de factură în Oblio, actualizați `OBLIO_INVOICE_SERIES` pe server, reporniți aplicația și efectuați mai întâi **Testează conexiunea**. Nu modificați manual numerele Oblio deja salvate pe facturi.
