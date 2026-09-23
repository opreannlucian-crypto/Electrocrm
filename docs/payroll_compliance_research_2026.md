# Constatări pentru modulul de fluturaș de salariu

## Surse consultate

| Sursă | Concluzie relevantă pentru proiectare |
| --- | --- |
| [ANAF — Declarația 112](https://static.anaf.ro/static/10/Anaf/Declaratii_R/112.html) | Versiunea publicată în august 2026 este valabilă de la luna de raportare iulie 2026. Modulul intern nu trebuie prezentat drept generator sau înlocuitor al declarației D112. |
| [Codul fiscal — Legea nr. 227/2015](https://legislatie.just.ro/Public/DetaliiDocumentAfis/171282) | Codul fiscal stabilește cadrul pentru impozite și contribuții sociale obligatorii; modificările legislative trebuie reflectate prin parametri versiunați, cu dată de intrare în vigoare. |
| [HG nr. 146/2026](https://legislatie.just.ro/Public/DetaliiDocumentAfis/308231) | De la 1 iulie 2026, salariul minim brut este 4.325 RON/lună, pentru 166,667 ore în medie și 25,949 RON/oră. Această valoare va fi o regulă datată, nu o constantă permanentă. |

## Decizie de proiectare

1. Fluturașul va păstra o captură a parametrilor utilizați la calcul: rate, praguri, deduceri, număr ore de referință și versiunea regulii.
2. Administratorul nu va putea modifica un fluturaș deja finalizat; corecțiile se realizează printr-o versiune/recalculare documentată.
3. Ratele și facilitățile fiscale nu vor fi codificate definitiv. Se vor menține într-un registru de reguli cu perioadă de valabilitate, actualizabil de administrator după validarea contabilității.
4. Documentul va afișa explicit brutul, reținerile, alte adaosuri/rețineri, netul și costul angajatorului, iar la final „Câștig net / Net de plată”.
5. Prima versiune va produce fluturași operaționali individuali; D112, Revisal și ordinele de plată rămân în responsabilitatea fluxului de salarizare/contabilitate verificat de firmă.

## Situații speciale confirmate

| Situație | Tratare în modul |
| --- | --- |
| Concediu medical | Se înregistrează ca linie salarială cu zile, cod, bază, procent și suportator configurabile. Pentru certificatele emise între 1 februarie 2026 și 31 decembrie 2027, regula generală este diminuarea cu o zi; Legea nr. 64/2026 prevede excepții, inclusiv pentru anumite categorii și spitalizare. Pentru a evita presupuneri, profilul de plată păstrează referința legală și validarea contabilă. [OUG nr. 91/2025](https://legislatie.just.ro/Public/DetaliiDocumentAfis/306237) [Legea nr. 64/2026](https://legislatie.just.ro/Public/DetaliiDocument/310545) |
| Facilități speciale | Profilul angajatului include codul facilității și suprascrieri ale ratelor/bazelor. Nicio facilitate nu este aplicată automat numai pe baza funcției sau departamentului; contabilitatea o activează pentru angajat și perioadă. |
| Deducere personală și persoane în întreținere | Se păstrează numărul persoanelor și deducerea efectivă folosită la calcul. Formula de deducere se salvează în versiunea regulii și poate fi actualizată pentru perioade viitoare. |
| Tichete, sporuri și bonusuri | Se introduc ca linii separate, fiecare cu regim configurabil de includere în baze CAS, CASS și impozit. |
| Popriri, avansuri și alte rețineri | Se introduc ca rețineri separate, cu descriere și ordine de prioritate gestionată de contabilitate. Nu se aplică automat reguli de poprire fără documentele necesare. |

## Principiu de conformitate

Modulul va calcula transparent pe baza componentei de venit/reținere și a regulii datate selectate. Un fluturaș finalizat va conține instantaneul regulii, formulele aplicate și un marcaj de verificare contabilă. Nu va fi prezentat ca declarație D112 și nu va depune documente fiscale automat.
