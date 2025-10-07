# Word Template Generation System - Implementation Guide

## 📋 Pregled sistema

Implementiran je kompletan sistem za generisanje Word rešenja sa hijerarhijskim izborom parametara i automatskom zamenu crvenih slova sa podacima iz baze.

## 🎯 Glavni tok

1. **Izbor lice** (T1 ili T2 tabela)
2. **Izbor kategorije** 
3. **Izbor obrasci_vrste** (negativno, neograničeno, ograničeno, borci, penzioneri, obustave)
4. **Izbor organizaciona_struktura** (sekretar, podsekretar)
5. **Izbor predmeta**
6. **Unos ručnih podataka** (zaglavlje, obrazloženje)
7. **Generisanje Word dokumenta**

## 🏗️ Arhitektura sistema

### **1. TypeScript tipovi (`src/types/wordTemplate.ts`)**
```typescript
// Glavni tipovi za Word template sistem
export interface WordTemplateGenerationRequest {
    liceId: number;
    liceTip: 't1' | 't2';
    kategorijaId: number;
    obrasciVrsteId: number;
    organizacionaStrukturaId: number;
    predmetId: number;
    manualData: ManualData;
}

export interface ManualData {
    zaglavlje: string;
    obrazlozenje: string;
    dodatniPodaci?: string;
}

export interface WordTemplateGenerationResponse {
    predmetId: number;
    templateFilePath: string;
    templateStatus: 'generated' | 'error';
    templateGeneratedAt: string;
    message: string;
    success: boolean;
}
```

### **2. API Service (`src/services/wordTemplateService.ts`)**
```typescript
export class WordTemplateService {
    // Generisanje Word dokumenta
    async generateWordTemplate(request: WordTemplateGenerationRequest): Promise<WordTemplateGenerationResponse>
    
    // Download generisanog dokumenta
    async downloadTemplate(filePath: string): Promise<void>
    
    // Dobijanje podataka za formu
    async getT1Lice(): Promise<Lice[]>
    async getT2Lice(): Promise<Lice[]>
    async getKategorije(): Promise<Kategorija[]>
    async getObrasciVrste(): Promise<ObrasciVrste[]>
    async getOrganizacionaStruktura(): Promise<OrganizacionaStruktura[]>
    async getPredmeti(): Promise<Predmet[]>
}
```

### **3. Stepper komponenta (`src/components/WordTemplateStepper.tsx`)**
- Prikazuje progres kroz 7 koraka
- Vizuelni indikatori za završene i aktivne korake
- Responsive dizajn

### **4. Step komponente**
- **LiceSelectionStep**: Izbor T1/T2 lice sa pretraživanjem
- **KategorijaSelectionStep**: Izbor kategorije
- **ObrasciVrsteSelectionStep**: Izbor obrasci vrste
- **OrganizacionaStrukturaSelectionStep**: Izbor organizacione strukture
- **PredmetSelectionStep**: Izbor predmeta
- **ManualDataStep**: Unos ručnih podataka
- **GenerationStep**: Pregled i generisanje

### **5. Glavna forma (`src/components/WordTemplateGenerationForm.tsx`)**
- Upravlja stanjem forme kroz sve korake
- Validacija na svakom koraku
- Navigacija između koraka
- Generisanje Word dokumenta

## 🔧 API Endpoints

### **Glavni endpoint za generisanje**
```
POST /api/template/generate
```

**Request:**
```json
{
    "liceId": 1,
    "liceTip": "t1",
    "kategorijaId": 1,
    "obrasciVrsteId": 1,
    "organizacionaStrukturaId": 1,
    "predmetId": 1,
    "manualData": {
        "zaglavlje": "Ručno uneto zaglavlje",
        "obrazlozenje": "Ručno uneto obrazloženje",
        "dodatniPodaci": "Dodatni podaci (opciono)"
    }
}
```

**Response:**
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

### **Ostali endpointi**
```typescript
GET /api/template/obrasci-vrste          // Svi obrasci vrste
GET /api/template/organizaciona-struktura // Sve organizacione strukture
GET /api/kategorije                      // Sve kategorije
GET /api/predmeti                        // Svi predmeti
GET /api/euk/t1                          // T1 ugrožena lica
GET /api/euk/t2                          // T2 ugrožena lica
```

## 🎨 UI/UX funkcionalnosti

