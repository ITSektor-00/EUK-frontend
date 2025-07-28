# PostgreSQL Deployment Checklist

## ✅ Preduslovi

### PostgreSQL Database
- [ ] PostgreSQL database kreiran (Supabase, AWS RDS, ili lokalni)
- [ ] Database credentials su dostupni
- [ ] Network access do database-a je konfigurisan
- [ ] Database port (6543) je otvoren

### Lokalni Setup
- [ ] Docker Desktop instaliran i pokrenut
- [ ] Git instaliran
- [ ] PowerShell dostupan
- [ ] Internet konekcija stabilna

## 📝 Environment Setup

### Environment Variables
- [ ] Kopirajte `env.example` u `.env`
- [ ] Popunite sledeće vrednosti:
  - [ ] `DATABASE_URL` - PostgreSQL connection string
  - [ ] `DATABASE_USERNAME` - postgres.wynfrojhkzddzjbrpdcr
  - [ ] `DATABASE_PASSWORD` - vaš database password
  - [ ] `JWT_SECRET` - secure random string
  - [ ] `ADMIN_PASSWORD` - secure admin password
  - [ ] `SPRING_PROFILES_ACTIVE` - prod
  - [ ] `PORT` - 8080

## 🐳 Docker Setup

### Build i Test
- [ ] `docker build -t sirus-backend:latest .`
- [ ] `docker run -p 8080:8080 --env-file .env sirus-backend:latest` (test lokalno)
- [ ] Proverite da li aplikacija radi na `http://localhost:8080/actuator/health`

## 🚀 Deployment

### Automatski Deployment
- [ ] `.\deploy-backend-only.bat`

### Ručni Deployment
- [ ] Stop postojeći container: `docker stop sirus-backend`
- [ ] Remove postojeći container: `docker rm sirus-backend`
- [ ] Pokrenite novi container:
  ```bash
  docker run -d \
    --name sirus-backend \
    -p 8080:8080 \
    --env-file .env \
    sirus-backend:latest
  ```

### Docker Compose (opciono)
- [ ] Kreirajte `docker-compose.yml` fajl
- [ ] `docker-compose up -d`

## 🔍 Verification

### Health Check
- [ ] Sačekajte da container bude `Running`
- [ ] Testirajte: `curl http://localhost:8080/actuator/health`
- [ ] Očekivani odgovor: `{"status":"UP"}`

### Database Connection
- [ ] Proverite logove: `docker logs sirus-backend`
- [ ] Proverite da li se aplikacija povezala sa database-om
- [ ] Nema grešaka u logovima

### API Test
- [ ] Testirajte signup: `curl -X POST http://localhost:8080/api/auth/signup -H "Content-Type: application/json" -d '{"username":"test","email":"test@test.com","password":"password123","firstName":"Test","lastName":"User"}'`
- [ ] Testirajte signin: `curl -X POST http://localhost:8080/api/auth/signin -H "Content-Type: application/json" -d '{"usernameOrEmail":"test","password":"password123"}'`

## 🔒 Security

### Network Security
- [ ] Port 8080 je dostupan
- [ ] Database port (6543) je dostupan
- [ ] Firewall je konfigurisan

### Application Security
- [ ] JWT_SECRET je secure random string
- [ ] ADMIN_PASSWORD je strong password
- [ ] DATABASE_PASSWORD je secure
- [ ] Production profile je aktivan

## 📊 Monitoring

### Container Monitoring
- [ ] `docker stats sirus-backend`
- [ ] `docker logs sirus-backend -f`

### Application Monitoring
- [ ] Health check endpoint radi
- [ ] Logovi se pravilno generišu
- [ ] Nema grešaka u aplikaciji

## 🚨 Troubleshooting

### Česti problemi
- [ ] Docker build greške → proverite Docker Desktop
- [ ] Database connection greške → proverite PostgreSQL credentials
- [ ] Container ne pokreće se → proverite logove
- [ ] Network greške → proverite firewall

### Debugging komande
- [ ] `docker logs sirus-backend`
- [ ] `docker exec sirus-backend env | grep DATABASE`
- [ ] `curl -v http://localhost:8080/actuator/health`
- [ ] `Test-NetConnection -ComputerName aws-0-eu-central-1.pooler.supabase.com -Port 6543`

## ✅ Final Verification

### Production Readiness
- [ ] Aplikacija radi stabilno
- [ ] Database connection je stabilan
- [ ] API endpoints rade
- [ ] Security je konfigurisan
- [ ] Monitoring je postavljen
- [ ] Backup strategija je planirana

### Documentation
- [ ] Deployment dokumentacija je ažurirana
- [ ] Environment variables su dokumentovani
- [ ] Troubleshooting guide je napisan
- [ ] Support kontakti su definisani

---

**🎉 Čestitamo! Vaša aplikacija je uspešno deployovana sa PostgreSQL!**

**📞 Support**: Za dodatnu pomoć, proverite [DEPLOYMENT.md](DEPLOYMENT.md) ili [WINDOWS_SETUP.md](WINDOWS_SETUP.md) 