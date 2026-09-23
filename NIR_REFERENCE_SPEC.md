# Specificație NIR de referință

Modelul furnizat de utilizator arată un ecran operațional pentru „Recepții furnizori”, nu un formular simplu. Structura observată:

## Antet
- Furnizor căutat după nume sau CIF/CUI, cu buton „Preia date”.
- Document justificativ selectabil: Factură.
- Număr document justificativ.
- Data documentului.
- Moneda recepției.
- Cod document.
- Serie recepție.
- Data intrării în stoc.
- Opțiune pentru documente multiple.

## Linia de intrare
- Gestiune.
- Denumire produs/serviciu.
- Cod produs.
- U.M.
- Cantitate conform documentului.
- Cantitate primită.
- Preț achiziție.
- Cotă TVA.
- TVA inclus: Da/Nu.
- Buton de adăugare a liniei.

## Tabelul recepției
Coloane: Nr. crt., Gestiune, Denumire produs/serviciu, U.M., Cant., Preț, Valoare, TVA, Preț vânzare, Valoare în stoc.

## Acțiuni și secțiuni finale
- Filtrare.
- Import.
- Plătește acum, cu total sau parțial.
- Mențiuni/observații.
- Comisia de recepție.
- Delegat.
- Auto.
- Formularul trebuie să permită adăugarea mai multor produse și salvarea recepției ca document de intrare în gestiune.

## Reguli ElectroCRM
- Tipul gestiunii selectate determină evidența: Global valoric sau Cantitativ-valoric.
- Furnizorul se poate identifica automat după CUI prin serviciul public ANAF.
- Stocul se actualizează doar după salvarea recepției, pe gestiunea aleasă.
