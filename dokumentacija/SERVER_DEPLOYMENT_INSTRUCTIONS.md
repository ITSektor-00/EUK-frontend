# Instrukcije za stavljanje EUK Frontend-a na server firme

## Pregled
Ovaj dokument sadrži detaljne instrukcije za postavljanje EUK frontend aplikacije na server firme. Aplikacija je napravljena u Next.js 15 sa TypeScript-om i koristi Material-UI komponente.

## Sistemski zahtevi

### Minimalni zahtevi:
- Node.js 18.17.0 ili noviji
- npm 9.0.0 ili noviji (ili bun kao alternativa)
- 2GB RAM
- 10GB slobodnog prostora na disku

### Preporučeni zahtevi:
- Node.js 20.x LTS
- 4GB RAM
- 20GB slobodnog prostora na disku
- SSD disk za bolje performanse

## Korak 1: Priprema servera

### 1.1 Instalacija Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Proverite verziju
node --version
npm --version
```

### 1.2 Instalacija PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 1.3 Kreiranje korisnika za aplikaciju
```bash
sudo adduser euk-app
sudo usermod -aG sudo euk-app
sudo su - euk-app
```

## Korak 2: Preuzimanje i instalacija aplikacije

### 2.1 Kloniranje repozitorijuma
```bash
cd /home/euk-app
git clone <URL_REPOZITORIJUMA> euk-frontend
cd euk-frontend
```

### 2.2 Instalacija dependencija
```bash
# Koristite npm ili bun
npm install
# ili
bun install
```

### 2.3 Kreiranje environment fajla
```bash
nano .env.local
```

Dodajte sledeće varijable:
```env
# Backend API URL - ZAMENITE SA PRAVIM URL-om vašeg backend servera
NEXT_PUBLIC_API_URL=http://localhost:3001
# ili
NEXT_PUBLIC_API_URL=https://your-backend-server.com

# App Configuration
NEXT_PUBLIC_APP_NAME=EUK Platforma
NEXT_PUBLIC_APP_VERSION=1.0.0

# Production settings
NODE_ENV=production
```

## Korak 3: Build i optimizacija

### 3.1 Build aplikacije
```bash
npm run build
# ili
bun run build
```

### 3.2 Testiranje build-a
```bash
npm run start
# ili
bun run start
```

Testirajte aplikaciju na `http://localhost:3000`

## Korak 4: Konfiguracija PM2

### 4.1 Kreiranje PM2 ecosystem fajla
```bash
nano ecosystem.config.js
```

Dodajte sledeći sadržaj:
```javascript
module.exports = {
  apps: [{
    name: 'euk-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/euk-app/euk-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/euk-app/logs/err.log',
    out_file: '/home/euk-app/logs/out.log',
    log_file: '/home/euk-app/logs/combined.log',
    time: true
  }]
};
```

### 4.2 Kreiranje log direktorijuma
```bash
mkdir -p /home/euk-app/logs
```

### 4.3 Pokretanje aplikacije sa PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Korak 5: Konfiguracija Nginx-a

### 5.1 Instalacija Nginx-a
```bash
sudo apt update
sudo apt install nginx
```

### 5.2 Kreiranje Nginx konfiguracije
```bash
sudo nano /etc/nginx/sites-available/euk-frontend
```

Dodajte sledeću konfiguraciju:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Zamenite sa vašim domenom

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### 5.3 Aktiviranje konfiguracije
```bash
sudo ln -s /etc/nginx/sites-available/euk-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Korak 6: SSL sertifikat (Let's Encrypt)

### 6.1 Instalacija Certbot-a
```bash
sudo apt install certbot python3-certbot-nginx
```

### 6.2 Dobijanje SSL sertifikata
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Korak 7: Firewall konfiguracija

### 7.1 Konfiguracija UFW
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Korak 8: Monitoring i logovi

### 8.1 PM2 monitoring
```bash
# Pregled statusa aplikacija
pm2 status

