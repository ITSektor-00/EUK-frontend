# Deployment Uputstva za EUK Frontend

## Environment Variables za Vercel

Postavite sledeće environment variables u Vercel dashboard-u:

### 1. Backend API URL
```
NEXT_PUBLIC_API_URL=https://euk.onrender.com
```

### 2. App Configuration (Opcionalno)
```
NEXT_PUBLIC_APP_NAME=EUK
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Koraci za postavljanje:

1. Idite na [Vercel Dashboard](https://vercel.com/dashboard)
2. Izaberite vaš EUK frontend projekat
3. Idite na "Settings" tab
4. Idite na "Environment Variables" sekciju
5. Dodajte svaku varijablu:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://euk.onrender.com`
   - **Environment**: Production, Preview, Development
6. Kliknite "Save"
7. Redeploy projekat

## Lokalno testiranje:

Kreirajte `.env.local` fajl u root direktorijumu:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://euk.onrender.com

# App Configuration (Opcionalno)
NEXT_PUBLIC_APP_NAME=EUK
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## API Endpoints

Frontend je konfigurisan da komunicira sa sledećim backend endpoint-ovima:

### Authentication
- `POST /api/auth/signup` - Registracija korisnika
- `POST /api/auth/signin` - Prijava korisnika
- `GET /api/auth/me` - Dobijanje trenutnog korisnika
- `GET /api/auth/check-username` - Provera dostupnosti korisničkog imena

### Test Endpoints
- `GET /api/test/hello` - Test hello endpoint
- `GET /api/test/status` - Test status endpoint
- `POST /api/test/echo` - Test echo endpoint (text/plain)
- `GET /api/test/cors-test` - Test CORS konfiguracije
- `GET /api/test/check-username-test` - Test provere korisničkog imena

## Funkcionalnosti

✅ Implementirane funkcionalnosti:
- [x] AuthContext sa token management-om
- [x] Protected routes
- [x] Login/Register forme
- [x] API service klasa sa error handling-om
- [x] Custom useApi hook
- [x] Loading states
- [x] Token storage (localStorage)
- [x] Logout funkcionalnost
- [x] API test komponenta sa svim endpoint-ovima
- [x] CORS test funkcionalnost
- [x] Username availability check
- [x] Global error handling

## API Service Features

### Error Handling
- Globalna funkcija za hendlanje grešaka
- Network error detection
- HTTP error handling
- Console logging za debugging

### Username Check
- Fallback mehanizam (prvo proba auth endpoint, pa test endpoint)
- Graceful error handling
- Console logging

### CORS Support
- Proper headers za sve API pozive
- CORS test endpoint
- Cross-origin request handling

## Troubleshooting

### Problem: "A Serverless Function has an invalid name"
**Rešenje**: Proverite da li je ime projekta u Vercel-u bez razmaka i kraće od 128 karaktera.

### Problem: API pozivi ne rade
**Rešenje**: 
1. Proverite da li je `NEXT_PUBLIC_API_URL` postavljen ispravno
2. Proverite da li backend radi na Render-u
3. Proverite CORS konfiguraciju na backend-u
4. Proverite browser console za greške

### Problem: Auth ne radi
**Rešenje**:
1. Proverite da li su svi environment variables postavljeni
2. Proverite browser console za greške
3. Proverite da li backend auth endpoint-ovi rade
4. Proverite da li su token-i pravilno čuvani

### Problem: Username check ne radi
**Rešenje**:
1. Proverite da li su oba endpoint-a dostupna
2. Proverite fallback mehanizam
3. Proverite console logove

## Build Configuration

### Vercel.json
```json
{
  "buildCommand": "bun run build",
  "outputDirectory": ".next",
  "installCommand": "bun install"
}
```

### Next.js Config
- Environment variables support
- CORS headers
- TypeScript support 