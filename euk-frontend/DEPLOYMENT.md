# Deployment Uputstva za EUK Frontend

## Environment Variables za Vercel

Postavite sledeće environment variables u Vercel dashboard-u:

### 1. Backend API URL
```
NEXT_PUBLIC_API_URL=https://euk.onrender.com
```

### 2. App Configuration
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
6. Ponovite za ostale varijable
7. Kliknite "Save"
8. Redeploy projekat

## Lokalno testiranje:

Kreirajte `.env.local` fajl u root direktorijumu:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://euk.onrender.com

# App Configuration
NEXT_PUBLIC_APP_NAME=EUK
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## API Endpoints

Frontend je konfigurisan da komunicira sa sledećim backend endpoint-ovima:

### Authentication
- `POST /api/auth/signup` - Registracija
- `POST /api/auth/signin` - Prijava
- `GET /api/auth/me` - Dobijanje trenutnog korisnika

### Test Endpoints
- `GET /api/test/hello` - Test hello endpoint
- `GET /api/test/status` - Test status endpoint
- `POST /api/test/echo` - Test echo endpoint

## Funkcionalnosti

✅ Implementirane funkcionalnosti:
- [x] AuthContext sa token management-om
- [x] Protected routes
- [x] Login/Register forme
- [x] API service klasa
- [x] Error handling
- [x] Loading states
- [x] Token storage (localStorage)
- [x] Logout funkcionalnost
- [x] API test komponenta

## Troubleshooting

### Problem: "A Serverless Function has an invalid name"
**Rešenje**: Proverite da li je ime projekta u Vercel-u bez razmaka i kraće od 128 karaktera.

### Problem: API pozivi ne rade
**Rešenje**: 
1. Proverite da li je `NEXT_PUBLIC_API_URL` postavljen ispravno
2. Proverite da li backend radi na Render-u
3. Proverite CORS konfiguraciju na backend-u

### Problem: Auth ne radi
**Rešenje**:
1. Proverite da li su svi environment variables postavljeni
2. Proverite browser console za greške
3. Proverite da li backend auth endpoint-ovi rade 