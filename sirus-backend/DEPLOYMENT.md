# Docker Dokumentacija za SIRUS Backend Projekt

## 📖 Sadržaj
1. [Preduslovi](#preduslovi)
2. [Environment Setup](#environment-setup)
3. [Docker Komande](#docker-komande)
4. [Deployment Skripte](#deployment-skripte)
5. [Docker Compose](#docker-compose)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring](#monitoring)

---

## 🛠️ Preduslovi

### Instalacija Docker Desktop
```powershell
# Preuzmite Docker Desktop sa https://www.docker.com/products/docker-desktop/
# Instalirajte i pokrenite Docker Desktop
```

### Provera instalacije
```powershell
# Proverite Docker verziju
docker --version

# Proverite Docker Compose verziju
docker-compose --version

# Proverite da li Docker radi
docker ps
```

---

## 🔧 Environment Setup

### 1. Kreiranje .env fajla
```powershell
# Kopirajte template fajl
copy env.example .env

# Uredite .env fajl sa vašim vrednostima
notepad .env
```

### 2. Sadržaj .env fajla
```env
# Database Configuration
DATABASE_URL=jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:6543/postgres
DATABASE_USERNAME=postgres.wynfrojhkzddzjbrpdcr
DATABASE_PASSWORD=a*Xxk3B7?HF8&3r

# Server Configuration
PORT=8080

# Security Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=moja-admin-lozinka123
JWT_SECRET=moj-super-tajan-jwt-kljuc-za-sirus-aplikaciju-20244
JWT_EXPIRATION=86400000

# Application Configuration
SPRING_PROFILES_ACTIVE=prod
```

---

## 🐳 Docker Komande

### 1. Build Docker Image
```powershell
# Build image sa tagom
docker build -t sirus-backend:latest .

# Build sa specifičnim tagom
docker build -t sirus-backend:v1.0.0 .

# Build bez cache-a
docker build --no-cache -t sirus-backend:latest .
```

### 2. Pokretanje Kontejnera
```powershell
# Osnovno pokretanje
docker run -p 8080:8080 --env-file .env sirus-backend:latest

# Pokretanje u background-u
docker run -d -p 8080:8080 --env-file .env --name sirus-backend sirus-backend:latest

# Pokretanje sa custom portom
docker run -d -p 9090:8080 --env-file .env --name sirus-backend sirus-backend:latest

# Pokretanje sa restart policy
docker run -d -p 8080:8080 --env-file .env --name sirus-backend --restart unless-stopped sirus-backend:latest
```

### 3. Upravljanje Kontejnerima
```powershell
# Lista pokrenutih kontejnera
docker ps

# Lista svih kontejnera (uključujući zaustavljene)
docker ps -a

# Zaustavljanje kontejnera
docker stop sirus-backend

# Pokretanje zaustavljenog kontejnera
docker start sirus-backend

# Restart kontejnera
docker restart sirus-backend

# Brisanje kontejnera
docker rm sirus-backend

# Brisanje kontejnera i image-a
docker rm -f sirus-backend
docker rmi sirus-backend:latest
```

### 4. Logovi i Debugging
```powershell
# Pregled logova
docker logs sirus-backend

# Pregled logova u realnom vremenu
docker logs -f sirus-backend

# Pregled zadnjih 100 linija logova
docker logs --tail 100 sirus-backend

# Ulazak u kontejner (za debugging)
docker exec -it sirus-backend /bin/sh

# Provera resursa kontejnera
docker stats sirus-backend
```

---

## 📦 Deployment Skripte

### 1. deploy-backend-only.bat
```batch
@echo off
echo ========================================
echo SIRUS Backend Docker Deployment
echo ========================================

echo.
echo 1. Building Docker image...
docker build -t sirus-backend:latest .

if %errorlevel% neq 0 (
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)

echo.
echo 2. Stopping existing container...
docker stop sirus-backend 2>nul
docker rm sirus-backend 2>nul

echo.
echo 3. Starting new container...
docker run -d -p 8080:8080 --env-file .env --name sirus-backend --restart unless-stopped sirus-backend:latest

if %errorlevel% neq 0 (
    echo ERROR: Docker run failed!
    pause
    exit /b 1
)

echo.
echo 4. Checking container status...
timeout /t 5 /nobreak >nul
docker ps --filter name=sirus-backend

echo.
echo ========================================
echo Deployment completed successfully!
echo Application is running on: http://localhost:8080
echo Health check: http://localhost:8080/actuator/health
echo ========================================
pause
```

### 2. deploy.sh (Linux/Mac)
```bash
#!/bin/bash

echo "========================================"
echo "SIRUS Backend Docker Deployment"
echo "========================================"

echo ""
echo "1. Building Docker image..."
docker build -t sirus-backend:latest .

if [ $? -ne 0 ]; then
    echo "ERROR: Docker build failed!"
    exit 1
fi

echo ""
echo "2. Stopping existing container..."
docker stop sirus-backend 2>/dev/null
docker rm sirus-backend 2>/dev/null

echo ""
echo "3. Starting new container..."
docker run -d -p 8080:8080 --env-file .env --name sirus-backend --restart unless-stopped sirus-backend:latest

if [ $? -ne 0 ]; then
    echo "ERROR: Docker run failed!"
    exit 1
fi

echo ""
echo "4. Checking container status..."
sleep 5
docker ps --filter name=sirus-backend

echo ""
echo "========================================"
echo "Deployment completed successfully!"
echo "Application is running on: http://localhost:8080"
echo "Health check: http://localhost:8080/actuator/health"
echo "========================================"
```

---

## 🐙 Docker Compose

### 1. docker-compose.yml
```yaml
version: '3.8'

services:
  sirus-backend:
    image: sirus-backend:latest
    container_name: sirus-backend
    ports:
      - "8080:8080"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - sirus-network

networks:
  sirus-network:
    driver: bridge
```

### 2. Docker Compose Komande
```powershell
# Pokretanje sa Docker Compose
docker-compose up -d

# Zaustavljanje
docker-compose down

# Restart
docker-compose restart

# Pregled logova
docker-compose logs -f

# Rebuild i pokretanje
docker-compose up -d --build

# Pregled statusa
docker-compose ps
```

---

## 🔍 Troubleshooting

### 1. Česti Problemi

#### Problem: "Port already in use"
```powershell
# Proverite koji proces koristi port 8080
netstat -ano | findstr :8080

# Zaustavite proces ili promenite port
docker run -d -p 9090:8080 --env-file .env sirus-backend:latest
```

#### Problem: "Environment variables not found"
```powershell
# Proverite da li .env fajl postoji
dir .env

# Proverite sadržaj .env fajla
type .env

# Pokrenite sa eksplicitnim environment varijablama
docker run -d -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:6543/postgres \
  -e DATABASE_USERNAME=postgres.wynfrojhkzddzjbrpdcr \
  -e DATABASE_PASSWORD=a*Xxk3B7?HF8&3r \
  -e SPRING_PROFILES_ACTIVE=prod \
  sirus-backend:latest
```

#### Problem: "Database connection failed"
```powershell
# Proverite logove
docker logs sirus-backend

# Proverite database konekciju
docker exec -it sirus-backend curl -f http://localhost:8080/actuator/health
```

### 2. Debugging Komande
```powershell
# Proverite Docker image
docker images sirus-backend

# Proverite kontejner detalje
docker inspect sirus-backend

# Proverite environment varijable u kontejneru
docker exec sirus-backend env

# Proverite network konekcije
docker network ls
docker network inspect bridge
```

---

## 📊 Monitoring

### 1. Health Check
```powershell
# Osnovni health check
curl http://localhost:8080/actuator/health

# Detaljni health check
curl http://localhost:8080/actuator/health -v
```

### 2. Docker Stats
```powershell
# Pregled resursa
docker stats sirus-backend

# Pregled svih kontejnera
docker stats --all
```

### 3. Log Monitoring
```powershell
# Praćenje logova u realnom vremenu
docker logs -f sirus-backend

# Filtriranje logova
docker logs sirus-backend | findstr "ERROR"
docker logs sirus-backend | findstr "WARN"
```

---

## 🚀 Quick Start Guide

### 1. Prvi put pokretanje
```powershell
# 1. Kopirajte environment fajl
copy env.example .env

# 2. Uredite .env fajl
notepad .env

# 3. Build image
docker build -t sirus-backend:latest .

# 4. Pokrenite kontejner
docker run -d -p 8080:8080 --env-file .env --name sirus-backend sirus-backend:latest

# 5. Proverite status
docker ps
curl http://localhost:8080/actuator/health
```

### 2. Svakodnevno korišćenje
```powershell
# Pokretanje
docker start sirus-backend

# Zaustavljanje
docker stop sirus-backend

# Restart
docker restart sirus-backend

# Pregled logova
docker logs -f sirus-backend
```

### 3. Deployment update
```powershell
# 1. Zaustavite kontejner
docker stop sirus-backend

# 2. Obrišite stari kontejner
docker rm sirus-backend

# 3. Build novi image
docker build -t sirus-backend:latest .

# 4. Pokrenite novi kontejner
docker run -d -p 8080:8080 --env-file .env --name sirus-backend sirus-backend:latest
```

---

## 📋 Korisne Komande za Kopiranje

### Build i Run
```powershell
docker build -t sirus-backend:latest .
docker run -d -p 8080:8080 --env-file .env --name sirus-backend sirus-backend:latest
```

### Upravljanje
```powershell
docker start sirus-backend
docker stop sirus-backend
docker restart sirus-backend
docker logs -f sirus-backend
```

### Monitoring
```powershell
docker ps
docker stats sirus-backend
curl http://localhost:8080/actuator/health
```

### Cleanup
```powershell
docker stop sirus-backend
docker rm sirus-backend
docker rmi sirus-backend:latest
```

---

## ✅ Provera da li sve radi

### 1. Health Check
```powershell
curl http://localhost:8080/actuator/health
```

**Očekivani odgovor:**
```json
{
    "status": "UP",
    "components": {
        "db": {"status": "UP"},
        "diskSpace": {"status": "UP"},
        "ping": {"status": "UP"}
    }
}
```

### 2. Test Endpoint
```powershell
curl http://localhost:8080/api/test/status
```

**Očekivani odgovor:**
```
"SIRUS Backend is running!"
```

### 3. Container Status
```powershell
docker ps --filter name=sirus-backend
```

**Očekivani odgovor:**
```
CONTAINER ID   IMAGE                STATUS         PORTS                    NAMES
abc123def456   sirus-backend:latest Up 2 minutes  0.0.0.0:8080->8080/tcp  sirus-backend
```

---

**Vaša SIRUS Backend aplikacija je sada potpuno spremna za Docker deployment!** 