# Tusenfryd Fornøyelsespark - Webapplikasjon

En moderne webapplikasjon for Tusenfryd fornøyelsespark som gir publikum oversikt over attraksjoner, sanntidsventetider og køreservasjoner, samtidig som administratorer kan administrere innhold, brukere og innstillinger via et sikkert admin-panel.

## 🚀 Funksjoner

### For besøkende
- Hjemmeside med parkoversikt og generell informasjon
- Attraksjonsliste med sanntidsventetider og filtreringsmuligheter
- Detaljside for hver attraksjon med beskrivelse, bilder og reservasjonsmuligheter
- Køreservasjon og visning av reservasjonsstatus
- Søk etter reservasjon ved bruk av bekreftelses-ID
- Mobilvennlig og responsivt design (Bootstrap 5)

### Admin-panel
- Sikker innlogging med JWT og passordhash via bcryptjs
- Dashboard med nøkkelstatistikk og rask tilgang til funksjoner
- Full CRUD (Create, Read, Update, Delete) for attraksjoner
- Administrasjon av besøkendes reservasjoner
- Konfigurasjon av parkinnstillinger (åpningstider, varslinger, kapasitetsgrenser)
- Bildeopplasting for attraksjoner med multer
- Sanntidsoppdateringer via AJAX

## 🛠️ Teknisk stack

- Backend: Node.js (v16+) og Express.js
- Database: MongoDB med Mongoose ODM
- Templating: EJS (Embedded JavaScript)
- Autentisering: JWT (jsonwebtoken) og bcryptjs
- Validering: express-validator
- Filopplasting: multer
- Middleware: cookie-parser, method-override
- Utvikling: nodemon for automatisk omstart

## ⚙️ Forutsetninger

- Node.js v16 eller nyere
- MongoDB v4.4 eller nyere (lokal installasjon eller Atlas)
- npm (eller yarn)

## 📦 Installasjon og oppsett

1. Klon prosjektet:
   ```bash
   git clone <repository-url>
   cd tusenfryd
   ```

2. Installer avhengigheter:
   ```bash
   npm install
   ```

3. Opprett miljøvariabler:
   ```bash
   cp .env.example .env
   ```
   Rediger `.env` med egne verdier:
   ```env
   MONGODB_URI=mongodb://localhost:27017/tusenfryd
   PORT=3000
   JWT_SECRET=superhemmelig-nøkkel
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   DEFAULT_OPEN_TIME=09:00
   DEFAULT_CLOSE_TIME=18:00
   ```

4. (Valgfritt) Seed databasen med eksempeldata:
   ```bash
   npm run seed:dev
   ```

## ▶️ Kjøre applikasjonen

- Utvikling (med automatisk omstart):
  ```bash
  npm run dev
  ```

- Produksjon:
  ```bash
  npm start
  ```

Åpne i nettleseren:
- Besøkendes grensesnitt: http://localhost:3000
- Admin-panel: http://localhost:3000/admin

## 📁 Prosjektstruktur

```
tusenfryd/
├── controllers/       # Forretningslogikk og request-handlere
├── models/            # Mongoose-skjemaer og modeller
├── routes/            # Express-ruter (visitor, admin, API)
├── views/             # EJS-mal-filer (public og admin)
├── public/            # Statiske filer (CSS, JS, bilder, uploads)
├── middleware/        # Egendefinerte middleware (auth, error, validation, upload)
├── scripts/           # Database-skript (clean, seed)
├── server.js          # Applikasjonsoppsett og server
├── package.json       # Avhengigheter og NPM-skript
└── .env.example       # Mal for miljøvariabler
```

## 📜 Tilgjengelige NPM-skript

- `npm start`       : Start serveren i produksjonsmodus
- `npm run dev`     : Start server i utviklingsmodus (nodemon)
- `npm run seed`    : Seed databasen med standarddata
- `npm run seed:dev`: Seed for utviklingsmiljø
- `npm run clean`   : Tøm databasen
- `npm run setup`   : Installer avhengigheter og seed:dev

## 📝 Lisens

Dette prosjektet er lisensiert under MIT-lisensen.
