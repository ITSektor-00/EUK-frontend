# AuthErrorPopup - Dokumentacija

## Pregled
AuthErrorPopup je komponenta za prikazivanje lepih popup-ova za autentifikacijske greške. Komponenta podržava različite tipove grešaka sa specifičnim porukama, ikonama i akcijama.

## Tipovi grešaka

### 1. INVALID_CREDENTIALS
- **Title**: "Neispravni podaci"
- **Message**: "Korisničko ime ili lozinka nisu ispravni. Proverite podatke i pokušajte ponovo."
- **Icon**: 🔐
- **Action**: "Proverite podatke"

### 2. USER_NOT_FOUND
- **Title**: "Korisnik ne postoji"
- **Message**: "Korisnik sa tim podacima ne postoji u sistemu. Proverite korisničko ime ili email."
- **Icon**: 👤
- **Action**: "Registrujte se" (preusmerava na `/register`)

### 3. ACCOUNT_PENDING
- **Title**: "Nalog čeka odobrenje"
- **Message**: "Vaš nalog čeka odobrenje od administratora. Kontaktirajte administratora za više informacija."
- **Icon**: ⏳
- **Action**: "Kontaktirajte administratora"

### 4. NETWORK_ERROR
- **Title**: "Greška konekcije"
- **Message**: "Nema konekcije sa serverom. Proverite internet konekciju i pokušajte ponovo."
- **Icon**: 🌐
- **Action**: "Pokušajte ponovo"

## Korišćenje

### Osnovno korišćenje
```tsx
import AuthErrorPopup, { AuthError } from './AuthErrorPopup';

const [authError, setAuthError] = useState<AuthError | null>(null);

// Prikaži grešku
setAuthError({
  type: 'INVALID_CREDENTIALS',
  message: 'Korisničko ime ili lozinka nisu ispravni',
  title: '',
  icon: ''
});

// U JSX-u
{authError && (
  <AuthErrorPopup 
    error={authError}
    onClose={() => setAuthError(null)}
    onRetry={() => {
      setAuthError(null);
      // Retry logika
    }}
  />
)}
```

### Korišćenje sa useAuthError hook-om
```tsx
import { useAuthError } from '../hooks/useAuthError';

const { authError, showInvalidCredentials, hideError } = useAuthError();

// Prikaži grešku
showInvalidCredentials('Pogrešna lozinka');

// U JSX-u
{authError && (
  <AuthErrorPopup 
    error={authError}
    onClose={hideError}
    onRetry={hideError}
  />
)}
```

### Korišćenje sa GlobalErrorHandler-om
```tsx
import { useGlobalError } from './GlobalErrorHandler';

const { showAuthError } = useGlobalError();

// Prikaži grešku bilo gde u aplikaciji
showAuthError({
  type: 'NETWORK_ERROR',
  message: 'Nema konekcije sa serverom',
  title: '',
  icon: ''
});
```

## Stilizovanje

Komponenta koristi inline stilove sa sledećim karakteristikama:
- **Pozicija**: Fixed, centrirana na ekranu
- **Background**: Crveni gradijent (#ff6b6b → #ee5a52)
- **Animacije**: slideIn i fadeIn efekti
- **Responsive**: Prilagođava se mobilnim uređajima

## API Error Mapping

Backend greške se mapiraju na AuthError tipove:

```typescript
// Backend error → AuthError type
'Pogrešno korisničko ime/email pri prijavi' → 'USER_NOT_FOUND'
'Pogrešna lozinka' → 'INVALID_CREDENTIALS'
'Nalog je deaktiviran' → 'ACCOUNT_PENDING'
'Greška konekcije sa serverom' → 'NETWORK_ERROR'
```

## Integracija sa postojećim kodom

AuthErrorPopup je već integrisan u:
- `LoginForm.tsx` - za login greške
- `api.ts` - poboljšano error handling
- `AuthContext.tsx` - autentifikacijske greške

## Responsive Design

Komponenta je potpuno responsive sa:
- Desktop: 400px max-width
- Mobile: calc(100% - 2rem) sa 1rem margin
- Padding se prilagođava veličini ekrana
