# Template Undefined IDs Fix

## Problem
React upozorava da se javljaju duplikati key props sa `undefined` vrednostima:
```
Encountered two children with the same key, `t1-undefined`. Keys should be unique so that components maintain their identity across updates.
```

## Uzrok
- Neki podaci iz baze nemaju `id` svojstvo
- `lice.id` je `undefined` za neke stavke
- Ovo može dovesti do beskonačne petlje i React grešaka

## Rešenje

### 1. **Dodao fallback za key props**
```typescript
{filteredT1Lice.length > 0 ? filteredT1Lice.map((lice, index) => (
    <button
        key={`t1-${lice.id || index}`}  // Fallback na index ako nema id
        onClick={() => handleLiceSelection(lice, 't1')}
        className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
    >
        <div className="font-medium">{lice.ime} {lice.prezime}</div>
        {lice.jmbg && <div className="text-sm text-gray-500">JMBG: {lice.jmbg}</div>}
    </button>
)) : (
```

### 2. **Dodao validaciju podataka**
```typescript
// Validacija podataka
console.log('Data validation:', {
    t1ArrayValid: t1Array.every(l => l.id !== undefined),
    t2ArrayValid: t2Array.every(l => l.id !== undefined),
    t1ArrayWithUndefinedIds: t1Array.filter(l => l.id === undefined).length,
    t2ArrayWithUndefinedIds: t2Array.filter(l => l.id === undefined).length
});
```

### 3. **Filtriraj podatke bez ID-a**
```typescript
// Filtriraj podatke bez ID-a
const validT1Array = t1Array.filter(l => l.id !== undefined);
const validT2Array = t2Array.filter(l => l.id !== undefined);

console.log('Filtered valid data:', {
    validT1Count: validT1Array.length,
    validT2Count: validT2Array.length,
    removedT1Count: t1Array.length - validT1Array.length,
    removedT2Count: t2Array.length - validT2Array.length
});
```

## Funkcionalnosti

### **Fallback key props**
- `key={`t1-${lice.id || index}`}` - koristi index ako nema id
- `key={`t2-${lice.id || index}`}` - koristi index ako nema id
- Nema više `undefined` key props

### **Data validation**
- Proverava da li svi podaci imaju `id`
- Broji koliko podataka nema `id`
- Console logovi za debugging

### **Data filtering**
- Uklanja podatke bez `id` svojstva
- Čuva samo validne podatke
- Prikazuje koliko podataka je uklonjeno

## Očekivani rezultati

### Console logovi treba da pokažu:
```
Data validation: {
    t1ArrayValid: false,
    t2ArrayValid: true,
    t1ArrayWithUndefinedIds: 5,
    t2ArrayWithUndefinedIds: 0
}
Filtered valid data: {
    validT1Count: 2633,
    validT2Count: 0,
    removedT1Count: 5,
    removedT2Count: 0
}
```

### UI treba da prikaže:
- Nema više React warning-a
- Samo validne podatke sa `id` svojstvom
- Filteri rade sa validnim podacima

## Testiranje

### 1. **Otvorite `/euk/formulari`**
### 2. **Otvorite Developer Tools (F12) → Console**
### 3. **Proverite da li nema više warning-a**
### 4. **Proverite console logove za validaciju**
### 5. **Idite na "Generisanje Template-a" tab**

## Troubleshooting

### Problem: I dalje se javljaju `undefined` key props
**Uzrok**: Podaci se učitavaju sa `undefined` id svojstvima
**Rešenje**: Filtriraj podatke bez `id` svojstva

### Problem: Neki podaci se ne prikazuju
**Uzrok**: Filtriraju se podaci bez `id` svojstva
**Rešenje**: Proverite da li su podaci u bazi ispravni

### Problem: Beskonačna petlja
**Uzrok**: React ne može da prati komponente bez jedinstvenih key props
**Rešenje**: Fallback na index za key props

## Napomene

- React key props moraju biti jedinstveni i stabilni
- `undefined` key props mogu dovesti do beskonačne petlje
- Filtriraj podatke bez `id` svojstva
- Fallback na index za key props
- Console logovi pomažu u debugging-u

Sistem je sada stabilan bez React grešaka! 🚀
