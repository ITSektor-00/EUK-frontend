# 🚀 EUK Backend - Kompletna Dokumentacija

## 📋 Sadržaj
- [Pregled Projekta](#pregled-projekta)
- [Arhitektura i Tehnologije](#arhitektura-i-tehnologije)
- [Svi API Endpoint-i](#svi-api-endpoint-i)
- [Sigurnosna Konfiguracija](#sigurnosna-konfiguracija)
- [Database Arhitektura](#database-arhitektura)
- [Business Logic](#business-logic)
- [Deployment i Infrastruktura](#deployment-i-infrastruktura)
- [Performance i Monitoring](#performance-i-monitoring)
- [Sigurnosne Mere](#sigurnosne-mere)
- [Ključne Karakteristike](#ključne-karakteristike)
- [Future Roadmap](#future-roadmap)

---

## 🎯 Pregled Projekta

**EUK Backend** je Spring Boot aplikacija dizajnirana za EUK platformu. Aplikacija pruža RESTful API-je za upravljanje predmetima, kategorijama, ugroženim licima i korisnicima sistema.

### 🌐 EUK Domeni
- **Glavni domen**: https://euk.vercel.app/
- **IT Sektori projekti**: https://euk-it-sectors-projects.vercel.app/

---

## 🏗️ Arhitektura i Tehnologije

### Core Framework
- **Spring Boot 3.5.3** - Moderna Java aplikacija
- **Java 17** - Najnovija LTS verzija
- **Spring Security** - Sigurnosna infrastruktura
- **Spring Data JPA** - Database abstrakcija
- **PostgreSQL** - Relaciona baza podataka

### Security Stack
- **JWT (JSON Web Tokens)** - Stateless autentifikacija
- **BCrypt** - Hashiranje lozinki
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Zaštita od DDoS napada
- **Security Headers** - Dodatna sigurnosna zaštita

---

## 🔌 Svi API Endpoint-i

### 1. **AUTHENTICATION API** (`/api/auth`)
**Base URL:** `http://localhost:8080/api/auth`

| Metoda | Endpoint | Opis | Parametri | Autentifikacija |
|--------|----------|------|-----------|-----------------|
| `POST` | `/signup` | Registracija novog korisnika | `SignUpRequest` | ❌ |
| `POST` | `/signin` | Prijava korisnika | `SignInRequest` | ❌ |
| `GET` | `/me` | Dohvatanje trenutnog korisnika | `Authorization` header | ✅ |
| `GET` | `/test` | Test API-ja | - | ❌ |
| `GET` | `/check-username` | Provera dostupnosti username-a | `username` query | ❌ |
| `PUT` | `/profile` | Ažuriranje profila | `UpdateProfileRequest` + `Authorization` | ✅ |

### 2. **EUK KATEGORIJE API** (`/api/euk/kategorije`)
**Base URL:** `http://localhost:8080/api/euk/kategorije`

| Metoda | Endpoint | Opis | Parametri | Autentifikacija |
|--------|----------|------|-----------|-----------------|
| `GET` | `/` | Dohvatanje svih kategorija | - | ❌ |
| `GET` | `/{id}` | Dohvatanje kategorije po ID-u | `id` path | ❌ |
| `POST` | `/` | Kreiranje nove kategorije | `EukKategorijaDto` | ❌ |
| `PUT` | `/{id}` | Ažuriranje kategorije | `id` path + `EukKategorijaDto` | ❌ |
| `DELETE` | `/{id}` | Brisanje kategorije | `id` path | ❌ |

### 3. **EUK PREDMETI API** (`/api/euk/predmeti`)
**Base URL:** `http://localhost:8080/api/euk/predmeti`

| Metoda | Endpoint | Opis | Parametri | Autentifikacija |
|--------|----------|------|-----------|-----------------|
| `GET` | `/` | Dohvatanje svih predmeta (sa paginacijom i filterima) | `page`, `size`, `status`, `prioritet`, `kategorijaId`, `odgovornaOsoba` | ❌ |
| `GET` | `/{id}` | Dohvatanje predmeta po ID-u | `id` path | ❌ |
| `POST` | `/` | Kreiranje novog predmeta | `EukPredmetDto` | ❌ |
| `PUT` | `/{id}` | Ažuriranje predmeta | `id` path + `EukPredmetDto` | ❌ |
| `DELETE` | `/{id}` | Brisanje predmeta | `id` path | ❌ |
| `GET` | `/{id}/ugrozena-lica` | Dohvatanje ugroženih lica za predmet | `id` path | ❌ |

### 4. **EUK UGROŽENA LICA API** (`/api/euk/ugrozena-lica`)
**Base URL:** `http://localhost:8080/api/euk/ugrozena-lica`

| Metoda | Endpoint | Opis | Parametri | Autentifikacija |
|--------|----------|------|-----------|-----------------|
| `GET` | `/` | Dohvatanje svih ugroženih lica (sa paginacijom) | `page`, `size` | ❌ |
| `GET` | `/{id}` | Dohvatanje ugroženog lica po ID-u | `id` path | ❌ |
| `POST` | `/` | Kreiranje novog ugroženog lica | `EukUgrozenoLiceDto` | ❌ |
| `PUT` | `/{id}` | Ažuriranje ugroženog lica | `id` path + `EukUgrozenoLiceDto` | ❌ |
| `DELETE` | `/{id}` | Brisanje ugroženog lica | `id` path | ❌ |
| `GET` | `/search/{jmbg}` | Pretraga ugroženog lica po JMBG-u | `jmbg` path | ❌ |

### 5. **TEST API** (`/api/test`)
**Base URL:** `http://localhost:8080/api/test`

| Metoda | Endpoint | Opis | Parametri | Autentifikacija |
|--------|----------|------|-----------|-----------------|
| `GET` | `/health` | Health check endpoint | - | ❌ |
| `GET` | `/euk-status` | Status EUK domena | - | ❌ |
| `GET` | `/ping` | Ping endpoint | - | ❌ |
| `GET` | `/hello` | Hello message | - | ❌ |
| `GET` | `/status` | Status poruka | - | ❌ |
| `POST` | `/echo` | Echo endpoint | `message` body | ❌ |
| `GET` | `/cors-test` | CORS test | `Origin` header | ❌ |
| `POST` | `/fetch-test` | Fetch test | JSON body | ❌ |
| `GET` | `/username-test` | Username test | `username` query | ❌ |
| `POST` | `/registration-test` | Registration test | JSON body | ❌ |
| `GET` | `/check-username-test` | Username availability test | `username` query | ❌ |

### 6. **SPRING BOOT ACTUATOR ENDPOINTS**
**Base URL:** `http://localhost:8080/actuator`

| Endpoint | Opis | Detalji |
|----------|------|---------|
| `/health` | Health check | Prikazuje status aplikacije |
| `/info` | Informacije o aplikaciji | Osnovne informacije |

---

## 🔐 Sigurnosna Konfiguracija

### Development vs Production
```java
// Development - sve dozvoljeno
.requestMatchers("/**").permitAll()

// Production - selektivna dozvola
.requestMatchers("/api/auth/**", "/actuator/health").permitAll()
.requestMatchers("/api/euk/**").permitAll()
.anyRequest().authenticated()
```

### JWT Token Management
- **Secret Key:** Konfigurisan preko environment varijable
- **Expiration:** 24 sata (86400000ms)
- **Claims:** username, userId, role
- **Algorithm:** HS256 (HMAC SHA-256)

### Rate Limiting
- **EUK domene:** 150 zahteva/min
- **Ostali:** 100 zahteva/min
- **Reset interval:** 1 minuta
- **Per IP + URI tracking**

---

## 🗄️ Database Arhitektura

### Entity Relationships
```
User (1) ←→ (N) EukPredmet
EukKategorija (1) ←→ (N) EukPredmet  
EukPredmet (1) ←→ (N) EukUgrozenoLice
```

### Key Entities

#### **EukPredmet (Predmet):**
- **Status:** АКТИВАН, ЗАТВОРЕН, НА_ЧЕКАЊУ, У_ОБРАДИ
- **Prioritet:** НИЗАК, СРЕДЊИ, ВИСОК, КРИТИЧАН
- **Fields:** datumKreiranja, nazivPredmeta, odgovornaOsoba, rokZaZavrsetak
- **Relationships:** kategorija, ugrozenaLica

#### **EukKategorija (Kategorija):**
- **Fields:** naziv, opis
- **Usage:** Kategorizacija predmeta

#### **EukUgrozenoLice (Ugroženo lice):**
- **Fields:** ime, prezime, jmbg, datumRodjenja, adresa
- **Relationships:** predmet

---

## 🌐 CORS i Domene

### Allowed Origins
- **Production:** `https://euk.vercel.app`, `https://euk-it-sectors-projects.vercel.app`
- **Development:** `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`

### CORS Headers
```java
Access-Control-Allow-Origin: [specific domain]
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

---

## 💼 Business Logic

### EUK Predmet Management
- **Paginacija** - 10 predmeta po stranici
- **Filtering** - po statusu, prioritetu, kategoriji, odgovornoj osobi
- **Search** - pretraga ugroženih lica po JMBG-u
- **CRUD operations** - Create, Read, Update, Delete

### User Management
- **Registration** - sa validacijom svih polja
- **Authentication** - JWT-based login
- **Profile updates** - ažuriranje korisničkih podataka
- **Username availability** - provera dostupnosti

---

## 🚀 Deployment i Infrastruktura

### Docker Support
- **Multi-stage build** - Maven build + JRE runtime
- **Health checks** - automatska provera stanja
- **Environment variables** - konfiguracija preko env vars

### Environment Profiles
```bash
# Development
SPRING_PROFILES_ACTIVE=dev

# Production  
SPRING_PROFILES_ACTIVE=prod
EUK_ALLOWED_DOMAINS=https://euk.vercel.app,https://euk-it-sectors-projects.vercel.app
EUK_RATE_LIMIT_ENABLED=true
```

### Database Configuration
- **PostgreSQL** sa optimizovanim connection pool-om
- **HikariCP** - connection pooling
- **Schema validation** - `spring.jpa.hibernate.ddl-auto=validate`

---

## 📈 Performance i Monitoring

### Actuator Endpoints
- `/actuator/health` - Health check
- `/actuator/info` - Application info

### Logging
- **Level:** INFO za production, DEBUG za development
- **Structured logging** sa SLF4J + Logback
- **Request tracking** sa unique identifiers

### Connection Pool
- **Max connections:** 1 (optimizovano za Render.com)
- **Connection timeout:** 30s
- **Idle timeout:** 30s
- **Max lifetime:** 60s

---

## 🛡️ Sigurnosne Mere

### Security Headers
- **Content Security Policy** - XSS zaštita
- **Strict Transport Security** - HTTPS enforcement
- **X-Frame-Options** - Clickjacking zaštita
- **X-Content-Type-Options** - MIME sniffing zaštita

### Input Validation
- **Bean Validation** - `@Valid` annotations
- **Custom validators** - business logic validation
- **SQL injection protection** - prepared statements disabled

---

## 🎯 Ključne Karakteristike

1. **Modern Java Stack** - Spring Boot 3.5.3 + Java 17
2. **Production Ready** - Docker, health checks, monitoring
3. **Security First** - JWT, CORS, rate limiting, security headers
4. **EUK Optimized** - Posebna konfiguracija za EUK domene
5. **Scalable Architecture** - Clean separation of concerns
6. **Database Agnostic** - JPA abstrakcija
7. **Environment Aware** - Dev/Prod profile switching
8. **Performance Optimized** - Connection pooling, caching

---

## 🔮 Future Roadmap

### Potential Enhancements
- **Redis caching** - za bolje performanse
- **API documentation** - Swagger/OpenAPI
- **Metrics collection** - Prometheus + Grafana
- **Audit logging** - user action tracking
- **File upload** - dokumenti za predmete
- **Email notifications** - status updates
- **Mobile API** - RESTful endpoints za mobile apps

---

## 📊 Statistike

- **Ukupno API endpoint-a:** 35+
- **Controllers:** 5
- **Protected endpoints:** 2 (auth required)
- **Public endpoints:** 33+
- **HTTP Methods:** GET, POST, PUT, DELETE
- **Data Transfer Objects (DTOs):** 10+

---

## 🚀 Quick Start

### Lokalno Pokretanje
```bash
# Clone repository
git clone [repository-url]
cd euk-backend

# Pokretanje sa Maven
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Ili sa Docker
docker build -t euk-backend .
docker run -p 8080:8080 euk-backend
```

### Environment Variables
```bash
# Development
SPRING_PROFILES_ACTIVE=dev
DATABASE_URL=jdbc:postgresql://localhost:5432/euk_db
DATABASE_USERNAME=euk_user
DATABASE_PASSWORD=euk_password

# Production
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=your-secret-key
EUK_ALLOWED_DOMAINS=https://euk.vercel.app,https://euk-it-sectors-projects.vercel.app
```

---

## 📞 Support

Za dodatne informacije ili podršku:
- **Repository:** [GitHub Link]
- **Documentation:** [Link ka dokumentaciji]
- **Issues:** [GitHub Issues]

---

*Dokumentacija generisana za EUK Backend v1.0.0* 🎉
