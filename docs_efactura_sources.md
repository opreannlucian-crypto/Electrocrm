# Surse tehnice RO e-Factura

- Ministerul Finanțelor, [Informații tehnice eFactura](https://mfinante.gov.ro/en/web/efactura/informatii-tehnice): anunță utilizarea serviciilor de test/producție, validatoare UBL/CII și trimite la prezentarea API și swagger-uri.
- Ministerul Finanțelor, [Prezentare servicii web RO e-Factura](https://mfinante.gov.ro/static/10/eFactura/prezentare%20api%20efactura.pdf), actualizată la 13.02.2025: pentru OAuth2, upload UBL în producție se face prin `POST https://api.anaf.ro/prod/FCTEL/rest/upload?standard=UBL&cif={cif}`, iar în test prin `/test/`; pentru B2C există `uploadb2c`. Documentul precizează și `stareMesaj`, `listaMesajeFactura`, `descarcare`, `validare` și transformare XML-PDF.
- ANAF, [Servicii WEB](https://www.anaf.ro/anaf/internet/ANAF/servicii_online/servicii_web_anaf/): enumeră serviciile oficiale RO e-Factura și registrul public RO e-Factura.
- ANAF, endpoint CUI utilizat deja în proiect: `https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva`.

Implementare curentă: modulul generează XML UBL și păstrează trasabilitatea uploadului. Transmiterea către producție necesită configurarea separată a tokenului OAuth, CIF-ului și datelor emitentului în variabilele de mediu, precum și verificare fiscală înainte de utilizare efectivă.
