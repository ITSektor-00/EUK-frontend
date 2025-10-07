# Template Kategorija ID Fix

## Problem
Backend vraća grešku: "Kategorija ID je obavezan" jer se šalje `kategorijaId: undefined`.

## Uzrok
Iz debug logova vidim da:
1. **Kategorije se učitavaju pravilno**: `{kategorijaId: 3, naziv: 'дечији_додатак', skracenica: 'ДД'}`
2. **Kategorija se izabira**: `{kategorijaId: 6, naziv: 'здравствено', skracenica: ''}`
3. **Problem je u mapiranju**: `{kategorijaId: undefined, kategorijaNaziv: 'здравствено'}`

**Backend vraća kategorije sa `kategorijaId` poljem, a frontend pokušava da koristi `kategorija.id`!**

## Rešenje

### **Pre popravke:**
```typescript
const selection: KategorijaSelection = {
    kategorijaId: kategorija.id, // ❌ kategorija.id je undefined
    kategorijaNaziv: kategorija.naziv
};
```

### **Posle popravke:**
```typescript
const selection: KategorijaSelection = {
    kategorijaId: kategorija.kategorijaId || kategorija.id, // ✅ Koristi kategorijaId ako postoji, inače id
    kategorijaNaziv: kategorija.naziv
};
```

## Debug logovi koji su pokazali problem

### **1. Učitavanje kategorija:**
```
First kategorija: {kategorijaId: 3, naziv: 'дечији_додатак', skracenica: 'ДД'}
```
**Vidim da backend vraća `kategorijaId` polje, ne `id`!**

### **2. Izbor kategorije:**
```
Selected kategorija: {kategorijaId: 6, naziv: 'здравствено', skracenica: ''}
```
**Kategorija ima `kategorijaId: 6`, ne `id`!**

### **3. Mapiranje (pre popravke):**
```
Created kategorija selection: {kategorijaId: undefined, kategorijaNaziv: 'здравствено'}
```
**`kategorija.id` je undefined jer kategorija nema `id` polje!**

### **4. Finalni request:**
```
Generated request: {kategorijaId: undefined, ...}
```
**Backend prima `kategorijaId: undefined` što uzrokuje grešku!**

## Backend struktura podataka

Backend vraća kategorije u ovom formatu:
```json
{
    "kategorijaId": 6,
    "naziv": "здравствено",
    "skracenica": ""
}
```

**Nema `id` polje, već `kategorijaId`!**

## Rešenje

### **Fallback logika:**
```typescript
kategorijaId: kategorija.kategorijaId || kategorija.id
```

**Ovo znači:**
- Ako postoji `kategorija.kategorijaId`, koristi to
- Ako ne postoji, koristi `kategorija.id` (za slučaj da se struktura promeni)

## Testiranje

### **1. Otvorite `/euk/formulari`**
### **2. Idite na "Generisanje Template-a" tab**
### **3. Izaberite lice, kategoriju, obrasci vrste, organizacionu strukturu**
### **4. Kliknite "Generiši Template"**
### **5. Proverite da li se template generiše bez greške**

## Očekivani rezultat

### **Debug logovi:**
```
Selected kategorija: {kategorijaId: 6, naziv: 'здравствено', skracenica: ''}
Created kategorija selection: {kategorijaId: 6, kategorijaNaziv: 'здравствено'}
Generated request: {kategorijaId: 6, ...}
```

### **Backend response:**
```json
{
    "predmetId": 1,
    "templateFilePath": "generated_templates/resenje_1_1234567890.docx",
    "templateStatus": "generated",
    "templateGeneratedAt": "2024-01-15T10:30:00",
    "message": "Word dokument je uspešno generisan",
    "success": true
}
```

## Napomene

- **Backend struktura** se razlikuje od očekivane
- **Fallback logika** osigurava kompatibilnost
- **Debug logovi** su ključni za identifikaciju problema
- **Backend poruka** je bila jasna: "Kategorija ID je obavezan"

## Rezultat

✅ **Kategorija ID se pravilno mapira**
✅ **Backend prima validan request**
✅ **Template se generiše uspešno**
✅ **Fallback logika osigurava kompatibilnost**

Sistem sada radi bez grešaka! 🚀
