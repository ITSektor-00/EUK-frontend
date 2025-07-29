# EUK Domene Setup

Ovaj dokument opisuje konfiguraciju SIRUS backend-a za rad sa EUK Vercel domenima.

## Konfigurisani domeni

- **Glavni domen**: https://euk.vercel.app/
- **IT Sektori projekti**: https://euk-it-sectors-projects.vercel.app/

## Implementirane funkcionalnosti

### 1. CORS Konfiguracija

Oba domena su dozvoljena u CORS konfiguraciji:

```java
configuration.setAllowedOrigins(List.of(
    "https://euk.vercel.app",
    "https://euk-it-sectors-projects.vercel.app"
));
```

### 2. Rate Limiting

Posebna pravila za EUK domene:
- **EUK domene**: 150 zahteva po minuti
- **Ostali domeni**: 100 zahteva po minuti

### 3. Security Headers

Content Security Policy je konfigurisan da dozvoli EUK domene:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://euk.vercel.app https://euk-it-sectors-projects.vercel.app; style-src 'self' 'unsafe-inline' https://euk.vercel.app https://euk-it-sectors-projects.vercel.app; connect-src 'self' https://euk.vercel.app https://euk-it-sectors-projects.vercel.app;
```

### 4. Monitoring Endpoints

Dodati su posebni endpoint-i za monitoring EUK domena:

- `GET /api/test/health` - Osnovni health check
- `GET /api/test/euk-status` - Status EUK konfiguracije
- `GET /api/test/ping` - Ping endpoint

## Environment Varijable

### Production

```bash
SPRING_PROFILES_ACTIVE=prod
EUK_ALLOWED_DOMAINS=https://euk.vercel.app,https://euk-it-sectors-projects.vercel.app
EUK_RATE_LIMIT_ENABLED=true
EUK_RATE_LIMIT_MAX_REQUESTS=150
```

### Development

```bash
SPRING_PROFILES_ACTIVE=dev
EUK_ALLOWED_DOMAINS=https://euk.vercel.app,https://euk-it-sectors-projects.vercel.app,http://localhost:3000,http://localhost:3001
EUK_RATE_LIMIT_ENABLED=false
EUK_RATE_LIMIT_MAX_REQUESTS=1000
```

## Deployment

### Render.com

Aplikacija je konfigurisana za deployment na Render.com sa svim potrebnim environment varijablama.

### Docker

```bash
# Build
docker build -t sirus-backend:euk .

# Run
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e EUK_ALLOWED_DOMAINS=https://euk.vercel.app,https://euk-it-sectors-projects.vercel.app \
  -e EUK_RATE_LIMIT_ENABLED=true \
  -e EUK_RATE_LIMIT_MAX_REQUESTS=150 \
  sirus-backend:euk
```

### Docker Compose

```bash
docker-compose up -d
```

## Testiranje

### 1. Health Check

```bash
curl https://your-backend-url.com/api/test/health
```

Očekivani odgovor:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00",
  "service": "SIRUS Backend",
  "version": "1.0.0"
}
```

### 2. EUK Status

```bash
curl https://your-backend-url.com/api/test/euk-status
```

Očekivani odgovor:
```json
{
  "status": "EUK Domains Configured",
  "timestamp": "2024-01-01T12:00:00",
  "allowedDomains": [
    "https://euk.vercel.app",
    "https://euk-it-sectors-projects.vercel.app"
  ],
  "corsEnabled": true,
  "rateLimitEnabled": true,
  "maxRequestsPerMinute": 150
}
```

### 3. CORS Test

```bash
curl -H "Origin: https://euk.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend-url.com/api/auth/signin
```

## Troubleshooting

### 1. CORS Greške

Ako imate CORS greške:
- Proverite da li je domen u `EUK_ALLOWED_DOMAINS`
- Proverite da li je `SPRING_PROFILES_ACTIVE=prod`
- Proverite da li je CORS filter aktivan

### 2. Rate Limiting

Ako imate rate limiting greške:
- EUK domene imaju 150 zahteva/min
- Ostali domeni imaju 100 zahteva/min
- Rate limit se resetuje svaki minut

### 3. Security Headers

Ako imate probleme sa security header-ima:
- Proverite Content Security Policy
- Proverite da li su EUK domene dozvoljene u CSP

## Monitoring

### Logs

Aplikacija loguje sve zahteve sa EUK domena:

```bash
# Proverite logove
docker logs sirus-backend

# Ili direktno
tail -f logs/application.log
```

### Metrics

Dostupni su sledeći endpoint-i za monitoring:
- `/actuator/health` - Health check
- `/api/test/health` - EUK health check
- `/api/test/euk-status` - EUK status

## Backup i Restore

### Database

```bash
# Backup
pg_dump $DATABASE_URL > euk_backup.sql

# Restore
psql $DATABASE_URL < euk_backup.sql
```

### Configuration

```bash
# Backup konfiguracije
cp application-prod.properties application-prod.properties.backup

# Restore konfiguracije
cp application-prod.properties.backup application-prod.properties
``` 