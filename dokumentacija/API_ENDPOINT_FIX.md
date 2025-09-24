# API Endpoint Fix - EUK Ugrožena Lica T1

## Problem
Frontend je pozivao pogrešan port i endpoint:
- ❌ Frontend poziva: `:3000/api/euk/ugrozena-lica-t1`
- ✅ Backend endpoint: `:8080/api/euk/ugrozena-lica-t1`

## Rešenje
Ažurirani su svi API route fajlovi da koriste pravi backend port i endpoint:

### 1. Ažurirani fajlovi:
- `src/app/api/euk/ugrozena-lica/route.ts`
- `src/app/api/euk/ugrozena-lica/[id]/route.ts`

### 2. Konfiguracija:
```typescript
const SPRING_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080'  // ✅ Pravilno postavljen port 8080
  : (process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com');
```

### 3. Ažurirani endpoint-i:
- `GET /api/euk/ugrozena-lica-t1` → `http://localhost:8080/api/euk/ugrozena-lica-t1`
- `POST /api/euk/ugrozena-lica-t1` → `http://localhost:8080/api/euk/ugrozena-lica-t1`
- `GET /api/euk/ugrozena-lica-t1/{id}` → `http://localhost:8080/api/euk/ugrozena-lica-t1/{id}`
- `PUT /api/euk/ugrozena-lica-t1/{id}` → `http://localhost:8080/api/euk/ugrozena-lica-t1/{id}`
- `DELETE /api/euk/ugrozena-lica-t1/{id}` → `http://localhost:8080/api/euk/ugrozena-lica-t1/{id}`

## Testiranje

### 1. Pokretanje backend-a:
```bash
# Backend treba da radi na portu 8080
# Proverite da li je backend pokrenut
curl http://localhost:8080/api/euk/ugrozena-lica-t1/test
```

### 2. Pokretanje frontend-a:
```bash
npm run dev
# ili
bun run dev
```

### 3. Testiranje konekcije:
- Otvorite browser na `http://localhost:3000`
- Idite na stranicu "Ugrožena lica"
- Proverite da li se podaci učitavaju bez grešaka

### 4. Provera u Developer Tools:
- Otvorite Network tab
- Proverite da li se pozivi šalju na `http://localhost:8080/api/euk/ugrozena-lica-t1`
- Ne na `http://localhost:3000/api/euk/ugrozena-lica-t1`

## Troubleshooting

### Problem: "Network Error" ili "Connection refused"
**Rešenje:**
1. Proverite da li backend radi na portu 8080
2. Proverite da li je backend dostupan na `http://localhost:8080`
3. Proverite da li su svi potrebni servisi pokrenuti

### Problem: "404 Not Found"
**Rešenje:**
1. Proverite da li backend ima endpoint `/api/euk/ugrozena-lica-t1`
2. Proverite da li je backend pravilno konfigurisan
3. Proverite da li su sve potrebne tabele kreirane

### Problem: "CORS Error"
**Rešenje:**
1. Proverite da li backend ima CORS konfiguraciju
2. Proverite da li frontend i backend koriste ispravne portove
3. Proverite da li su svi potrebni headers postavljeni

## Status
✅ **REŠENO** - Svi API pozivi su ažurirani da koriste pravi backend port (8080) i novi endpoint (`/api/euk/ugrozena-lica-t1`)

## Napomene
- Frontend sada pravilno poziva backend na portu 8080
- Svi endpoint-i su ažurirani na novu T1 strukturu
- Konfiguracija je ispravna za development i production
- Rate limiting je zadržan za sigurnost
