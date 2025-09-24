# API Architecture Fix - EUK Ugrožena Lica T1

## Problem
Frontend je pokušavao da direktno pozove backend endpoint umesto da koristi Next.js API route kao proxy.

## Arhitektura

### ✅ Ispravna arhitektura:
```
Frontend (port 3000) 
    ↓ poziva
Next.js API Route (/api/euk/ugrozena-lica)
    ↓ proslijedi na
Backend (port 8080) (/api/euk/ugrozena-lica-t1)
```

### ❌ Pogrešna arhitektura:
```
Frontend (port 3000)
    ↓ direktno poziva
Backend (port 8080) (/api/euk/ugrozena-lica-t1)
```

## Rešenje

### 1. Frontend pozivi (ISPRAVNO):
```typescript
// Frontend poziva Next.js API route
const res = await fetch('/api/euk/ugrozena-lica');
```

### 2. Next.js API Route (ISPRAVNO):
```typescript
// API route proslijedi zahtev na backend
const response = await fetch(`${SPRING_BASE_URL}/api/euk/ugrozena-lica-t1`);
```

### 3. Backend endpoint (ISPRAVNO):
```
http://localhost:8080/api/euk/ugrozena-lica-t1
```

## Ažurirani fajlovi

### Frontend komponente (vraćene na originalne pozive):
- `src/app/euk/ugrozena-lica/page.tsx` - Poziva `/api/euk/ugrozena-lica`
- `src/app/euk/stampanje/page.tsx` - Poziva `/api/euk/ugrozena-lica`
- `src/services/api.ts` - Poziva `/api/euk/ugrozena-lica`

### Next.js API Routes (ažurirani da pozivaju backend):
- `src/app/api/euk/ugrozena-lica/route.ts` - Poziva `http://localhost:8080/api/euk/ugrozena-lica-t1`
- `src/app/api/euk/ugrozena-lica/[id]/route.ts` - Poziva `http://localhost:8080/api/euk/ugrozena-lica-t1/{id}`

## Tok podataka

### 1. GET zahtev:
```
Frontend: GET /api/euk/ugrozena-lica?page=0&size=10
    ↓
Next.js API: GET http://localhost:8080/api/euk/ugrozena-lica-t1?page=0&size=10
    ↓
Backend: Vraća podatke
    ↓
Next.js API: Proslijedi podatke frontend-u
    ↓
Frontend: Prikaže podatke
```

### 2. POST zahtev:
```
Frontend: POST /api/euk/ugrozena-lica (sa UgrozenoLiceT1 podacima)
    ↓
Next.js API: POST http://localhost:8080/api/euk/ugrozena-lica-t1 (sa istim podacima)
    ↓
Backend: Kreira novi zapis
    ↓
Next.js API: Vraća rezultat frontend-u
    ↓
Frontend: Prikaže poruku o uspehu
```

## Prednosti ove arhitekture

### 1. Sigurnost:
- Backend nije direktno dostupan iz browser-a
- Next.js API route može da dodaje autentifikaciju
- Rate limiting je implementiran na API route nivou

### 2. Fleksibilnost:
- Može se dodati caching na API route nivou
- Može se transformisati podaci pre slanja na backend
- Može se dodati logging i monitoring

### 3. CORS:
- Nema CORS problema jer frontend i API route su na istom domenu
- Backend ne mora da ima CORS konfiguraciju za frontend

## Testiranje

### 1. Pokretanje:
```bash
# Backend (port 8080)
./mvnw spring-boot:run

# Frontend (port 3000)
npm run dev
```

### 2. Provera u Developer Tools:
- Network tab treba da pokazuje pozive na `localhost:3000/api/euk/ugrozena-lica`
- Ne na `localhost:8080/api/euk/ugrozena-lica-t1`

### 3. Provera u backend logovima:
- Treba da se vide zahtevi na `/api/euk/ugrozena-lica-t1`
- Sa ispravnim podacima

## Status
✅ **REŠENO** - Frontend sada koristi Next.js API route kao proxy za backend komunikaciju

## Napomene
- Frontend poziva `/api/euk/ugrozena-lica` (Next.js API route)
- API route proslijedi zahtev na `http://localhost:8080/api/euk/ugrozena-lica-t1` (backend)
- Ova arhitektura je ispravna i sigurna
- Svi podaci se transformišu kroz Next.js API route
