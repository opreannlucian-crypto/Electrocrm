# Sistem intern de notificări — punere în funcțiune

## Scopul etapei implementate

Această etapă activează **notificările interne în ElectroCRM**. Sistemul creează un istoric auditabil pentru evenimentele lucrărilor și facturilor, afișează un badge cu notificări necitite, permite marcarea lor ca citite și oferă administratorului reguli configurabile pentru destinatari. Canalele e-mail, SMS și WhatsApp nu transmit mesaje în această etapă.

| Componentă | Rol |
|---|---|
| `notification_events` | Registru auditabil al schimbărilor operaționale. |
| `notification_deliveries` | Destinatari, mesaje, statusuri, citire și eventuale erori. |
| `notification_rules` | Reguli administrator pentru administratori și tehnicieni. |
| `notification_templates` | Extensie pregătită pentru mesaje pe canale viitoare. |
| `notification_preferences` | Extensie pregătită pentru preferințe și consimțământ. |

## Evenimente interne active

| Domeniu | Evenimente |
|---|---|
| Lucrări | creare, alocare tehnician, programare, reprogramare, modificare oră, schimbare echipă, pornire, finalizare și anulare. |
| Reminder | scanare pentru lucrările programate aproximativ peste 24 de ore. |
| Facturi | emitere explicită sau emitere automată la prima plată a unei ciorne. |

## Instalare

După livrarea codului, se rulează migrațiile și se creează regulile implicite:

```bash
php artisan migrate --force
php artisan db:seed --class=NotificationRuleSeeder --force
```

## Rulare automată în producție

Evenimentele interne din lucrări și facturi sunt înregistrate imediat. Pentru **reminderul de 24 de ore**, aplicația trebuie să aibă atât un scheduler, cât și un worker pentru coada `notifications`.

```bash
php artisan schedule:work
php artisan queue:work database --queue=notifications,default --tries=3
```

Alternativ, schedulerul poate fi pornit de cron o dată pe minut:

```cron
* * * * * cd /cale/catre/ElectroCRM_Corrected && php artisan schedule:run >> /dev/null 2>&1
```

> În instanța demonstrativă, centrul de notificări poate fi testat imediat. Reminderul programat devine automat doar pe un mediu de producție unde schedulerul și workerul de coadă rulează persistent.

## Administrare

Administratorul găsește în meniul lateral **Setări notificări**. Aici poate activa sau dezactiva notificările în aplicație pentru administratori și tehnicienii alocați. Pagina **Istoric notificări** arată livrările și statusurile lor.

## Extindere ulterioară

Pentru e-mail, SMS sau WhatsApp se implementează adaptoare de canal în workerul de coadă. Credențialele furnizorului se păstrează exclusiv în variabile de mediu; nu se introduc în aplicația React și nu se salvează în baza de date.
