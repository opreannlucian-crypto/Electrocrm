# Control acces pe roluri — ElectroCRM

ElectroCRM include acum trei roluri de utilizator: **administrator**, **manager de vânzări** și **tehnician**. Înregistrarea publică a conturilor este dezactivată; conturile noi se creează exclusiv din pagina **Utilizatori și drepturi**, disponibilă administratorilor.

| Rol | Acces |
|---|---|
| **Administrator** | Acces complet la modulele de business și la administrarea conturilor, rolurilor și modulelor permise. |
| **Manager de vânzări** | Acces complet la modulele de business. Nu poate crea, modifica sau șterge conturi și drepturi. |
| **Tehnician** | Doar modulele activate de administrator: dashboard propriu, lucrări proprii, calendar propriu, pontaj propriu și creare client nou. |

## Configurarea unui cont

Administratorul intră în meniul **Utilizatori și drepturi**, creează sau editează un cont, selectează rolul și, pentru tehnicieni, asociază obligatoriu angajatul corespunzător. Pentru un tehnician, administratorul selectează modulele care trebuie să apară în cont.

> Un tehnician trebuie asociat cu un angajat. Fără această asociere, accesul la lucrări, calendar și pontaj este blocat deliberat.

## Comportamentul tehnicianului

Tehnicianul vede numai lucrările unde este tehnician principal sau este inclus în lista de tehnicieni alocați. Aceeași regulă se aplică pentru calendar, detaliile lucrării, fotografii și pontajul pe lucrare. Tehnicianul poate crea o lucrare nouă și poate adăuga un client nou din acel flux; lucrarea este alocată automat tehnicianului curent, iar materialele din stoc nu pot fi modificate din acest flux.

## Instalare după actualizare

În mediul în care rulează aplicația, instalează actualizarea și rulează migrațiile:

```bash
composer install
npm ci
php artisan migrate --force
npm run build
```

Migrarea `2026_08_25_090000_add_access_control_to_users_table.php` adaugă rolul și modulele permise. Pentru instalațiile existente, primul cont creat devine automat **administrator** după rularea acestei migrări; verifică apoi rolurile tuturor conturilor din pagina de administrare.

## Verificări efectuate

Versiunea a fost verificată prin migrarea completă într-o bază SQLite temporară, validarea sintaxei PHP, înregistrarea rutelor, compilarea interfeței React și testele unitare ale regulilor de rol.
