# Frontend Poboljšanja - Error Handling i Retry Logika

## Pregled problema koji su rešeni

### 1. Neispravni credentials - uzrok 401 grešaka

**Problem:** 
- `AuthContext.tsx` je proveravao `response.error` polje koje backend verovatno ne vraća
- Nedostajala validacija token-a i credentials-a
- Loš error handling u login/register funkcijama

**Rešenje:**
- Uklonjena provera `response.error` polja
- Dodana validacija da response sadrži `token`
- Poboljšana validacija credentials-a u `signIn` i `signUp` funkcijama
- Dodana validacija token-a u `getCurrentUser` funkciji

```typescript
// Pre:
if (response.error) {
  throw new Error(response.error);
}

// Posle:
if (!response || !response.token) {
  throw new Error('Neispravan odgovor od servera. Token nije pronađen.');
}
```

### 2. Loš error handling - uzrok application grešaka

**Problem:**
- Nedosledan error handling kroz aplikaciju
- Nedostatak specifičnih poruka za različite tipove grešaka
- Loš error handling u `loadUser` funkciji

**Rešenje:**
- Poboljšan error handling u `AuthContext.tsx`
- Dodane specifične poruke za različite HTTP status kodove
- Poboljšana logika u `loadUser` funkciji koja ne briše sesiju za sve greške

```typescript
// Poboljšana logika u loadUser:
if (errorMessage.includes('401') || errorMessage.includes('sesija') || errorMessage.includes('token')) {
  console.warn('Token je istekao ili je nevažeći, brišem sesiju');
  logout();
} else {
  console.warn('Greška pri učitavanju korisnika, ali zadržavam sesiju:', errorMessage);
}
```

### 3. Dodana retry logika za failed requests

**Problem:**
- Nedostajala retry logika za network greške
- `useApi` hook je imao osnovni error handling

**Rešenje:**
- Poboljšan `useApi` hook sa naprednom retry logikom
- Dodana eksponencijalna backoff strategija
- Retry logika za network greške, timeout greške, i 5xx greške
- Ne retry-uje za 401/403 greške

```typescript
const shouldRetry = (error: Error, attempt: number, maxRetries: number): boolean => {
  if (attempt >= maxRetries) return false;
  
  const retryableErrors = ['Failed to fetch', 'NetworkError', 'timeout', 'ECONNRESET', 'ENOTFOUND'];
  const retryableStatuses = [500, 502, 503, 504, 408, 429];
  
  // Retry logika...
};
```

## Poboljšanja u API servisu

### 1. Poboljšana validacija

```typescript
// Validacija credentials-a:
if (!credentials.usernameOrEmail || !credentials.password) {
  throw new Error('Korisničko ime/email i lozinka su obavezni');
}

// Validacija token-a:
if (!token || typeof token !== 'string' || token.trim() === '') {
  throw new Error('Token je obavezan i ne može biti prazan');
}
```

### 2. Specifične error poruke

```typescript
if (response.status === 401) {
  throw new Error('Neispravno korisničko ime ili lozinka');
} else if (response.status === 403) {
  throw new Error('Nalog nije odobren od strane administratora');
} else if (response.status === 429) {
  throw new Error('Previše pokušaja prijave. Molimo sačekajte malo');
}
```

### 3. Poboljšana retry logika u API servisu

- Dodana retry logika za 5xx greške
- Eksponencijalna backoff strategija
- Bolje logovanje za debugging

## Novi komponenti

### ErrorBoundary

Kreiran je novi `ErrorBoundary` komponent koji:
- Hvata JavaScript greške u React komponentama
- Prikazuje user-friendly error poruku
- Omogućava restart aplikacije
- Prikazuje detalje greške u development modu

## Korišćenje

### useApi hook sa retry logikom

```typescript
const { apiCall, loading, error } = useApi();

// Osnovno korišćenje
const data = await apiCall('/api/endpoint');

// Sa custom retry opcijama
const data = await apiCall('/api/endpoint', {}, {
  maxRetries: 5,
  retryDelay: 2000,
  retryCondition: (error) => error.message.includes('timeout')
});
```

### useRetry hook

```typescript
const { executeWithRetry, isRetrying, retryCount } = useRetry({
  maxRetries: 3,
  baseDelay: 1000,
  shouldRetry: (error) => error.status >= 500
});

const result = await executeWithRetry(async () => {
  return await apiService.someApiCall();
});
```

## Testiranje

Da testirate poboljšanja:

1. **Testirajte login sa neispravnim credentials-ima** - trebalo bi da dobijete jasnu poruku
2. **Testirajte network greške** - aplikacija treba da retry-uje automatski
3. **Testirajte istekle token-e** - sesija treba da se obriše automatski
4. **Testirajte error boundary** - prikažite grešku u komponenti da vidite ErrorBoundary

## Monitoring i debugging

- Svi API pozivi su logovani sa detaljima
- Retry pokušaji su logovani sa timing informacijama
- Error poruke su specifične i user-friendly
- Development mode prikazuje dodatne debug informacije

## Buduća poboljšanja

- Dodavanje offline support-a
- Implementacija request queuing
- Dodavanje metrics-a za error rate
- Implementacija circuit breaker pattern-a
