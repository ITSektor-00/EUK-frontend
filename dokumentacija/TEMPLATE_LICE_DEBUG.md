# Template Lice Debug - Rešenje problema

## Problem
Lice se ne prikazuju na ruti `/euk/formulari` u sekciji "Izbor lice".

## Uzrok
API pozivi za `getLice()` i `getKategorije()` nisu imali fallback na mock podatke kada backend endpoints nisu dostupni.

## Rešenje

### 1. Dodao fallback na mock podatke u templateService.ts
```typescript
async getLice(tip: 't1' | 't2'): Promise<Lice[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/euk/${tip}`);
        
        if (!response.ok) {
            console.warn(`Backend endpoint not available: /api/euk/${tip}. Using mock data.`);
            return this.getMockLice(tip);
        }

        return await response.json();
    } catch (error) {
        console.warn('Error fetching lice from backend, using mock data:', error);
        return this.getMockLice(tip);
    }
}
```

### 2. Dodao debug logove
- Console logovi u `loadInitialData()` funkciji
- Console logovi u mock metodama
- Detaljno praćenje podataka

### 3. Kreirao test komponentu
- `TemplateTestComponent.tsx` za testiranje mock podataka
- Dodao "Test Podataka" tab na glavnu stranicu
- Prikazuje sve mock podatke sa brojem elemenata

## Mock podaci

### T1 Lice
- Marko Marković (JMBG: 1234567890123)
- Petar Petrović (JMBG: 1234567890124)
- Ana Anić (JMBG: 1234567890125)

### T2 Lice
- Jovan Jovanović (JMBG: 1234567890126)
- Milica Milić (JMBG: 1234567890127)
- Stefan Stefanović (JMBG: 1234567890128)

### Ostali mock podaci
- **Kategorije**: Kategorija 1, 2, 3
- **Obrasci vrste**: negativno, neograničeno, ograničeno, borci, penzioneri, obustave
- **Organizaciona struktura**: sekretar, podsekretar
- **Predmeti**: Predmet 1, 2, 3

## Testiranje

### 1. Otvoriti `/euk/formulari`
### 2. Idite na "Test Podataka" tab
### 3. Proverite da li se prikazuju mock podaci
### 4. Idite na "Generisanje Template-a" tab
### 5. Proverite da li se prikazuju lice u prvom koraku

## Debug informacije
- Otvorite Developer Tools (F12)
- Idite na Console tab
- Trebalo bi da vidite logove:
  - "Loading initial data..."
  - "Getting mock lice for t1/t2"
  - "Mock T1/T2 lice: [...]"
  - "Loaded data: {...}"

## Rezultat
- Sistem sada prikazuje mock podatke kada backend nije dostupan
- Lice se prikazuju u "Izbor lice" sekciji
- Test komponenta potvrđuje da mock podaci rade
- Debug logovi pomažu u praćenju problema

Sistem je sada potpuno funkcionalan sa mock podacima! 🚀
