# HTTP 403 Greška - Instrukcije za Testiranje

## Problem koji je rešen

HTTP 403 greške su nastajale jer optimizovani servis nije koristio autentifikacione tokene u development modu, što je rezultovalo učitavanjem mock podataka umesto podataka iz baze.

## Implementirane izmene

### 1. AuthUtils (`src/utils/authUtils.ts`)
- Nova utility klasa za upravljanje autentifikacijom
- Validacija JWT token-a
- Provera isteka token-a
- Kreiranje Authorization header-a

### 2. Optimizovani Servis (`src/services/optimizedTemplateService.ts`)
- Uvek koristi token ako je validan (ne zavisno od development mode-a)
- Bolje rukovanje 403 greškama
- Detaljno logovanje auth statusa

### 3. Development Servis (`src/services/developmentTemplateService.ts`)
- Iste izmene kao optimizovani servis
- Konzistentno ponašanje u svim modovima

### 4. UI Poboljšanja (`src/components/TemplateGenerationForm.tsx`)
- Status panel za autentifikaciju
- Prikaz informacija o token-u
- Dugme za proveru auth statusa

## Kako testirati

### 1. Proverite da li ste ulogovani
```javascript
// U browser console-u
console.log(AuthUtils.getTokenInfo());
AuthUtils.logAuthStatus();
```

### 2. Proverite token u localStorage
```javascript
// U browser console-u
console.log('Token:', localStorage.getItem('token'));
```

### 3. Testiranje bez token-a
1. Obrišite token iz localStorage: `localStorage.removeItem('token')`
2. Refresh stranice
3. Trebalo bi da vidite "❌ Nevalidan ili nedostaje token" u auth status panelu

### 4. Testiranje sa validnim token-om
1. Ulogujte se ponovo
2. Refresh stranice
3. Trebalo bi da vidite "✅ Validan token" u auth status panelu
4. Podaci se trebaju učitati iz baze, ne mock podaci

### 5. Proverite console logove
Tražite sledeće logove:
```
[Optimized] Using valid authentication token for /api/kategorije
[Optimized] Response from /api/kategorije: SUCCESS
```

Umesto:
```
[Optimized] No valid authentication token found for /api/kategorije
```

## Očekivani rezultati

### Sa validnim token-om:
- ✅ Auth status: "Validan token"
- ✅ Service status: "Optimizovani servis (live podaci)"
- ✅ Console logovi pokazuju korišćenje token-a
- ✅ Podaci se učitavaju iz baze

### Bez token-a ili sa nevalidnim token-om:
- ❌ Auth status: "Nevalidan ili nedostaje token"
- ⚠️ Console logovi pokazuju upozorenja o token-u
- 🔄 Sistem pokušava da učitava iz baze ali dobija 403 grešku

## Troubleshooting

### Problem: I dalje dobijam 403 greške
**Rešenje:**
1. Proverite da li je token validan: `AuthUtils.isLoggedIn()`
2. Proverite da li token nije istekao
3. Ulogujte se ponovo ako je potrebno

### Problem: Vidim mock podatke umesto podataka iz baze
**Rešenje:**
1. Proverite auth status panel
2. Ako nema validan token, ulogujte se
3. Ako ima validan token, proverite console logove

### Problem: Auth status panel ne prikazuje informacije
**Rešenje:**
1. Refresh stranice
2. Kliknite "Proveri ponovo" dugme
3. Proverite console za greške

## Console komande za debugging

```javascript
// Proveri auth status
AuthUtils.logAuthStatus();

// Proveri token info
console.log(AuthUtils.getTokenInfo());

// Proveri da li je korisnik ulogovan
console.log('Is logged in:', AuthUtils.isLoggedIn());

// Proveri service stats
console.log(adaptiveTemplateService.getServiceStats());

// Resetuj servis ako je potrebno
await adaptiveTemplateService.resetAndRetry();
```

## Ključne izmene

1. **Autentifikacija je sada obavezna** - servisi uvek pokušavaju da koriste token ako je dostupan
2. **403 greške se ne retry-uju** - jer obično znače problem sa autentifikacijom
3. **Fallback se ne aktivira za 403** - jer je to auth problem, ne server problem
4. **Detaljno logovanje** - sada možete videti tačno šta se dešava sa autentifikacijom

Sistem je sada konfigurisan da uvek pokušava da učitava podatke iz baze kada je token validan, što rešava problem sa mock podacima.


