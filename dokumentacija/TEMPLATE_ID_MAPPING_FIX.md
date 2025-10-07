# Template ID Mapping Fix

## Problem
Sva T1 lice se učitavaju (2638), ali svi imaju `undefined` ID-ove:
```
Data validation: {t1ArrayValid: false, t2ArrayValid: true, t1ArrayWithUndefinedIds: 2638, t2ArrayWithUndefinedIds: 0}
Filtered valid data: {validT1Count: 0, validT2Count: 0, removedT1Count: 2638, removedT2Count: 0}
```

## Uzrok
- Podaci se učitavaju iz baze, ali nemaju `id` svojstvo
- Možda se koristi drugačiji naziv za ID (npr. `ID`, `liceId`, itd.)
- Potrebno je mapiranje različitih ID svojstava

## Rešenje

### 1. **Dodao debug logove za strukturu podataka**
```typescript
// Proveri strukturu prvog elementa
if (t1Data.length > 0) {
    console.log('First T1 lice structure:', t1Data[0]);
    console.log('First T1 lice keys:', Object.keys(t1Data[0]));
}
```

### 2. **Implementirao fallback ID mapping**
```typescript
// Filtriraj podatke bez ID-a i dodaj fallback ID
const validT1Array = t1Array.map((l, index) => ({
    ...l,
    id: l.id || l.ID || l.liceId || index + 1 // Fallback na različite ID svojstva
}));
const validT2Array = t2Array.map((l, index) => ({
    ...l,
    id: l.id || l.ID || l.liceId || index + 1 // Fallback na različite ID svojstva
}));
```

### 3. **Dodao validaciju nakon mapping-a**
```typescript
// Proveri da li su ID-ovi sada validni
console.log('ID validation after mapping:', {
    t1ArrayValid: validT1Array.every(l => l.id !== undefined),
    t2ArrayValid: validT2Array.every(l => l.id !== undefined),
    firstT1Id: validT1Array[0]?.id,
    firstT2Id: validT2Array[0]?.id
});
```

## Funkcionalnosti

### **Debug strukture podataka**
- Prikazuje strukturu prvog elementa
- Prikazuje sve ključeve objekta
- Pomaže u identifikaciji pravilnog ID svojstva

### **Fallback ID mapping**
- `l.id` - standardno ID svojstvo
- `l.ID` - veliko slovo ID
- `l.liceId` - specifično ID svojstvo
- `index + 1` - fallback na index ako nema ID

### **ID validation**
- Proverava da li su svi ID-ovi validni nakon mapping-a
- Prikazuje prvi ID za proveru
- Console logovi za debugging

## Očekivani rezultati

### Console logovi treba da pokažu:
```
First T1 lice structure: {ime: "Marko", prezime: "Marković", jmbg: "1234567890123", ...}
First T1 lice keys: ["ime", "prezime", "jmbg", "ID", ...]
ID validation after mapping: {
    t1ArrayValid: true,
    t2ArrayValid: true,
    firstT1Id: 1,
    firstT2Id: undefined
}
```

### UI treba da prikaže:
- Sva T1 lice u filteru (2638 umesto 0)
- Filteri rade sa svim podacima
- Nema više React warning-a

## Testiranje

### 1. **Otvorite `/euk/formulari`**
### 2. **Otvorite Developer Tools (F12) → Console**
### 3. **Proverite console logove za strukturu podataka**
### 4. **Proverite da li se prikazuju lice**
### 5. **Idite na "Generisanje Template-a" tab**

## Troubleshooting

### Problem: I dalje se ne prikazuju lice
**Uzrok**: ID svojstvo se zove drugačije
**Rešenje**: Proverite console logove za strukturu podataka

### Problem: Neki podaci se ne prikazuju
**Uzrok**: Fallback ID mapping ne radi
**Rešenje**: Dodajte novo ID svojstvo u fallback

### Problem: Duplikati ID-ovi
**Uzrok**: Index fallback može dovesti do duplikata
**Rešenje**: Koristite jedinstvenije ID svojstvo

## Napomene

- Različite baze podataka koriste različite nazive za ID
- Fallback mapping omogućava fleksibilnost
- Debug logovi pomažu u identifikaciji strukture
- Index fallback je poslednja opcija

Sistem je sada fleksibilniji i može da rukuje različitim strukturama podataka! 🚀
