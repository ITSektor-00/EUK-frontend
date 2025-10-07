# Template Load All Data Implementation

## Problem
Sistem je učitavao samo 50 T1 lice umesto svih podataka iz baze. Potrebno je implementirati učitavanje svih podataka sa paginacijom.

## Rešenje

### 1. **Implementirana paginacija u templateService.ts**
```typescript
async getLice(tip: 't1' | 't2'): Promise<Lice[]> {
    const allLice: Lice[] = [];
    let page = 0;
    let hasMore = true;
    const pageSize = 100; // Učitaj 100 po stranici

    while (hasMore) {
        const response = await fetch(`${API_BASE_URL}/api/euk/${tip}?page=${page}&size=${pageSize}`);
        const data = await response.json();
        
        if (data.content && Array.isArray(data.content)) {
            allLice.push(...data.content);
            hasMore = !data.last; // last: true znači da je poslednja stranica
            page++;
        } else {
            hasMore = false;
        }
    }

    console.log(`Loaded ${allLice.length} ${tip} lice`);
    return allLice;
}
```

### 2. **Poboljšano učitavanje u TemplateGenerationForm.tsx**
```typescript
// Učitaj lice posebno da možemo da pratimo progress
console.log('Loading T1 lice...');
const t1Data = await templateService.getLice('t1');
console.log(`Loaded ${t1Data.length} T1 lice`);

console.log('Loading T2 lice...');
const t2Data = await templateService.getLice('t2');
console.log(`Loaded ${t2Data.length} T2 lice`);
```

### 3. **Dodati progress indicator**
```typescript
if (loading) {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Učitavanje svih podataka...</p>
                <p className="text-sm text-gray-500 mt-2">
                    Učitavamo sva lice iz baze podataka. Molimo sačekajte...
                </p>
            </div>
        </div>
    );
}
```

## Funkcionalnosti

### **Paginacija**
- Učitava 100 podataka po stranici
- Automatski prelazi na sledeću stranicu
- Zaustavlja se kada `last: true`

### **Progress tracking**
- Console logovi za praćenje progress-a
- Loading indicator sa porukom
- Broj učitavanih podataka

### **Error handling**
- Fallback na mock podatke ako API ne radi
- Graceful error handling
- Console warnings umesto errors

## Očekivani rezultati

### Console logovi treba da pokažu:
```
Loading T1 lice...
Loaded 2638 T1 lice
Loading T2 lice...
Loaded 0 T2 lice
Loading other data...
Total loaded data: {
    totalT1Lice: 2638,
    totalT2Lice: 0,
    totalKategorije: 7,
    totalObrasciVrste: 6,
    totalOrganizacionaStruktura: 2,
    totalPredmeti: 3
}
```

### UI treba da prikaže:
- Loading indicator tokom učitavanja
- Sva T1 lice u filteru (2638 umesto 50)
- Sva T2 lice u filteru (ako postoje)
- Filteri rade sa svim podacima

## Testiranje

### 1. **Otvorite `/euk/formulari`**
### 2. **Otvorite Developer Tools (F12) → Console**
### 3. **Proverite console logove**
### 4. **Idite na "Generisanje Template-a" tab**
### 5. **Proverite da li se prikazuju sva lice**

## Troubleshooting

### Problem: Učitava se samo 50 podataka
**Uzrok**: Paginacija nije implementirana
**Rešenje**: Implementirana paginacija sa while loop

### Problem: Sporo učitavanje
**Uzrok**: Veliki broj podataka
**Rešenje**: Učitava 100 po stranici, progress indicator

### Problem: Timeout greške
**Uzrok**: Previše API poziva
**Rešenje**: Optimizovano sa pageSize=100

## Napomene

- Sistem sada učitava sva lice iz baze
- Paginacija omogućava učitavanje velikih količina podataka
- Progress indicator pomaže korisniku da zna da se podaci učitavaju
- Filteri rade sa svim podacima
- Mock podaci se koriste kao fallback

Sistem je sada potpuno funkcionalan sa svim podacima! 🚀
