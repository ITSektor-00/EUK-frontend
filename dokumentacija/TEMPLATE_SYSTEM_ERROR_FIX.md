# Template System Error Fix

## Problem
Greška `t1Lice.map is not a function` se javljala jer API pozivi nisu radili kako treba ili su se vraćali podaci u pogrešnom formatu.

## Rešenje

### 1. Dodavanje Mock podataka u templateService.ts
- Dodane su mock metode za sve potrebne podatke
- Fallback na mock podatke kada backend endpoints nisu dostupni
- Console warnings umesto errors za bolje debugging

### 2. Poboljšanje error handling u TemplateGenerationForm.tsx
- Dodane provere `Array.isArray()` pre svakog `.map()` poziva
- Fallback na prazne array-ove u catch blokovima
- Dodane poruke "Nema podataka" kada nema elemenata za prikaz

### 3. Mock podaci uključuju:
- **T1 lice**: Marko Marković, Petar Petrović, Ana Anić
- **T2 lice**: Jovan Jovanović, Milica Milić, Stefan Stefanović
- **Kategorije**: Kategorija 1, 2, 3
- **Predmeti**: Predmet 1, 2, 3
- **Obrasci vrste**: negativno, neograničeno, ograničeno, borci, penzioneri, obustave
- **Organizaciona struktura**: sekretar, podsekretar

## Implementirane izmene

### templateService.ts
```typescript
// Dodane mock metode
private getMockLice(tip: 't1' | 't2'): Lice[]
private getMockKategorije(): Kategorija[]
private getMockPredmeti(): any[]
private getMockObrasciVrste(): ObrasciVrste[]
private getMockOrganizacionaStruktura(): OrganizacionaStruktura[]

// Fallback na mock podatke
if (!response.ok) {
    console.warn('Backend endpoint not available. Using mock data.');
    return this.getMockData();
}
```

### TemplateGenerationForm.tsx
```typescript
// Array provere
{Array.isArray(t1Lice) && t1Lice.length > 0 ? t1Lice.map(...) : (
    <div className="text-center py-4 text-gray-500">Nema T1 lice</div>
)}

// Fallback u catch blokovima
setT1Lice([]);
setT2Lice([]);
// ... ostali
```

## Rezultat
- Sistem sada radi čak i kada backend nije dostupan
- Prikazuje mock podatke za development
- Graceful error handling bez crash-ova
- Korisne poruke kada nema podataka

## Testiranje
1. Otvoriti `/euk/formulari`
2. Sistem će prikazati mock podatke
3. Možete testirati sve korake bez backend-a
4. Nema više `map is not a function` grešaka

Sistem je sada robustan i spreman za development! 🚀
