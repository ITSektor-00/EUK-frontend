# Windows Setup Guide za PostgreSQL Deployment

## Preduslovi

### 1. Docker Desktop
1. Preuzmite Docker Desktop sa [docker.com](https://www.docker.com/products/docker-desktop/)
2. Instalirajte i pokrenite Docker Desktop
3. Proverite da li radi: `docker --version`

### 2. Git
1. Preuzmite Git sa [git-scm.com](https://git-scm.com/)
2. Instalirajte sa default opcijama
3. Proverite: `git --version`

### 3. PowerShell
- Windows 10 već ima PowerShell 5.1
- Za PowerShell 7: preuzmite sa [github.com/PowerShell/PowerShell](https://github.com/PowerShell/PowerShell/releases)

## Korak 1: Environment Variables Setup

### 1.1 Kopiranje environment fajla
```powershell
copy env.example .env
```

### 1.2 Konfiguracija .env fajla
Otvorite `.env` fajl i popunite sledeće vrednosti:

```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:6543/postgres
DATABASE_USERNAME=postgres.wynfrojhkzddzjbrpdcr
DATABASE_PASSWORD=your-actual-db-password

# Security
JWT_SECRET=your-super-secret-jwt-key
ADMIN_PASSWORD=your-secure-admin-password

# Application Configuration
SPRING_PROFILES_ACTIVE=prod
PORT=8080
```

## Korak 2: Build i Deployment

### 2.1 Build Docker image
```powershell
# Build image
docker build -t sirus-backend:latest .
```

### 2.2 Pokretanje container-a
```powershell
# Koristite skriptu za automatski deployment
.\deploy-backend-only.bat
```

Ili ručno:
```powershell
# Stop i remove postojeći container ako postoji
docker stop sirus-backend 2>$null
docker rm sirus-backend 2>$null

# Pokrenite novi container
docker run -d `
    --name sirus-backend `
    -p 8080:8080 `
    --env-file .env `
    sirus-backend:latest
```

### 2.3 Provera statusa
```powershell
# Proverite status container-a
docker ps

# Pregledajte logove
docker logs sirus-backend
```

## Korak 3: Production Deployment

### 3.1 Docker Compose (preporučeno)
Kreirajte `docker-compose.yml` fajl:

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
```

### 3.2 Pokretanje sa Docker Compose
```powershell
docker-compose up -d
```

## Troubleshooting

### Česti problemi na Windows:

1. **Docker Desktop nije pokrenut**
   ```powershell
   # Proverite Docker status
   docker info
   ```

2. **Long path issues**
   - Omogućite long path support u Windows
   - Ili premestite projekat u kraći path (npr. `C:\sirus`)

3. **PowerShell execution policy**
   ```powershell
   # Proverite execution policy
   Get-ExecutionPolicy
   
   # Ako je Restricted, promenite na RemoteSigned
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Environment variables se ne učitavaju**
   ```powershell
   # Proverite .env fajl
   Get-Content .env
   
   # Testirajte učitavanje
   docker run --rm --env-file .env sirus-backend:latest env | findstr DATABASE
   ```

5. **PostgreSQL connection greške**
   ```powershell
   # Proverite network connectivity
   Test-NetConnection -ComputerName aws-0-eu-central-1.pooler.supabase.com -Port 6543
   
   # Proverite da li su credentials ispravni
   docker logs sirus-backend | findstr "database"
   ```

### Debugging komande:

```powershell
# Proverite Docker images
docker images

# Proverite Docker containers
docker ps -a

# Proverite environment variables
docker exec sirus-backend env | findstr DATABASE

# Testirajte database connection
docker exec sirus-backend curl -f http://localhost:8080/actuator/health

# Proverite network connectivity
Test-NetConnection -ComputerName aws-0-eu-central-1.pooler.supabase.com -Port 6543
```

## Korisne PowerShell funkcije

### Dodajte u PowerShell profile:
```powershell
# Kreirajte PowerShell profile
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# Dodajte funkcije
notepad $PROFILE
```

```powershell
# Quick deployment funkcija
function Deploy-SirusBackend {
    param(
        [string]$Environment = "prod"
    )
    
    Write-Host "Building Docker image..." -ForegroundColor Green
    docker build -t sirus-backend:latest .
    
    Write-Host "Stopping existing container..." -ForegroundColor Green
    docker stop sirus-backend 2>$null
    docker rm sirus-backend 2>$null
    
    Write-Host "Starting new container..." -ForegroundColor Green
    docker run -d --name sirus-backend -p 8080:8080 --env-file .env sirus-backend:latest
    
    Write-Host "Deployment completed!" -ForegroundColor Green
    Write-Host "Application URL: http://localhost:8080" -ForegroundColor Yellow
}

# Quick logs funkcija
function Get-SirusLogs {
    docker logs sirus-backend -f
}

# Quick restart funkcija
function Restart-SirusBackend {
    docker restart sirus-backend
    Write-Host "Container restarted!" -ForegroundColor Green
}
```

## Performance Optimization

### 1. Docker Desktop Settings
- Povećajte memory limit na 8GB
- Povećajte disk image size na 64GB
- Omogućite WSL 2 backend

### 2. PowerShell Performance
```powershell
# Omogućite PowerShell 7
winget install Microsoft.PowerShell

# Koristite PowerShell 7 umesto Windows PowerShell
```

### 3. Network Optimization
```powershell
# Proverite DNS settings
nslookup aws-0-eu-central-1.pooler.supabase.com

# Ako imate problema sa DNS-om, dodajte u hosts fajl
# C:\Windows\System32\drivers\etc\hosts
```

## Security Best Practices

### 1. Environment Variables
- Nikad ne čuvajte passwords u plain text
- Koristite Windows Credential Manager
- Ili koristite external vault za production

### 2. Network Security
- Koristite VPN ako je potrebno
- Proverite firewall settings
- Koristite private networks kada je moguće

### 3. Container Security
- Koristite minimal base images
- Regularno update-ujte dependencies
- Scan-ujte images za vulnerabilities

## Monitoring i Logging

### 1. Windows Event Logs
```powershell
# Proverite Docker logs
Get-EventLog -LogName Application -Source "Docker Desktop"

# Proverite PowerShell logs
Get-EventLog -LogName Windows PowerShell
```

### 2. Performance Monitoring
```powershell
# Proverite Docker resource usage
docker stats

# Proverite disk usage
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, Size, FreeSpace
```

## Backup i Recovery

### 1. Configuration Backup
```powershell
# Backup environment variables
Copy-Item ".env" "C:\backup\env-backup.txt"

# Backup docker-compose.yml
Copy-Item "docker-compose.yml" "C:\backup\docker-compose-backup.yml"
```

### 2. Docker Images Backup
```powershell
# Backup Docker images
docker save sirus-backend:latest > C:\backup\sirus-backend-backup.tar

# Restore Docker images
docker load < C:\backup\sirus-backend-backup.tar
```

### 3. Database Backup
```powershell
# Backup PostgreSQL database (ako imate pristup)
pg_dump -h aws-0-eu-central-1.pooler.supabase.com -p 6543 -U postgres.wynfrojhkzddzjbrpdcr postgres > C:\backup\database-backup.sql
```

## Support i Resursi

- [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/) 