# Template Filters Implementation

## Pregled
Dodati su filteri za sve korake u Template Generation Form komponenti da omoguće lakše pretraživanje i navigaciju kroz velike količine podataka.

## Implementirani filteri

### 1. **Lice filteri**
- **T1 lice filter**: Pretraživanje po imenu, prezimenu ili JMBG
- **T2 lice filter**: Pretraživanje po imenu, prezimenu ili JMBG
- **Broj rezultata**: Prikazuje broj filtriranih rezultata
- **Placeholder**: "Pretraži T1/T2 lice..."

### 2. **Kategorije filter**
- **Pretraživanje**: Po nazivu ili opisu
- **Broj rezultata**: "Prikazano X od Y kategorija"
- **Placeholder**: "Pretraži kategorije..."

### 3. **Obrasci vrste filter**
- **Pretraživanje**: Po nazivu ili opisu
- **Broj rezultata**: "Prikazano X od Y obrasci vrste"
- **Placeholder**: "Pretraži obrasci vrste..."

### 4. **Organizaciona struktura filter**
- **Pretraživanje**: Po nazivu ili opisu
- **Broj rezultata**: "Prikazano X od Y organizacione strukture"
- **Placeholder**: "Pretraži organizacionu strukturu..."

### 5. **Predmeti filter**
- **Pretraživanje**: Po nazivu, opisu ili ID-u
- **Broj rezultata**: "Prikazano X od Y predmeta"
- **Placeholder**: "Pretraži predmete..."

## Funkcionalnosti

### **Real-time pretraživanje**
- Filteri se primenjuju odmah dok korisnik kuca
- Nema potrebe za klik na dugme "Pretraži"

### **Case-insensitive pretraživanje**
- Pretraživanje radi bez obzira na velika/mala slova
- Automatsko pretvaranje u lowercase

### **Multi-field pretraživanje**
- Lice: ime, prezime, JMBG
- Kategorije: naziv, opis
- Obrasci vrste: naziv, opis
- Organizaciona struktura: naziv, opis
- Predmeti: naziv, opis, ID

### **Broj rezultata**
- Prikazuje broj filtriranih rezultata
- Pomaže korisniku da zna koliko rezultata ima

### **Empty state poruke**
- "Nema rezultata pretrage" - kada filter ne daje rezultate
- "Nema podataka" - kada nema podataka uopšte

## UI/UX poboljšanja

### **Responsive design**
- Filteri se prilagođavaju različitim veličinama ekrana
- Grid layout za T1/T2 lice

### **Visual feedback**
- Hover efekti na dugmićima
- Focus ring na input poljima
- Loading states

### **Accessibility**
- Proper labels i placeholders
- Keyboard navigation
- Screen reader friendly

## Tehnička implementacija

### **State management**
```typescript
const [t1Filter, setT1Filter] = useState('');
const [t2Filter, setT2Filter] = useState('');
const [kategorijeFilter, setKategorijeFilter] = useState('');
const [obrasciFilter, setObrasciFilter] = useState('');
const [organizacionaFilter, setOrganizacionaFilter] = useState('');
const [predmetiFilter, setPredmetiFilter] = useState('');
```

### **Filter funkcije**
```typescript
const filterLice = (lice: Lice[], filter: string) => {
    if (!filter) return lice;
    return lice.filter(l => 
        l.ime.toLowerCase().includes(filter.toLowerCase()) ||
        l.prezime.toLowerCase().includes(filter.toLowerCase()) ||
        (l.jmbg && l.jmbg.includes(filter))
    );
};
```

### **Real-time filtering**
```typescript
const filteredT1Lice = filterLice(t1Lice, t1Filter);
const filteredKategorije = filterKategorije(kategorije, kategorijeFilter);
```

## Testiranje

### 1. **Otvorite `/euk/formulari`**
### 2. **Idite na "Generisanje Template-a" tab**
### 3. **Testirajte filtere u svakom koraku:**
   - **Korak 1**: T1/T2 lice filteri
   - **Korak 2**: Kategorije filter
   - **Korak 3**: Obrasci vrste filter
   - **Korak 4**: Organizaciona struktura filter
   - **Korak 5**: Predmeti filter

### 4. **Proverite:**
   - Real-time pretraživanje
   - Broj rezultata
   - Empty state poruke
   - Responsive design

## Napomene

- Filteri se resetuju kada se promeni korak
- Podaci se učitavaju samo jednom
- Filteri rade na client-side
- Nema potrebe za dodatne API pozive

Sistem je sada mnogo korisniji za navigaciju kroz velike količine podataka! 🚀
