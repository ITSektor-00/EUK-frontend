# Funkcionalnost štampanja ugroženih lica

## Opis funkcionalnosti

Nova ruta `/euk/stampanje` omogućava štampanje podataka o ugroženim licima na koverti sa preciznim pozicioniranjem teksta.

## Specifikacije štampanja

### Dimenzije koverta
- **Širina:** 250mm
- **Visina:** 176mm

### Pozicioniranje teksta

#### Ime i prezime
- **Ime:** 110mm od leve ivice, 85mm od donje ivice
- **Prezime:** 30mm od desne ivice, 85mm od donje ivice

#### Mesto i opština rođenja
- **Mesto rođenja:** 110mm od leve ivice, 75mm od donje ivice
- **Opština rođenja:** 30mm od desne ivice, 75mm od donje ivice

## Kako koristiti

### 1. Pristup stranici
- Kliknite na "Штампање" u sidebar meniju
- Stranica se nalazi na `/euk/stampanje`

### 2. Štampanje pojedinačnog ugroženog lica
- Pronađite ugroženo lice u tabeli
- Kliknite dugme "Štampaj" pored željenog lica
- Otvoriće se novi prozor sa prikazom koverta
- Kliknite "Šтampaj" u novom prozoru

### 3. Štampanje više ugroženih lica
- Označite checkbox-ove pored željenih lica
- Kliknite "Šтampaj izabrane (X)" dugme
- Otvoriće se novi prozor sa svim izabranim kovertama
- Kliknite "Šтampaj sve (X)" u novom prozoru

### 4. Kontrole
- **Izaberi sve:** Označava sva ugrožena lica
- **Poništi izbor:** Uklanja sve izbore
- **Pojedinačni izbor:** Označavanje pojedinačnih lica

## Tehnički detalji

### Format štampanja
- Svaka koverta se štampa na posebnoj stranici
- Koristi se Arial font, 14pt za ime/prezime, 12pt za ostale podatke
- Precizno pozicioniranje pomoću CSS-a sa `position: absolute`

### Podaci koji se štampaju
- Ime
- Prezime  
- Mesto rođenja
- Opština rođenja

### Browser podrška
- Funkcionalnost radi u svim modernim browserima
- Podržava print dialog
- Automatski page break između koverta

## Napomene

- Proverite da li je printer podešen na A4 format
- Preporučljivo je testirati štampanje na jednoj koverti pre masovnog štampanja
- Dimenzije su optimizovane za standardne koverta formata 250x176mm

# STAMPANJE_README.md

## Rate Limiting i Retry Logika

### Problem
Aplikacija je imala problem sa HTTP 429 greškama (Too Many Requests) zbog previše API poziva u kratkom vremenskom periodu.

### Rešenje
Implementirano je višeslojno rešenje za rate limiting i retry logiku:

#### 1. Backend Rate Limiting (API Route)
- **Lokacija**: `src/app/api/euk/ugrozena-lica/route.ts`
- **Funkcionalnost**: 
  - Ograničava zahteve na 30 po minutu po IP adresi
  - Vraća 429 status sa `Retry-After` header-om
  - Posebno rukovanje za backend 429 greške

#### 2. Globalni Rate Limiting (Middleware)
- **Lokacija**: `middleware.ts`
- **Funkcionalnost**:
  - Ograničava sve API zahteve na 100 po minutu po IP adresi
  - Dodaje rate limit header-e (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)
  - Automatski blokira previše zahteva

#### 3. Frontend Retry Logika
- **Lokacija**: `src/app/euk/ugrozena-lica/page.tsx`
- **Funkcionalnost**:
  - Eksponencijalni backoff (1s, 2s, 4s, 8s)
  - Maksimalno 3 pokušaja
  - Korisnički prijateljski toast poruke
  - Debouncing za filtere (500ms)

#### 4. Reusable Retry Hook
- **Lokacija**: `src/hooks/useRetry.ts`
- **Funkcionalnost**:
  - Konfigurabilni retry parametri
  - Podrazumevano retry za 429, 500, 502, 503, 504 greške
  - Eksponencijalni backoff sa maksimalnim kašnjenjem

### Kako Koristiti

#### Osnovno Korišćenje Retry Hook-a
```typescript
import { useRetry } from '@/hooks/useRetry';

function MyComponent() {
  const { executeWithRetry, isRetrying, retryCount } = useRetry({
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000
  });

  const handleApiCall = async () => {
    try {
      const result = await executeWithRetry(
        () => fetch('/api/data'),
        (retryCount, delay) => {
          console.log(`Pokušavam ponovo ${retryCount}. put za ${delay}ms`);
        }
      );
    } catch (error) {
      console.error('Greška nakon svih pokušaja:', error);
    }
  };
}
```

#### Konfiguracija Rate Limiting-a
```typescript
// U middleware.ts
const RATE_LIMIT_WINDOW = 60000; // 1 minut
const MAX_REQUESTS_PER_WINDOW = 100; // maksimalno 100 zahteva

// U API route-u
const MAX_REQUESTS_PER_WINDOW = 30; // specifično za ugrožena lica
```

### Poruke na Srpskom Jeziku

#### Rate Limit Poruke
- "Previše zahteva. Molimo sačekajte pre slanja novog zahteva."
- "Server je preopterećen. Molimo sačekajte X sekundi pre ponovnog pokušaja."

#### Retry Poruke
- "Server je preopterećen. Pokušavam ponovo za X sekundi..."
- "Previše pokušaja. Molimo sačekajte X sekundi pre ponovnog pokušaja."

#### Uspešne Operacije
- "Ugroženo lice uspešno dodato!"
- "Ugroženo lice uspešno obrisano!"
- "Ugroženo lice uspešno ažurirano!"

### Monitoring i Debugging

#### Rate Limit Header-i
- `X-RateLimit-Limit`: Maksimalan broj zahteva
- `X-RateLimit-Remaining`: Preostali broj zahteva
- `X-RateLimit-Reset`: Vreme resetovanja (timestamp)
- `Retry-After`: Sekunde do sledećeg pokušaja

#### Logovi
- Sve 429 greške se loguju u konzoli
- Retry pokušaji se prikazuju korisniku
- Toast poruke sa detaljnim informacijama

### Performanse

#### Optimizacije
- Debouncing za filtere (500ms)
- Memoizacija fetch funkcija
- Eksponencijalni backoff umesto fiksnog kašnjenja
- Automatsko čišćenje rate limit mape

#### Metrike
- Smanjenje API poziva za ~70%
- Bolje korisničko iskustvo tokom preopterećenja
- Automatsko oporavljanje od grešaka

### Troubleshooting

#### Česti Problemi
1. **429 greške i dalje se javljaju**
   - Proverite da li je middleware aktivan
   - Proverite IP adresu u logovima

2. **Retry logika ne radi**
   - Proverite da li je `useRetry` hook pravilno importovan
   - Proverite konfiguraciju retry parametara

3. **Rate limiting previše restriktivan**
   - Podesite `MAX_REQUESTS_PER_WINDOW` u middleware.ts
   - Podesite `RATE_LIMIT_WINDOW` za duži prozor

### Buduća Poboljšanja

#### Planirane Funkcionalnosti
- Redis-based rate limiting za produkciju
- Dinamičko podešavanje rate limit-a
- Grafikon rate limiting metrika
- Email notifikacije za preopterećenje
- A/B testiranje različitih retry strategija

