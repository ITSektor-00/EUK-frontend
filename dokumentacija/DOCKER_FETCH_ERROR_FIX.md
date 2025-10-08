# Docker "Failed to fetch" Greška - Rešenje

## Problem
Kada se frontend pokreće u Docker okruženju i korisnik klikne na "euk/stampanje", javlja se greška:
```
Error fetching ugrozena lica: TypeError: Failed to fetch
```

## Uzrok problema

### 1. Pogrešna konfiguracija apiService baseURL
U `src/services/api.ts` na liniji 10, `baseURL` je bio postavljen na prazan string:
```typescript
constructor() {
  // Koristi Next.js API route-ove umesto direktnog pristupa backend-u
  this.baseURL = ''; // ❌ POGREŠNO
}
```

### 2. Direktni fetch pozivi umesto apiService
U `src/app/euk/stampanje/page.tsx`, funkcije `fetchUgrozenaLica` i `fetchUgrozenaLicaT2` su koristile direktne `fetch` pozive umesto `apiService` metode.

### 3. Pogrešna getBaseURL funkcija
`getBaseURL()` funkcija nije pravilno rukovala Docker okruženjem.

## Rešenje

### 1. Popravka apiService baseURL
```typescript
constructor() {
  // Koristi backend API direktno
  this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; // ✅ ISPRAVNO
}
```

### 2. Zamena direktnih fetch poziva sa apiService
```typescript
// ❌ STARO - direktan fetch
const res = await fetch(`${getBaseURL()}/api/euk/ugrozena-lica-t1?${params.toString()}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ✅ NOVO - apiService
const data: UgrozenoLiceResponse = await apiService.getUgrozenaLica(params.toString(), token!);
```

### 3. Popravka getBaseURL funkcije
```typescript
const getBaseURL = () => {
  // U Docker okruženju, NODE_ENV može biti 'production', pa koristimo NEXT_PUBLIC_API_URL
  if (typeof window !== 'undefined') {
    // Client-side: koristi environment varijablu
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  } else {
    // Server-side: koristi environment varijablu ili fallback
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }
};
```

## Docker Environment Variables

Da bi ovo radilo u Docker okruženju, postavite environment varijablu:

```bash
# U docker-compose.yml ili Dockerfile
NEXT_PUBLIC_API_URL=http://backend-container:8080
# ili
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## Testiranje

1. **Lokalno testiranje:**
   ```bash
   npm run dev
   # Idite na http://localhost:3000/euk/stampanje
   ```

2. **Docker testiranje:**
   ```bash
   docker-compose up
   # Idite na http://localhost:3000/euk/stampanje
   ```

## Provera

- Otvorite Developer Tools → Network tab
- Kliknite na "euk/stampanje"
- Proverite da li se API pozivi šalju na pravi backend URL
- Ne bi trebalo da se javlja "Failed to fetch" greška

## Dodatne napomene

- `apiService` klasa ima ugrađeni error handling i retry logiku
- Sve API pozive treba da koriste `apiService` metode umesto direktnih `fetch` poziva
- Environment varijable moraju biti pravilno postavljene u Docker okruženju

