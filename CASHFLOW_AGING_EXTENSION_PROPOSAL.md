# Propunere de extindere financiară: cash-flow, top clienți și vechimea restanțelor

## 1. Principiu: trei perspective distincte

Raportul actual de facturi trebuie păstrat ca raport de **facturare și poziție a creanțelor**. El selectează facturile după `issue_date` și afișează inclusiv valoarea deja plătită a documentelor respective. Această perspectivă răspunde la întrebarea: „Ce am facturat în perioada aleasă și ce sold mai are acea facturare?”

Modulul nou va fi separat, la ruta recomandată **`/financial-reports/cash-flow`**, cu denumirea „Cash-flow încasări”. El va selecta înregistrările din `invoice_payments` după `paid_at`, nu facturile după `issue_date`. Astfel răspunde corect la întrebarea: „Ce bani au intrat efectiv în intervalul ales?”

> În forma inițială, acesta va fi un **cash-flow de încasări de la clienți**, nu un flux complet de trezorerie al firmei. Un cash-flow complet va necesita ulterior și cheltuieli, salarii, taxe, plăți către furnizori sau import bancar.

| Perspectivă | Unitatea analizată | Câmpul temporal | Întrebarea operațională |
| --- | --- | --- | --- |
| Raport facturi | Factura | `issue_date` | Ce s-a facturat și ce sold a rămas? |
| Cash-flow încasări | Plata facturii | `paid_at` | Ce s-a încasat efectiv în interval? |
| Vechimea creanțelor | Soldul facturii la o dată de referință | `due_date` și plăți până la data de referință | Ce restanțe există și cât de vechi sunt? |

## 2. Modul nou: Cash-flow încasări

Datele necesare există deja în `invoice_payments`: `invoice_id`, `amount`, `paid_at`, `method`, `reference` și `notes`. Pentru raport, fiecare plată va fi legată de factura și clientul aferent, iar intervalul va fi aplicat exclusiv pe `paid_at`.

### Indicatori recomandați

| Indicator | Formula | Utilitate |
| --- | --- | --- |
| Încasat în perioadă | `SUM(invoice_payments.amount)` pentru `paid_at` în interval | Arată intrările reale de la clienți. |
| Număr de plăți | Numărul liniilor de plată | Arată frecvența încasărilor. |
| Facturi acoperite | Numărul facturilor distincte cu plată în interval | Distinge multe plăți parțiale de multe facturi. |
| Încasare medie | `încasat / număr plăți` | Semnal simplu privind mărimea încasărilor. |
| Încasat pe metodă | Grupare după `method` | Separă transferul, numerarul, cardul sau alte metode definite în aplicație. |
| Încasat pe client | Grupare după clientul facturii | Evidențiază sursa principală a lichidității. |
| Evoluție zilnică / săptămânală / lunară | Grupare după `paid_at` | Arată ritmul real de intrare a banilor. |

Pagina va conține filtre pentru intervalul de plată, client, metodă de plată și monedă. Implicit, intervalul va fi luna curentă, iar moneda va fi RON. Dacă aplicația va utiliza mai multe monede, valorile se vor afișa separat pe monedă; nu se vor aduna valori în monede diferite fără o regulă explicită de curs valutar.

Tabelul detaliat va conține: data plății, client, factura, număr document, metodă, referință, sumă, utilizatorul care a înregistrat plata și eventuale observații. Exporturile Excel și PDF vor folosi aceleași filtre aplicate pe ecran.

### Reguli de corectitudine

Plățile nu trebuie filtrate după data emiterii facturii. De exemplu, o factură emisă în iulie și achitată în august trebuie să apară în cash-flow-ul din august, nu în cel din iulie. Pentru corecții, o plată deja înregistrată nu ar trebui modificată discret; este recomandată o operațiune de anulare sau o linie compensatoare auditată. Dacă se vor înregistra restituiri, modelul trebuie extins cu o direcție a tranzacției, de exemplu `receipt` și `refund`, pentru a permite flux net corect.

Sistemul va marca separat excepțiile: plăți fără dată, plăți care depășesc totalul facturii, plăți asociate facturilor anulate și diferențe între totalul plăților și `invoices.paid_amount`. Acestea sunt controale de calitate a datelor, nu tranzacții care trebuie ignorate automat.

## 3. Top clienți detaliat

Topul actual este util, însă îl putem transforma într-un bloc analitic cu trei moduri de clasare, fiecare având un sens precis.

| Mod de clasare | Perioadă și formulă | Ce arată |
| --- | --- | --- |
| După facturare | Facturi cu `issue_date` în interval; `SUM(total)` | Clienții cu cel mai mare volum facturat. |
| După încasări | Plăți cu `paid_at` în interval; `SUM(amount)` | Clienții care au adus lichiditate efectivă. |
| După risc de credit | Sold restant la data de referință; `SUM(balance_as_of)` | Clienții cu expunerea restantă cea mai ridicată. |

