# EUK Frontend Platforma

React/Next.js frontend aplikacija za EUK (Evidencija Ugroženih Lica) sistem.

## 🚀 Pokretanje aplikacije

### Preduslovi
- Node.js 18+ 
- npm ili yarn
- Backend Spring Boot aplikacija pokrenuta na `localhost:8080`

### Instalacija i pokretanje

1. **Instaliraj zavisnosti:**
```bash
npm install
# ili
yarn install
```

2. **Pokreni development server:**
```bash
npm run dev
# ili
yarn dev
```

3. **Otvori aplikaciju:**
```
http://localhost:3000
```

## 🔧 Konfiguracija

### Backend API
Aplikacija je konfigurisana da komunicira sa Spring Boot backend-om na:
- Development: `http://localhost:8080`
- Production: `https://euk.onrender.com`

### API Endpoint-ovi
- **Auth API:** `/api/auth/*` (signup, signin, me, check-username)
- **EUK Kategorije:** `/api/euk/kategorije/*` (CRUD)
- **EUK Predmeti:** `/api/euk/predmeti/*` (CRUD)
- **EUK Ugrožena lica:** `/api/euk/ugrozena-lica/*` (CRUD)

## 🛠️ Rešavanje problema

### 403 Forbidden greške

Ako dobijate 403 greške pri pozivanju API-ja:

1. **Proveri da li je backend pokrenut:**
```bash
curl http://localhost:8080/api/test/status
```

2. **Proveri JWT token:**
- Otvori Developer Tools (F12)
- Idi na Application/Storage tab
- Proveri da li postoji `token` u localStorage

3. **Testiraj API-je:**
- Idi na dashboard stranicu
- Koristi "Testiraj sve API-je" dugme (samo u development modu)

4. **Proveri CORS:**
- Backend mora da ima konfigurisan CORS za `http://localhost:3000`

### Česti problemi

**Problem:** "Nemate dozvolu za pristup ovim podacima"
**Rešenje:** Prijavi se ponovo - token je istekao

**Problem:** "Greška mreže"
**Rešenje:** Proveri da li je backend pokrenut na portu 8080

**Problem:** API pozivi ne rade
**Rešenje:** Proveri da li su proxy pravila u `next.config.ts` ispravna

## 📁 Struktura projekta

```
src/
├── app/
│   ├── components/          # Deljene komponente
│   ├── euk/                # EUK stranice
│   │   ├── kategorije/     # Upravljanje kategorijama
│   │   ├── predmeti/       # Upravljanje predmetima
│   │   └── ugrozena-lica/  # Upravljanje ugroženim licima
│   ├── dashboard/          # Dashboard stranica
│   └── layout.tsx          # Glavni layout
├── contexts/               # React context-ovi
├── services/               # API servisi
└── hooks/                  # Custom React hooks
```

## 🔐 Autentifikacija

Aplikacija koristi JWT token autentifikaciju:
- Token se čuva u localStorage
- Automatski se šalje u Authorization header-u
- Pri isteku tokena korisnik se automatski odjavljuje

## 🎨 UI/UX

- **Navbar:** Zeleni background (#88EBA7)
- **Title:** "EUK Platforma"
- **Sidebar:** Ne preklapa se sa navbar-om
- **Responsive:** Prilagođeno za desktop i mobilne uređaje

## 🚀 Deployment

Za production deployment:

1. **Build aplikacije:**
```bash
npm run build
```

2. **Pokreni production server:**
```bash
npm start
```

3. **Environment varijable:**
```env
NEXT_PUBLIC_API_URL=https://euk.onrender.com
```

## 📝 Napomene

- API test komponenta je dostupna samo u development modu
- Error handling je implementiran za sve API pozive
- Automatsko rukovanje 401/403 greškama
- Fallback poruke za korisnike

## 🤝 Podrška

Za probleme sa aplikacijom:
1. Proveri console log-ove u browser-u
2. Proveri Network tab u Developer Tools
3. Testiraj API-je kroz dashboard
4. Proveri da li je backend dostupan
