# Licencni Sistem - Frontend Implementacija

## Pregled

Ovaj dokument opisuje implementaciju licencnog sistema na frontend strani EUK Platforme. Sistem proverava važenje licence, prikazuje obaveštenja o isteku i blokira pristup kada licenca istekne.

## Implementirane Komponente

### 1. LicenseService (`src/services/licenseService.ts`)

Servis za komunikaciju sa backend API-jem za licence.

**Glavne metode:**
- `checkLicenseStatus(userId, token)` - Proverava status licence
- `checkLicense(userId, token)` - Proverava da li korisnik ima važeću licencu
- `getUserLicenses(userId, token)` - Dobija sve licence korisnika

**Interfejsi:**
```typescript
interface LicenseInfo {
  hasValidLicense: boolean;
  endDate: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  message?: string;
}
```

### 2. LicenseContext (`src/contexts/LicenseContext.tsx`)

React Context za globalno upravljanje licencnim podacima.

**Funkcionalnosti:**
- Automatska provera licence kada se korisnik uloguje
- Automatska provera licence svakih 5 minuta
- Globalno stanje licence kroz aplikaciju
- Error handling i loading states

**Hook:**
```typescript
const {
  licenseInfo,
  loading,
  error,
  isLicenseValid,
  isLicenseExpired,
  isLicenseExpiringSoon,
  checkLicense,
  refreshLicense,
  getStatusMessage,
  getFormattedEndDate
} = useLicense();
```

### 3. LicenseWarning (`src/components/LicenseWarning.tsx`)

Komponenta za prikaz upozorenja o licenci na vrhu stranice.

**Funkcionalnosti:**
- Prikazuje se kada licenca ističe uskoro ili je istekla
- Može se zatvoriti (dismiss)
- Animacija slideDown
- Responsive dizajn

### 4. LicenseExpired (`src/app/license-expired/page.tsx`)

Stranica koja se prikazuje kada licenca istekne.

**Funkcionalnosti:**
- Prikazuje informacije o korisniku
- Dugme za kontaktiranje administratora (otvara email)
- Dugme za odjavu
- Moderni dizajn sa animacijama

### 5. LicenseGuard (`src/components/LicenseGuard.tsx`)

Komponenta za zaštitu ruta na osnovu licence.

**Funkcionalnosti:**
- Proverava licencu pre pristupa sadržaju
- Preusmerava na `/license-expired` ako licenca nije važeća
- Loading state tokom provere
- Fallback komponenta

### 6. LicenseStatus (`src/components/LicenseStatus.tsx`)

Komponenta za prikaz statusa licence u korisničkom profilu.

**Funkcionalnosti:**
- Prikazuje trenutni status licence
- Detaljne informacije o isteku
- Različite ikone za različite statuse
- Opcija za prikaz/skrivanje detalja

## Integracija u Aplikaciju

### 1. Root Layout (`src/app/layout.tsx`)

```typescript
<AuthProvider>
  <ClientLayoutShell>
    {children}
  </ClientLayoutShell>
</AuthProvider>
```

### 2. ClientLayoutShell (`src/app/ClientLayoutShell.tsx`)

```typescript
<LicenseProvider>
  <LicenseWarning />
  {children}
</LicenseProvider>
```

### 3. Dashboard Layout (`src/app/dashboard/layout.tsx`)

```typescript
<ProtectedRoute>
  <UserOnlyGuard>
    <LicenseGuard>
      {/* Dashboard content */}
    </LicenseGuard>
  </UserOnlyGuard>
</ProtectedRoute>
```

### 4. Admin Layout (`src/app/admin/layout.tsx`)

```typescript
<AdminPanelGuard>
  <LicenseGuard>
    {/* Admin content */}
  </LicenseGuard>
</AdminPanelGuard>
```

### 5. EUK Layout (`src/app/euk/layout.tsx`)

```typescript
<ProtectedRoute>
  <EUKAccessGuard>
    <LicenseGuard>
      {/* EUK content */}
    </LicenseGuard>
  </EUKAccessGuard>
</ProtectedRoute>
```

## API Endpoint-i

Sistem očekuje sledeće backend endpoint-e:

### 1. Provera statusa licence
```
GET /api/licenses/status?userId={userId}
```

**Response:**
```json
{
  "hasValidLicense": true,
  "endDate": "2024-12-31T23:59:59",
  "daysUntilExpiry": 45,
  "isExpiringSoon": false
}
```

### 2. Provera da li korisnik ima važeću licencu
```
GET /api/licenses/check/{userId}
```