Pentru fiecare client, tabelul recomandat va arăta facturat, încasat, sold total, sold restant, numărul de facturi cu sold, cea mai veche scadență neplătită, numărul maxim de zile de întârziere și ponderea în totalul restanțelor. Un clic pe client va aplica automat filtrul de client în lista facturilor sau a plăților.

Clasarea implicită pentru raportul de creanțe va fi după **sold restant descrescător**, deoarece aceasta ajută direct la prioritizarea apelurilor și notificărilor. În raportul de cash-flow, clasarea implicită va fi după **încasat în interval descrescător**.

## 4. Distribuția restanțelor pe vechime

Analiza de vechime trebuie calculată ca fotografie la o **dată de referință** (`as_of_date`), implicit ziua curentă, nu doar după filtrul intervalului de emitere. Pentru o factură emisă anterior, soldul la data de referință este:

```text
sold_la_data = max(0, total_factură − SUM(plăți cu paid_at ≤ as_of_date))
```

O factură intră în distribuția restanțelor numai dacă este emisă sau parțial plătită, are `sold_la_data > 0`, are termen de plată și `due_date < as_of_date`. Zilele de întârziere se calculează astfel:

```text
zile_întârziere = diferența în zile dintre as_of_date și due_date
```

| Bandă de vechime | Condiție | Tratament în ecran |
| --- | --- | --- |
| Neajunsă la scadență | `due_date ≥ as_of_date` și sold pozitiv | Se afișează separat ca „De încasat, ne-scadentă”; nu este restantă. |
| Fără scadență | `due_date` lipsă și sold pozitiv | Se afișează separat pentru corectarea datelor. |
| 1–30 zile | `1 ≤ zile_întârziere ≤ 30` | Restanță recentă. |
| 31–60 zile | `31 ≤ zile_întârziere ≤ 60` | Restanță în urmărire activă. |
| 61–90 zile | `61 ≤ zile_întârziere ≤ 90` | Restanță cu risc ridicat. |
| Peste 90 zile | `zile_întârziere > 90` | Restanță critică. |

Pagina va include un card pentru fiecare bandă, cu valoare, număr de facturi și procent din totalul restant. Dedesubt, un tabel detaliat va cuprinde clientul, factura, data emiterii, scadența, soldul la data de referință, zilele de întârziere, banda de vechime și o acțiune de deschidere a facturii. Blocul „Top clienți cu risc” va grupa aceleași date pe client.

Este important ca un raport pentru o dată istorică să nu folosească `invoices.paid_amount` curent, deoarece acesta poate conține plăți înregistrate după data analizată. Pentru analiză istorică exactă, soldul se va reconstrui din liniile `invoice_payments` cu `paid_at` până la data de referință.

## 5. Implementare recomandată

| Etapă | Livrabil | Observații |
| --- | --- | --- |
| 1. Integritate și performanță | Indexuri pe `invoice_payments.paid_at` și `(invoice_id, paid_at)`; validări de plată | Nu schimbă facturile existente. |
| 2. Serviciu de raportare | `CashFlowReport` separat și extinderea serviciului de creanțe cu calcul `as_of_date` | Reutilizează relația plată–factură–client. |
| 3. Interfață | Pagina „Cash-flow încasări”, tab sau bloc „Vechimea creanțelor” în Raport facturi | Păstrează raportul actual ușor de citit. |
| 4. Exporturi | Excel și PDF pentru cash-flow și distribuția pe vechime | Exportul preia exact filtrele curente. |
| 5. Control și teste | Acces administrator/manager vânzări, cazuri de plăți parțiale, plăți întârziate și raport istoric | Tehnicienii rămân fără acces financiar. |

Pentru implementarea inițială recomand păstrarea unei pagini separate pentru cash-flow și adăugarea unui panou „Vechimea creanțelor” în Raport facturi. Într-o etapă ulterioară putem adăuga prognoza încasărilor pe 7, 30 și 60 de zile, plecând de la soldurile neplătite și datele de scadență; aceasta trebuie etichetată clar drept estimare, nu încasare realizată.

## 6. Bază, timp și limite

**Baza de calcul** va fi istoricul plăților înregistrate în `invoice_payments`; raportul curent de facturi rămâne bazat pe facturi și data emiterii. **Timpul** este determinat de `paid_at` pentru cash-flow și de `as_of_date` pentru vechimea creanțelor, implicit data curentă. **Presupunerea inițială** este că fiecare plată are o valoare pozitivă și este asociată unei facturi; restituirile sau corecțiile vor necesita o direcție a tranzacției ori linii compensatoare. **Sursa** este baza operațională ElectroCRM, iar exactitatea depinde de înregistrarea completă și corect datată a plăților. Aceste rapoarte sunt operaționale; utilizarea lor pentru raportări contabile sau fiscale oficiale trebuie validată de contabilitate.
