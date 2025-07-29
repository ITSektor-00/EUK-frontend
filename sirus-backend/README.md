# SIRUS Backend

Spring Boot backend aplikacija za EUK platformu.

## EUK Domene

Aplikacija je konfigurisana za rad sa sledećim Vercel domenima:

- **Glavni domen**: https://euk.vercel.app/
- **IT Sektori projekti**: https://euk-it-sectors-projects.vercel.app/

### Konfiguracija za EUK domene

#### CORS (Cross-Origin Resource Sharing)
- Oba domena su dozvoljena u CORS konfiguraciji
- Podržani su svi HTTP metodi (GET, POST, PUT, DELETE, OPTIONS)
- Dozvoljeni su Authorization, Content-Type, X-Requested-With, Accept headeri

#### Rate Limiting
- EUK domene imaju povećan rate limit: **150 zahteva po minuti**
- Standardni limit za ostale domene: **100 zahteva po minuti**
- Rate limit se resetuje svaki minut

#### Security Headers
- Content Security Policy je konfigurisan da dozvoli EUK domene
- Strict Transport Security je omogućen
- X-Frame-Options, X-Content-Type-Options, X-XSS-Protection su aktivni

## Endpoints za EUK domene

### Health Check
```
GET /api/test/health
```

### EUK Status
```
GET /api/test/euk-status
```

### Ping
```
GET /api/test/ping
```

## Deployment

Aplikacija je konfigurisana za deployment na Render.com sa sledećim environment varijablama:

- `SPRING_PROFILES_ACTIVE=prod`
- `EUK_ALLOWED_DOMAINS=https://euk.vercel.app,https://euk-it-sectors-projects.vercel.app`
- `EUK_RATE_LIMIT_ENABLED=true`
- `EUK_RATE_LIMIT_MAX_REQUESTS=150`

## Development

Za lokalni development:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Development profil uključuje:
- Debug logging
- CORS za localhost:3000 i localhost:3001
- Povećan rate limit (1000 zahteva/min)
- Detaljne error poruke

## Production

Za produkciju:

```bash
./mvnw clean package -DskipTests
java -jar target/sirus-backend-0.0.1-SNAPSHOT.jar
```

Produkcija uključuje:
- INFO level logging
- CORS samo za EUK domene
- Rate limiting (150 zahteva/min za EUK domene)
- Sigurnosne header-e
- Health check endpoint-e 