# Template Debug - Kategorija Problem

## Problem
Frontend šalje `kategorijaId: undefined` u request-u, što znači da kategorija nije pravilno mapirana.

## Debug proces

### **1. Dodani debug logovi u handleKategorijaSelection**
```typescript
const handleKategorijaSelection = (kategorija: Kategorija) => {
    console.log('Selected kategorija:', kategorija);
    const selection: KategorijaSelection = {
        kategorijaId: kategorija.id,
        kategorijaNaziv: kategorija.naziv
    };
    console.log('Created kategorija selection:', selection);
    
    setFormData(prev => ({ ...prev, kategorijaSelection: selection }));
    setCurrentStep(2);
};
```

### **2. Dodani debug logovi u handleGenerateTemplate**
```typescript
console.log('Form data:', formData);
console.log('Kategorija selection:', formData.kategorijaSelection);

const request = {
    liceId: formData.liceSelection.liceId,
    liceTip: formData.liceSelection.liceTip,
    kategorijaId: formData.kategorijaSelection.kategorijaId,
    obrasciVrsteId: formData.obrasciVrsteSelection.obrasciVrsteId,
    organizacionaStrukturaId: formData.organizacionaStrukturaSelection.organizacionaStrukturaId,
    predmetId: 1
};

console.log('Generated request:', request);
```

### **3. Dodani debug logovi u loadInitialData**
```typescript
console.log('Setting kategorije:', kategorijeArray);
console.log('First kategorija:', kategorijeArray[0]);
```

## Mogući uzroci

### **1. Kategorija se ne učitava**
- Backend endpoint `/api/kategorije` ne radi
- Mock data se ne učitava pravilno
- Kategorije array je prazan

### **2. Kategorija se ne izabira**
- Korisnik ne klikne na kategoriju
- handleKategorijaSelection se ne poziva
- formData.kategorijaSelection ostaje null

### **3. Kategorija nema id polje**
- Backend vraća kategorije sa drugim strukturom
- Mock data nema id polje
- Mapiranje je pogrešno

### **4. State se ne ažurira**
- setFormData ne radi
- formData.kategorijaSelection ostaje null
- React state update problem

## Testiranje

### **1. Otvorite `/euk/formulari`**
### **2. Otvorite Developer Tools (F12)**
### **3. Idite na Console tab**
### **4. Pratite debug logove:**
   - "Setting kategorije:" - da li se kategorije učitavaju
   - "First kategorija:" - struktura kategorije
   - "Selected kategorija:" - da li se kategorija izabira
   - "Created kategorija selection:" - da li se selection kreira
   - "Form data:" - da li se state ažurira
   - "Generated request:" - finalni request

### **5. Proverite da li se javljaju greške:**
   - Network tab - da li se API pozivi izvršavaju
   - Console - da li postoje JavaScript greške
   - React DevTools - da li se state ažurira

## Očekivani rezultati

### **Učitavanje kategorija:**
```
Setting kategorije: [{id: 1, naziv: "Kategorija 1", opis: "Opis kategorije 1"}, ...]
First kategorija: {id: 1, naziv: "Kategorija 1", opis: "Opis kategorije 1"}
```

### **Izbor kategorije:**
```
Selected kategorija: {id: 1, naziv: "Kategorija 1", opis: "Opis kategorije 1"}
Created kategorija selection: {kategorijaId: 1, kategorijaNaziv: "Kategorija 1"}
```

### **Generisanje request-a:**
```
Form data: {kategorijaSelection: {kategorijaId: 1, kategorijaNaziv: "Kategorija 1"}, ...}
Kategorija selection: {kategorijaId: 1, kategorijaNaziv: "Kategorija 1"}
Generated request: {kategorijaId: 1, ...}
```

## Rešenja

### **Ako se kategorije ne učitavaju:**
- Proverite backend endpoint
- Proverite mock data
- Proverite network requests

### **Ako se kategorija ne izabira:**
- Proverite UI komponentu
- Proverite onClick handler
- Proverite React state

### **Ako kategorija nema id:**
- Proverite backend response
- Proverite mock data strukturu
- Ažurirajte mapiranje

### **Ako se state ne ažurira:**
- Proverite React state management
- Proverite setFormData poziv
- Proverite component re-render

## Napomene

- **Debug logovi** su privremeni i treba ih ukloniti nakon rešavanja
- **Console logovi** pomažu u identifikaciji problema
- **Network tab** pokazuje API pozive
- **React DevTools** pokazuje component state

## Rezultat

✅ **Debug logovi dodati**
✅ **Moguće identifikovati problem**
✅ **Testiranje procesa definisan**
✅ **Rešenja za sve scenarije**

Sada možete da testirate i vidite gde je problem! 🔍
