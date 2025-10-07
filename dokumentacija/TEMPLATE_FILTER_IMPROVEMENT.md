# Template Filter Improvement

## Problem
Filteri za lice su radili samo sa imenom, a ne sa imenom i prezimena zajedno.

## Rešenje

### 1. **Poboljšana filter funkcija**
```typescript
const filterLice = (lice: Lice[], filter: string) => {
    if (!filter) return lice;
    const searchTerm = filter.toLowerCase();
    return lice.filter(l => {
        const fullName = `${l.ime} ${l.prezime}`.toLowerCase();
        return fullName.includes(searchTerm) ||
               l.ime.toLowerCase().includes(searchTerm) ||
               l.prezime.toLowerCase().includes(searchTerm) ||
               (l.jmbg && l.jmbg.includes(filter));
    });
};
```

### 2. **Poboljšani placeholder tekstovi**
```typescript
placeholder="Pretraži po imenu, prezimenu ili JMBG..."
```

## Funkcionalnosti

### **Multi-field pretraživanje**
- **Puno ime**: `"Marko Marković"` - pretražuje kombinaciju imena i prezimena
- **Ime**: `"Marko"` - pretražuje samo ime
- **Prezime**: `"Marković"` - pretražuje samo prezime
- **JMBG**: `"1234567890123"` - pretražuje JMBG

### **Case-insensitive pretraživanje**
- Automatsko pretvaranje u lowercase
- Pretraživanje radi bez obzira na velika/mala slova

### **Flexible search**
- Možete pretraživati bilo koji deo imena ili prezimena
- Kombinacija imena i prezimena
- JMBG pretraživanje

## Primeri pretraživanja

### **Pretraživanje po punom imenu**
- Unesite: `"Marko Marković"`
- Pronaći će: Marko Marković

### **Pretraživanje po imenu**
- Unesite: `"Marko"`
- Pronaći će: Marko Marković, Marko Petrović, itd.

### **Pretraživanje po prezimenu**
- Unesite: `"Marković"`
- Pronaći će: Marko Marković, Ana Marković, itd.

### **Pretraživanje po JMBG**
- Unesite: `"1234567890123"`
- Pronaći će: lice sa tim JMBG-om

### **Pretraživanje po delu imena**
- Unesite: `"Mar"`
- Pronaći će: Marko, Marija, Marina, itd.

## UI/UX poboljšanja

### **Jasni placeholder tekstovi**
- "Pretraži po imenu, prezimenu ili JMBG..."
- Objašnjava korisniku kako da koristi filter

### **Real-time pretraživanje**
- Filteri se primenjuju odmah dok korisnik kuca
- Nema potrebe za klik na dugme "Pretraži"

### **Broj rezultata**
- Prikazuje broj filtriranih rezultata
- Pomaže korisniku da zna koliko rezultata ima

## Testiranje

### 1. **Otvorite `/euk/formulari`**
### 2. **Idite na "Generisanje Template-a" tab**
### 3. **Testirajte različite pretrage:**
   - Unesite puno ime: "Marko Marković"
   - Unesite samo ime: "Marko"
   - Unesite samo prezime: "Marković"
   - Unesite deo imena: "Mar"
   - Unesite JMBG: "1234567890123"

### 4. **Proverite da li se prikazuju odgovarajući rezultati**

## Napomene

- Filteri rade sa svim podacima (T1 i T2 lice)
- Pretraživanje je case-insensitive
- JMBG pretraživanje radi sa originalnim formatom
- Filteri se resetuju kada se promeni korak

Sistem je sada mnogo korisniji za pretraživanje lice! 🚀