### **1. Stepper navigacija**
- 7 koraka sa jasnim nazivima i opisima
- Vizuelni indikatori za progres
- Automatski prelazak na sledeći korak

### **2. Pretraživanje i filtriranje**
- Real-time pretraživanje za sve liste
- Case-insensitive pretraživanje
- Multi-field pretraživanje (ime, prezime, JMBG)

### **3. Validacija**
- Provera da li su svi potrebni podaci uneti
- Validacija ručnih podataka (zaglavlje, obrazloženje)
- Error handling sa jasnim porukama

### **4. Loading states**
- Loading spinner tokom učitavanja podataka
- Loading state tokom generisanja
- Progress indikatori

### **5. Success/Error handling**
- Success poruke nakon generisanja
- Error poruke sa detaljnim opisima
- Automatski download generisanog fajla

## 🎨 CSS stilovi

### **Glavni stilovi (`src/styles/word-template.css`)**
```css
/* Stepper styles */
.stepper {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
}

/* Form styles */
.manual-data-step {
    max-width: 600px;
    margin: 0 auto;
}

/* Button styles */
.word-template-button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
}

/* Responsive design */
@media (max-width: 768px) {
    .stepper {
        flex-direction: column;
        gap: 1rem;
    }
}
```

## 🚀 Korišćenje

### **1. Otvorite `/euk/formulari`**
### **2. Idite na "Word Template" tab**
### **3. Pratite 7 koraka:**
   - **Korak 1**: Izbor lice (T1/T2)
   - **Korak 2**: Izbor kategorije
   - **Korak 3**: Izbor obrasci vrste
   - **Korak 4**: Izbor organizacione strukture
   - **Korak 5**: Izbor predmeta
   - **Korak 6**: Unos ručnih podataka
   - **Korak 7**: Generisanje Word dokumenta

### **4. Testiranje funkcionalnosti:**
   - Pretraživanje u svim listama
   - Validacija obaveznih polja
   - Generisanje i download dokumenta

## 🔄 Mock data

Sistem koristi mock data kada backend nije dostupan:

```typescript
// T1 lice
{ id: 1, ime: 'Marko', prezime: 'Marković', jmbg: '1234567890123' }

// Kategorije
{ id: 1, naziv: 'Socijalna zaštita', opis: 'Kategorija za socijalnu zaštitu' }

// Obrasci vrste
{ id: 1, naziv: 'Negativno', opis: 'Negativno rešenje' }
{ id: 2, naziv: 'Neograničeno', opis: 'Neograničeno rešenje' }
{ id: 3, naziv: 'Ograničeno', opis: 'Ograničeno rešenje' }
{ id: 4, naziv: 'Borci', opis: 'Rešenje za borce' }
{ id: 5, naziv: 'Penzioneri', opis: 'Rešenje za penzionere' }
{ id: 6, naziv: 'Obustave', opis: 'Rešenje za obustave' }

// Organizaciona struktura
{ id: 1, naziv: 'Sekretar', opis: 'Sekretar opštine' }
{ id: 2, naziv: 'Podsekretar', opis: 'Podsekretar opštine' }
```

## 📋 Checklist za implementaciju

- [x] Kreirati TypeScript tipove
- [x] Implementirati API service
- [x] Kreirati Stepper komponentu
- [x] Implementirati sve step komponente
- [x] Dodati validaciju na svakom koraku
- [x] Implementirati glavnu formu
- [x] Dodati loading states
- [x] Implementirati download funkcionalnost
- [x] Dodati error handling
- [x] Integrisati u glavnu stranicu
- [x] Dodati CSS stilove
- [x] Testirati sa mock podacima

## 🎯 Ključne napomene

1. **Crvena slova** u template-u se automatski zamenjuju sa podacima
2. **Linije pored crvenih slova** se brišu
3. **Ručni podaci** se unose u zaglavlje i obrazloženje
4. **Generisani fajl** se automatski download-uje
5. **Svi endpointi** su već konfigurisani u backend-u
6. **Mock data** omogućava testiranje bez backend-a

## 🚀 Rezultat

✅ **Kompletan Word template sistem implementiran**
✅ **7 koraka sa hijerarhijskim izborom**
✅ **Automatska zamena crvenih slova**
✅ **Ručni unos podataka**
✅ **Download generisanog dokumenta**
✅ **Responsive dizajn**
✅ **Error handling i validacija**

**Sistem je spreman za korišćenje!** 🎯
