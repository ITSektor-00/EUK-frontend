# EUK Frontend Platforma

## Rate Limiting i Retry Logika

### Problem sa HTTP 429 Greškama
Aplikacija je imala problem sa previše API poziva koji su rezultirali HTTP 429 greškama (Too Many Requests). Ovo je rešeno implementacijom višeslojnog sistema za rate limiting i retry logiku.

### Implementirana Rešenja

#### 1. Backend Rate Limiting
- **API Route Level**: Ograničava zahteve na 30 po minutu po IP adresi
- **Global Level**: Middleware ograničava sve API zahteve na 100 po minutu po IP adresi

#### 2. Frontend Retry Logika
- **Eksponencijalni Backoff**: Automatski pokušava ponovo sa rastućim kašnjenjem (1s, 2s, 4s, 8s)
- **Maksimalno 3 Pokušaja**: Pre nego što prikaže grešku korisniku
- **Debouncing**: Filteri čekaju 500ms pre slanja zahteva

#### 3. Korisnički Prijateljski UI
- **Toast Poruke**: Jasne poruke na srpskom jeziku
- **Loading States**: Vizuelni indikatori za retry pokušaje
- **Rate Limit Info**: Prikazuje preostale zahteve i vreme resetovanja

### Kako Koristiti

#### Osnovno Korišćenje
```typescript
import { useRetry } from '@/hooks/useRetry';

const { executeWithRetry, isRetrying } = useRetry();

const handleApiCall = async () => {
  try {
    const result = await executeWithRetry(() => fetch('/api/data'));
  } catch (error) {
    console.error('Greška nakon svih pokušaja:', error);
  }
};
```

#### Konfiguracija
```typescript
// middleware.ts - globalni rate limit
const MAX_REQUESTS_PER_WINDOW = 100; // zahteva po minuti

// API route - specifični rate limit
const MAX_REQUESTS_PER_WINDOW = 30; // za ugrožena lica
```

### Poruke na Srpskom Jeziku
- "Server je preopterećen. Pokušavam ponovo za X sekundi..."
- "Previše zahteva. Molimo sačekajte pre slanja novog zahteva."
- "Ugroženo lice uspešno dodato/obrisano/ažurirano!"

### Performanse
- **Smanjenje API poziva**: ~70% manje nepotrebnih zahteva
- **Bolje UX**: Automatsko oporavljanje od grešaka
- **Monitoring**: Rate limit header-i za debugging

### Dokumentacija
Detaljna dokumentacija se nalazi u `dokumentacija/STAMPANJE_README.md`

## Instalacija i Pokretanje

```bash
npm install
npm run dev
```

## Struktura Projekta

```
src/
├── app/                    # Next.js 13+ app router
├── components/            # Reusable komponente
├── hooks/                # Custom hooks (uključujući useRetry)
├── contexts/             # React contexts
└── services/             # API servisi
```

## Tehnologije
- Next.js 13+
- TypeScript
- Tailwind CSS
- React Hooks