**Response:**
```json
{
  "hasValidLicense": true,
  "message": "License is valid"
}
```

### 3. Dobijanje svih licenci korisnika
```
GET /api/licenses/user/{userId}
```

**Response:**
```json
{
  "success": true,
  "licenses": [...],
  "count": 1
}
```

## Korišćenje

### 1. Osnovno korišćenje LicenseContext-a

```typescript
import { useLicense } from '../contexts/LicenseContext';

function MyComponent() {
  const { 
    licenseInfo, 
    isLicenseValid, 
    isLicenseExpired,
    getStatusMessage 
  } = useLicense();

  if (isLicenseExpired) {
    return <div>Licenca je istekla!</div>;
  }

  return <div>{getStatusMessage()}</div>;
}
```

### 2. Korišćenje LicenseGuard-a

```typescript
import LicenseGuard from '../components/LicenseGuard';

function ProtectedPage() {
  return (
    <LicenseGuard>
      <div>Ova stranica je zaštićena licencom</div>
    </LicenseGuard>
  );
}
```

### 3. Korišćenje LicenseStatus komponente

```typescript
import LicenseStatus from '../components/LicenseStatus';

function UserProfile() {
  return (
    <div>
      <h2>Moj profil</h2>
      <LicenseStatus showDetails={true} />
    </div>
  );
}
```

## Konfiguracija

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://euk.onrender.com
```

### Backend URL

Sistem automatski detektuje environment:
- Development: `http://localhost:8080`
- Production: `process.env.NEXT_PUBLIC_API_URL` ili `https://euk.onrender.com`

## Testiranje

### 1. Unit Testovi

```typescript
// licenseService.test.ts
import { licenseService } from '../services/licenseService';

describe('LicenseService', () => {
  it('should check license status', async () => {
    const result = await licenseService.checkLicenseStatus(1, 'token');
    expect(result).toBeDefined();
    expect(result.hasValidLicense).toBeDefined();
  });
});
```

### 2. Integration Testovi

```typescript
// LicenseContext.test.tsx
import { render, screen } from '@testing-library/react';
import { LicenseProvider } from '../contexts/LicenseContext';

describe('LicenseContext', () => {
  it('should provide license context', () => {
    render(
      <LicenseProvider>
        <div>Test</div>
      </LicenseProvider>
    );
    // Test implementation
  });
});
```

## Troubleshooting

### Česti problemi:

1. **CORS greške**: Proverite da li je backend konfigurisan za CORS
2. **401 Unauthorized**: Proverite da li je token validan
3. **License check ne radi**: Proverite da li su API endpoint-i implementirani
4. **Obaveštenja se ne prikazuju**: Proverite da li je LicenseProvider omotan oko aplikacije
5. **HTTP 429 (Rate Limiting)**: Sistem automatski rešava ovo sa retry logikom

### HTTP 429 Rate Limiting Rešenje

Sistem je optimizovan za rešavanje HTTP 429 grešaka:

- **Retry logika**: Automatski pokušava ponovo sa exponential backoff (1s, 2s, 4s)
- **Cache sistem**: Cache-uje licence za 30-60 sekundi da smanji broj zahteva
- **Smart provera**: Automatska provera se izvršava svakih 10 minuta umesto 5
- **Error handling**: Ne prikazuje upozorenja za rate limiting greške
- **Error handler**: Prikazuje privremeno upozorenje o rate limiting-u

### Debug koraci:

1. Proverite Network tab u browser-u za API pozive
2. Proverite Console log-ove za greške
3. Testiraj API endpoint-e direktno sa Postman-om
4. Proverite da li su sve komponente pravilno importovane
5. Za HTTP 429 greške, proverite da li backend ima rate limiting konfiguraciju

## Deployment Checklist

- [ ] Implementirati backend API endpoint-e za licence
- [ ] Testirati sve API endpoint-e
- [ ] Konfigurisati CORS na backend-u
- [ ] Testirati licencnu proveru u različitim scenarijima
- [ ] Testirati obaveštenja o isteku licence
- [ ] Testirati preusmeravanje na license-expired stranicu
- [ ] Testirati automatsku proveru licence svakih 5 minuta

## Napomene

- Sistem automatski proverava licencu kada se korisnik uloguje
- Automatska provera se izvršava svakih 5 minuta
- LicenseWarning se prikazuje na vrhu svih stranica
- LicenseGuard štiti sve glavne rute aplikacije
- Sistem je potpuno integrisan sa postojećim AuthContext-om
