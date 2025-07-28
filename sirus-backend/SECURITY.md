# SIRUS Backend Security Guide

## 🔒 Sigurnosne mere implementirane u aplikaciji

### 1. **JWT Autentifikacija**
- ✅ JWT tokeni sa sigurnim secret key-om
- ✅ Token expiration (24h)
- ✅ Token validacija
- ✅ Secure token storage

### 2. **Spring Security**
- ✅ CSRF zaštita (onemogućena za API)
- ✅ CORS konfiguracija
- ✅ Stateless sesije
- ✅ Endpoint autorizacija

### 3. **Sigurnosni Headers**
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Strict-Transport-Security
- ✅ Content-Security-Policy
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### 4. **Rate Limiting**
- ✅ 60 zahteva po minuti po IP adresi
- ✅ Rate limit headers
- ✅ Brute force zaštita

### 5. **Environment Variables**
- ✅ Sigurno čuvanje kredencijala
- ✅ JWT secret u environment varijablama
- ✅ Database kredencijali u .env fajlu

## 🚨 KRITIČNE PREPORUKE ZA PRODUKCIJU

### 1. **JWT Secret Key**
```bash
# Generišite siguran JWT secret (min 256 bita)
openssl rand -base64 32
```

### 2. **Database Security**
- Koristite SSL/TLS konekcije
- Ograničite database pristup po IP adresama
- Redovno menjajte lozinke
- Koristite connection pooling

### 3. **HTTPS/SSL**
- Obavezno koristite HTTPS u produkciji
- Konfigurišite SSL sertifikat
- Redirect HTTP na HTTPS

### 4. **Firewall & Network Security**
- Ograničite pristup na potrebne portove
- Koristite VPN za admin pristup
- Implementirajte IP whitelist

### 5. **Logging & Monitoring**
- Logujte sve autentifikacijske pokušaje
- Monitorišite rate limiting
- Set up alerts za sumnjive aktivnosti

### 6. **Backup & Recovery**
- Redovni backup database-a
- Testirajte recovery procedure
- Čuvajte backup-ove na sigurnoj lokaciji

## 🔧 Konfiguracija za različite environment-e

### Development
```properties
spring.profiles.active=dev
logging.level.com.sirus.backend=DEBUG
```

### Production
```properties
spring.profiles.active=prod
logging.level.com.sirus.backend=WARN
management.endpoints.web.exposure.include=health
```

## 📋 Security Checklist

- [ ] JWT secret je siguran i dug (min 256 bita)
- [ ] Sve lozinke su jake (min 12 karaktera)
- [ ] HTTPS je konfigurisan
- [ ] CORS je ograničen na potrebne domene
- [ ] Rate limiting je aktivan
- [ ] Sigurnosni headers su postavljeni
- [ ] Database pristup je ograničen
- [ ] Logging je konfigurisan
- [ ] Backup strategija je implementirana
- [ ] Monitoring je postavljen

## 🆘 Incident Response

### U slučaju security incidenta:
1. Odmah blokirajte kompromitovane naloge
2. Promenite sve lozinke
3. Rotirajte JWT secret
4. Analizirajte logove
5. Ažurirajte sigurnosne mere
6. Obavestite korisnike ako je potrebno

## 📞 Kontakt

Za security pitanja kontaktirajte development tim. 