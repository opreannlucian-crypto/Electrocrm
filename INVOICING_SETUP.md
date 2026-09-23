# Modul Facturi și RO e-Factura

Modulul **Facturi** este disponibil în secțiunea „Documente” pentru administrator și managerul de vânzări. El permite crearea unei facturi manuale, preluarea pozițiilor dintr-un deviz, asocierea cu o lucrare, emiterea, înregistrarea plăților, descărcarea PDF-ului și generarea XML-ului pentru RO e-Factura. Datele unui client se pot verifica și completa prin CUI în modulul „Clienți”, care utilizează deja serviciul public ANAF.

| Variabilă de mediu | Rol |
|---|---|
| `EFAC_ENVIRONMENT` | `test` pentru mediul ANAF de test sau `prod` pentru producție. |
| `EFAC_TOKEN` | Token OAuth valabil pentru serviciile ANAF. |
| `EFAC_CIF` | CUI numeric al emitentului cu drept de transmitere în SPV. |
| `EFAC_SELLER_NAME` | Denumirea emitentului. |
| `EFAC_SELLER_ADDRESS` | Adresa emitentului. |
| `EFAC_SELLER_IBAN` | IBAN-ul de încasare. |
| `EFAC_SELLER_BANK` | Banca emitentului. |

Adaugă valorile de mai sus în `.env`, apoi rulează `php artisan config:clear`. Cu tokenul și CUI-ul configurate, acțiunea „Generează / trimite e-Factura” pregătește XML-ul și transmite factura prin endpointul ANAF configurat. Fără acestea, aplicația generează XML-ul local și îl marchează „ready”, fără a efectua transmitere externă.

> **Important:** înainte de transmiterea în producție, un contabil sau specialist fiscal trebuie să verifice seria, datele emitentului, regulile fiscale aplicabile și conformitatea XML-ului cu specificațiile RO_CIUS/UBL curente. Documentația oficială este în `docs_efactura_sources.md`.
