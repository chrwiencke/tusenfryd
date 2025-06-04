# Implementasjonsrapport

## 1. Feilsøkingsstrategier og refleksjoner
- **Logging**: Console.log i controller-metoder og etter `await`-kall for å verifisere at data flyter som forventet.
- **Feilhåndtering**: Bruk av `try/catch` rundt asynkrone operasjoner, `validationResult` fra Express-validator for å fange valideringsfeil.
- **Databasetesting**: Manuell testing av Mongoose-forespørsler med `ParkSetting.getSetting` og `findOneAndUpdate` for å sikre korrekt lagring og henting.
- **Visningssjekk**: Render EJS-malene med dummy-data lokalt for å verifisere at grensesnittene oppdateres dynamisk.
- **Iterativ utvikling**: Implementasjon i små steg, verifisering av hver endring før neste, for å unngå regresjoner.

## 2. Funksjonelle krav og løsninger
1. **Administrativ redigering av åpningstider**
   - Lagring i MongoDB via `ParkSetting`-modellen (`key`=openTime/closeTime/operatingDays/specialHours).
   - Admin-UI i `/admin/settings` med HTML-form for tidspunkter og dager.
2. **Dynamisk visning på frontend**
   - Ny rute `/hours` som henter `ParkSetting`-verdier og renderer `views/visitor/hours.ejs`.
   - Inkludering av åpningstider i hjem-siden (`getHomepage`) slik at dagens tider vises.
3. **Responsivt og brukervennlig design**
   - Bruk av TailwindCSS og EJS-komponenter for konsistent utseende.
   - Grid-layout for mobil og desktop.

## 3. Versjonskontrollprosess
- **Utvikling**: 
  ```bash
  git add .
  git commit -m "Implement dynamic opening hours"
  git push origin main
  ```
- **Deploy** (på server eller VM):
  ```bash
  git pull origin main
  sudo docker compose up --build -d
  ```

## 4. Docker-dokumentasjon
1. **Dockerfile**
   - Basert på Node.js Alpine-image.
   - Kopierer kildekode, installerer dependencies, og starter app med `npm start`.
2. **docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - MONGO_URI=mongodb://mongo:27017/tusenfryd
         - JWT_SECRET=${JWT_SECRET}
       depends_on:
         - mongo
     mongo:
       image: mongo:5.0
       volumes:
         - mongo-data:/data/db
   volumes:
     mongo-data:
   ```
3. **Start og stopp**
   - Kjøre i bakgrunn: `sudo docker compose up --build -d`
   - Se logger: `sudo docker compose logs -f`
   - Stoppe: `sudo docker compose down`

---