# Pregled logova
pm2 logs euk-frontend

# Restart aplikacije
pm2 restart euk-frontend

# Stop aplikacije
pm2 stop euk-frontend
```

### 8.2 Nginx logovi
```bash
# Pregled access logova
sudo tail -f /var/log/nginx/access.log

# Pregled error logova
sudo tail -f /var/log/nginx/error.log
```

## Korak 9: Automatsko ažuriranje

### 9.1 Kreiranje update skripte
```bash
nano /home/euk-app/update-app.sh
```

Dodajte sledeći sadržaj:
```bash
#!/bin/bash
cd /home/euk-app/euk-frontend
git pull origin main
npm install
npm run build
pm2 restart euk-frontend
echo "Aplikacija je ažurirana: $(date)"
```

### 9.2 Dodeljivanje izvršnih prava
```bash
chmod +x /home/euk-app/update-app.sh
```

### 9.3 Kreiranje cron job-a za automatsko ažuriranje
```bash
crontab -e
```

Dodajte liniju za dnevno ažuriranje u 2:00:
```bash
0 2 * * * /home/euk-app/update-app.sh >> /home/euk-app/logs/update.log 2>&1
```

## Korak 10: Backup strategija

### 10.1 Kreiranje backup skripte
```bash
nano /home/euk-app/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/euk-app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup aplikacije
tar -czf $BACKUP_DIR/euk-frontend_$DATE.tar.gz -C /home/euk-app euk-frontend

# Backup logova
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz -C /home/euk-app logs

# Čišćenje starih backup-ova (stariji od 30 dana)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup završen: $(date)"
```

### 10.2 Dodeljivanje izvršnih prava i cron job
```bash
chmod +x /home/euk-app/backup.sh
crontab -e
```

Dodajte liniju za nedeljni backup:
```bash
0 3 * * 0 /home/euk-app/backup.sh >> /home/euk-app/logs/backup.log 2>&1
```

## Troubleshooting

### Problem: Aplikacija se ne pokreće
**Rešenje:**
```bash
# Proverite logove
pm2 logs euk-frontend

# Proverite da li je port zauzet
sudo netstat -tlnp | grep :3000

# Restart PM2
pm2 restart all
```

### Problem: Nginx 502 Bad Gateway
**Rešenje:**
```bash
# Proverite da li aplikacija radi
pm2 status

# Proverite Nginx konfiguraciju
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Problem: SSL sertifikat ne radi
**Rešenje:**
```bash
# Proverite status sertifikata
sudo certbot certificates

# Obnovite sertifikat
sudo certbot renew --dry-run
```

### Problem: Performance problemi
**Rešenje:**
```bash
# Povećajte broj instanci u PM2
pm2 scale euk-frontend 2

# Proverite memoriju
free -h
pm2 monit
```

## Monitoring komande

### Osnovne komande za monitoring:
```bash
# Status aplikacije
pm2 status

# Monitoring u realnom vremenu
pm2 monit

# Pregled logova
pm2 logs euk-frontend --lines 100

# Restart aplikacije
pm2 restart euk-frontend

# Stop aplikacije
pm2 stop euk-frontend

# Start aplikacije
pm2 start euk-frontend
```

### Nginx status:
```bash
# Status Nginx-a
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Reload konfiguracije
sudo nginx -s reload
```

## Kontakt i podrška

Za dodatnu pomoć ili pitanja vezana za deployment:
- Proverite logove u `/home/euk-app/logs/`
- Koristite `pm2 monit` za real-time monitoring
- Proverite Nginx logove u `/var/log/nginx/`

## Napomene

- Zamenite `your-domain.com` sa stvarnim domenom vašeg servera
- Zamenite `NEXT_PUBLIC_API_URL` sa URL-om vašeg backend servera
- Redovno ažurirajte aplikaciju i sistem
- Pravite backup-ove pre svakog većeg ažuriranja
- Monitorujte performanse i logove redovno
