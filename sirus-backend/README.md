# SIRUS Backend - Spring Boot Application

Spring Boot backend aplikacija sa JWT autentifikacijom i PostgreSQL database.

## 🚀 Quick Start - PostgreSQL Deployment

### Preduslovi
- Docker Desktop instaliran i pokrenut
- PostgreSQL database (Supabase ili lokalni)
- Java 17 ili noviji

### Korak 1: Environment Setup
```powershell
# Kopirajte environment fajl
copy env.example .env

# Uredite .env sa vašim vrednostima
notepad .env
```

### Korak 2: Deployment
```powershell
# Automatski deployment
.\deploy-backend-only.bat

# Ili ručno
docker build -t sirus-backend:latest .
docker run -p 8080:8080 --env-file .env sirus-backend:latest
```

## 📁 Projektna struktura

```
sirus-backend/
├── src/main/java/com/sirus/backend/
│   ├── config/          # Spring Security konfiguracija
│   ├── controller/      # REST kontroleri
│   ├── dto/            # Data Transfer Objects
│   ├── entity/         # JPA entiteti
│   ├── repository/     # Repository interfejsi
│   ├── service/        # Business logika
│   └── SirusBackendApplication.java
├── src/main/resources/
│   ├── application.properties      # Development konfiguracija
│   ├── application-prod.properties # Production konfiguracija
│   └── schema.sql                 # Database schema
├── Dockerfile           # Docker konfiguracija
├── deploy-*.bat         # Deployment skripte
└── README.md
```

## 🔧 Konfiguracija

### Database Connection
Aplikacija koristi PostgreSQL database:

```properties
spring.datasource.url=jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:6543/postgres
spring.datasource.username=postgres.wynfrojhkzddzjbrpdcr
spring.datasource.password=${DATABASE_PASSWORD}
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `JWT_SECRET` - Secret key za JWT token generisanje
- `ADMIN_PASSWORD` - Admin user password
- `PORT` - Server port (default: 8080)

## 🐳 Docker

### Build
```bash
docker build -t sirus-backend:latest .
```

### Run
```bash
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:6543/postgres \
  -e DATABASE_USERNAME=postgres.wynfrojhkzddzjbrpdcr \
  -e DATABASE_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  sirus-backend:latest
```

## 🔐 Security

### JWT Authentication
- Token expiration: 24h (konfigurabilno)
- Secret key: konfigurabilno kroz environment variable
- Endpoints: `/api/auth/signin`, `/api/auth/signup`

### CORS Configuration
- Development: svi origins dozvoljeni
- Production: konfigurabilno kroz environment variables

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Registracija korisnika
- `POST /api/auth/signin` - Prijava korisnika

### Health Check
- `GET /actuator/health` - Health check endpoint

### Test
- `GET /api/test` - Test endpoint (zahteva autentifikaciju)

## 🚀 Deployment

### Container Instance
Aplikacija je optimizovana za container deployment:

- **Port**: 8080
- **Health Check**: `/actuator/health`
- **Environment Variables**: konfigurabilno kroz environment fajl

### Deployment Skripte
- `deploy-backend-only.bat` - Pojednostavljen deployment
- `deploy.sh` - Linux deployment skripta

## 📚 Dokumentacija

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detaljni deployment vodič
- [WINDOWS_SETUP.md](WINDOWS_SETUP.md) - Windows setup instrukcije

## 🛠️ Development

### Lokalni razvoj
```bash
# Pokrenite sa Maven
./mvnw spring-boot:run

# Ili sa Docker
docker-compose up
```

### Testiranje
```bash
# Unit testovi
./mvnw test

# Integration testovi
./mvnw verify
```

## 🔍 Monitoring

### Health Checks
- `/actuator/health` - Osnovni health check
- `/actuator/info` - Informacije o aplikaciji

### Logging
- Log level: INFO (production), DEBUG (development)
- Log format: JSON (production), plain text (development)

## 🚨 Troubleshooting

### Česti problemi
1. **Database connection greške**
   - Proverite PostgreSQL connection string
   - Proverite network connectivity
   - Proverite database credentials

2. **Docker build greške**
   - Proverite da li je Docker Desktop pokrenut
   - Proverite da li su svi fajlovi u direktorijumu

3. **PostgreSQL greške**
   - Proverite da li je database dostupan
   - Proverite da li su credentials ispravni
   - Proverite da li je port 6543 otvoren

## 📞 Support

Za dodatnu pomoć:
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Supabase Documentation](https://supabase.com/docs)

## 📄 License

Ovaj projekat je licenciran pod MIT licencom. 