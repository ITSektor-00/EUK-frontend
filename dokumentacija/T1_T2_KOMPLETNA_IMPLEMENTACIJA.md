# 📊 T1 i T2 Tabele - Kompletna Frontend Implementacija

## 🎯 Pregled
Kompletna implementacija svih T1 i T2 funkcionalnosti u EUK sistemu. Svi endpoint-i, komponente, pretrage i primeri implementacije su potpuno implementirani.

---

## ✅ Implementirane Funkcionalnosti

### 🔗 T1 API Endpoint-i

#### 1. Osnovni CRUD Endpoint-i
```typescript
// GET - Lista ugrženih lica T1
GET /api/euk/ugrozena-lica-t1?page=0&size=50

// GET - Dohvatanje po ID-u
GET /api/euk/ugrozena-lica-t1/{id}

// POST - Kreiranje novog
POST /api/euk/ugrozena-lica-t1

// PUT - Ažuriranje
PUT /api/euk/ugrozena-lica-t1/{id}

// DELETE - Brisanje
DELETE /api/euk/ugrozena-lica-t1/{id}
```

#### 2. Napredni Pretraga Endpoint-i
```typescript
// Pretraga po JMBG-u
GET /api/euk/ugrozena-lica-t1/search/jmbg/{jmbg}

// Pretraga po rednom broju
GET /api/euk/ugrozena-lica-t1/search/redni-broj/{redniBroj}

// Pretraga po imenu i prezimenu
GET /api/euk/ugrozena-lica-t1/search/name?ime={ime}&prezime={prezime}

// Napredni filteri
POST /api/euk/ugrozena-lica-t1/search/filters?page=0&size=50

// Statistike
GET /api/euk/ugrozena-lica-t1/statistics

// Ukupan broj
GET /api/euk/ugrozena-lica-t1/count

// Test endpoint
GET /api/euk/ugrozena-lica-t1/test
```

### 🔗 T2 API Endpoint-i

#### 1. Osnovni CRUD Endpoint-i
```typescript
// GET - Lista ugrženih lica T2
GET /api/euk/ugrozena-lica-t2?page=0&size=50

// GET - Dohvatanje po ID-u
GET /api/euk/ugrozena-lica-t2/{id}

// POST - Kreiranje novog
POST /api/euk/ugrozena-lica-t2

// PUT - Ažuriranje
PUT /api/euk/ugrozena-lica-t2/{id}

// DELETE - Brisanje
DELETE /api/euk/ugrozena-lica-t2/{id}
```

#### 2. Napredni Pretraga Endpoint-i
```typescript
// Pretraga po ED broju
GET /api/euk/ugrozena-lica-t2/ed-broj/{edBroj}

// Pretraga po gradu/opštini
GET /api/euk/ugrozena-lica-t2/grad-opstina/{gradOpstina}

// Pretraga po mestu
GET /api/euk/ugrozena-lica-t2/mesto/{mesto}

// Napredni filteri
POST /api/euk/ugrozena-lica-t2/search/filters?page=0&size=50

// Statistike
GET /api/euk/ugrozena-lica-t2/statistics

// Ukupan broj
GET /api/euk/ugrozena-lica-t2/count
```

---

## 🎨 React Komponente

### 1. T1SearchComponent
**Lokacija:** `src/components/T1SearchComponent.tsx`

Kompletna pretraga komponenta za T1 sa svim filterima:
- ED broj, Ime, Prezime, JMBG
- Redni broj, Grad/Opština, Mesto, PTT broj
- Osnov sticanja statusa, Broj računa
- Datum od/do, Iznos od/do

```tsx
import T1SearchComponent from '../components/T1SearchComponent';

<T1SearchComponent 
  onResults={(results) => setSearchResults(results)}
  onLoading={(loading) => setLoading(loading)}
/>
```

### 2. T2SearchComponent
**Lokacija:** `src/components/T2SearchComponent.tsx`

Kompletna pretraga komponenta za T2 sa svim filterima:
- ED broj, Ime, Prezime, JMBG
- Redni broj, Grad/Opština, Mesto, PTT broj
- Period važenja rešenja

```tsx
import T2SearchComponent from '../components/T2SearchComponent';

<T2SearchComponent 
  onResults={(results) => setSearchResults(results)}
  onLoading={(loading) => setLoading(loading)}
/>
```

### 3. T1ExcelImport
**Lokacija:** `src/components/T1ExcelImport.tsx`

Excel import komponenta za T1 sa drag & drop funkcionalnostima:

```tsx
import T1ExcelImport from '../components/T1ExcelImport';

<T1ExcelImport 
  onImportSuccess={(result) => handleImportSuccess(result)}
  onImportError={(error) => handleImportError(error)}
/>
```

### 4. T2ExcelImport
**Lokacija:** `src/components/T2ExcelImport.tsx`

Excel import komponenta za T2 sa drag & drop funkcionalnostima:

```tsx
import T2ExcelImport from '../components/T2ExcelImport';

<T2ExcelImport 
  onImportSuccess={(result) => handleImportSuccess(result)}
  onImportError={(error) => handleImportError(error)}
/>
```

### 5. T1Statistics
**Lokacija:** `src/components/T1Statistics.tsx`

Kompletna statistika komponenta za T1 sa:
- Osnovne statistike (ukupno, sa ED brojem, sa iznosom, sa brojem računa)
- Grupisanje po osnovu sticanja statusa
- Top 5 gradova/opština
- Server statistike

```tsx
import T1Statistics from '../components/T1Statistics';

<T1Statistics ugrozenaLica={ugrozenaLica} />
```

### 6. T2Statistics
**Lokacija:** `src/components/T2Statistics.tsx`

Kompletna statistika komponenta za T2 sa:
- Osnovne statistike (ukupno, sa ED brojem, sa periodom važenja)
- Top 5 gradova/opština
- Top 5 mesta
- Server statistike

```tsx
import T2Statistics from '../components/T2Statistics';

<T2Statistics ugrozenaLicaT2={ugrozenaLicaT2} />
```

---

## 🔧 ApiService Ažuriranja

### T1 Metode
```typescript
// Osnovni CRUD
async getUgrozenaLica(params: string, token: string)
async createUgrozenoLice(data: Record<string, unknown>, token: string)
async updateUgrozenoLice(id: number, data: Record<string, unknown>, token: string)
async deleteUgrozenoLice(id: number, token: string)

// Napredne pretrage
async searchUgrozenoLiceByJmbg(jmbg: string, token: string)
async searchUgrozenoLiceByRedniBroj(redniBroj: string, token: string)
async searchUgrozenoLiceByName(ime: string, prezime: string, token: string)
async searchUgrozenoLiceByFilters(filters: Record<string, unknown>, token: string)

// Statistike
async getUgrozenaLicaStatistics(token: string)
async getUgrozenaLicaCount(token: string)
```

### T2 Metode
```typescript
// Osnovni CRUD
async getUgrozenaLicaT2(params: string, token: string)
async createUgrozenoLiceT2(data: Record<string, unknown>, token: string)
async updateUgrozenoLiceT2(id: number, data: Record<string, unknown>, token: string)
async deleteUgrozenoLiceT2(id: number, token: string)

// Napredne pretrage
async searchUgrozenoLiceT2ByEdBroj(edBroj: string, token: string)
async searchUgrozenoLiceT2ByGradOpstina(gradOpstina: string, token: string)
async searchUgrozenoLiceT2ByMesto(mesto: string, token: string)
async searchUgrozenoLiceT2ByFilters(filters: Record<string, unknown>, token: string)

// Statistike
async getUgrozenaLicaT2Statistics(token: string)
async getUgrozenaLicaT2Count(token: string)
```

---

## 📊 Excel Import Funkcionalnosti

### T1 Import
```javascript
const importT1Excel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('table', 'euk.ugrozeno_lice_t1');
  
  const response = await fetch('/api/import/excel', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result;
};
```

### T2 Import
```javascript
const importT2Excel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('table', 'euk.ugrozeno_lice_t2');
  
  const response = await fetch('/api/import/excel', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result;
};
```

---

## 📈 Statistike Funkcionalnosti

### T1 Statistike
```javascript
const getT1Statistics = async () => {
  try {
    const response = await fetch('/api/euk/ugrozena-lica-t1/statistics', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('T1 statistics error:', error);
    throw error;
  }
};
```

### T2 Statistike
```javascript
const getT2Statistics = async () => {
  try {
    const response = await fetch('/api/euk/ugrozena-lica-t2/statistics', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('T2 statistics error:', error);
    throw error;
  }
};
```

---

## 🎯 Korišćenje Komponenti

### 1. T1 Pretraga i Statistike
```tsx
import React, { useState } from 'react';
import T1SearchComponent from '../components/T1SearchComponent';
import T1Statistics from '../components/T1Statistics';
import T1ExcelImport from '../components/T1ExcelImport';

const T1Page = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <T1SearchComponent 
        onResults={setSearchResults}
        onLoading={setLoading}
      />
      
      <T1Statistics ugrozenaLica={searchResults} />
      
      <T1ExcelImport 
        onImportSuccess={(result) => console.log('Import success:', result)}
        onImportError={(error) => console.error('Import error:', error)}
      />
    </div>
  );
};
```

### 2. T2 Pretraga i Statistike
```tsx
import React, { useState } from 'react';
import T2SearchComponent from '../components/T2SearchComponent';
import T2Statistics from '../components/T2Statistics';
import T2ExcelImport from '../components/T2ExcelImport';

const T2Page = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <T2SearchComponent 
        onResults={setSearchResults}
        onLoading={setLoading}
      />
      
      <T2Statistics ugrozenaLicaT2={searchResults} />
      
      <T2ExcelImport 
        onImportSuccess={(result) => console.log('Import success:', result)}
        onImportError={(error) => console.error('Import error:', error)}
      />
    </div>
  );
};
```

---

## 🔍 Dostupni Filteri

### T1 Filteri
```javascript
const t1Filters = {
  // Osnovne informacije
  "jmbg": "1234567890123",           // JMBG (tačna pretraga)
  "redniBroj": "RB001",              // Redni broj
  "ime": "Marko",                    // Ime (LIKE pretraga)
  "prezime": "Marković",             // Prezime (LIKE pretraga)
  
  // Adresne informacije
  "gradOpstina": "Beograd",          // Grad/Opština (LIKE pretraga)
  "mesto": "Zvezdara",               // Mesto (LIKE pretraga)
  "pttBroj": "11000",                // PTT broj (tačna pretraga)
  
  // Energetski podaci
  "osnovStatusa": "SOC",             // Osnov sticanja statusa (LIKE pretraga)
  "edBroj": "ED123456",              // ED broj/broj mernog uređaja (LIKE pretraga)
  
  // Finansijski podaci
  "brojRacuna": "123-456-789",       // Broj računa (LIKE pretraga)
  "datumOd": "2024-01-01",           // Datum od (LocalDate)
  "datumDo": "2024-12-31",           // Datum do (LocalDate)
  "iznosOd": 1000,                   // Iznos od (BigDecimal)
  "iznosDo": 5000                    // Iznos do (BigDecimal)
};
```

### T2 Filteri
```javascript
const t2Filters = {
  // Osnovne informacije
  "jmbg": "1234567890123",           // JMBG (tačna pretraga)
  "redniBroj": "RB001",              // Redni broj
  "ime": "Marko",                    // Ime (LIKE pretraga)
  "prezime": "Marković",             // Prezime (LIKE pretraga)
  
  // Adresne informacije
  "gradOpstina": "Beograd",          // Grad/Opština (LIKE pretraga)
  "mesto": "Zvezdara",               // Mesto (LIKE pretraga)
  "pttBroj": "11000",                // PTT broj (tačna pretraga)
  
  // Energetski podaci
  "edBroj": "ED123456",              // ED broj (LIKE pretraga)
  "pokVazenjaResenjaOStatusu": "2024" // Period važenja rešenja (LIKE pretraga)
};
```

---

## 📋 API Odgovori

### T1 Odgovor
```json
{
  "content": [
    {
      "ugrozenoLiceId": 1,
      "redniBroj": "RB001",
      "ime": "Marko",
      "prezime": "Marković",
      "jmbg": "1234567890123",
      "pttBroj": "11000",
      "gradOpstina": "Beograd",
      "mesto": "Zvezdara",
      "ulicaIBroj": "Kralja Milana 1",
      "brojClanovaDomacinstva": 3,
      "osnovSticanjaStatusa": "SOC",
      "edBrojBrojMernogUredjaja": "ED123456",
      "potrosnjaIPovrsinaCombined": "100kW/50m²",
      "iznosUmanjenjaSaPdv": 1500.00,
      "brojRacuna": "123-456-789",
      "datumIzdavanjaRacuna": "2024-01-15",
      "datumTrajanjaPrava": "2024-12-31",
      "createdAt": "2024-01-01T10:00:00",
      "updatedAt": "2024-01-01T10:00:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 50
  },
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### T2 Odgovor
```json
{
  "content": [
    {
      "ugrozenoLiceId": 1,
      "redniBroj": "RB001",
      "ime": "Marko",
      "prezime": "Marković",
      "jmbg": "1234567890123",
      "pttBroj": "11000",
      "gradOpstina": "Beograd",
      "mesto": "Zvezdara",
      "ulicaIBroj": "Kralja Milana 1",
      "edBroj": "ED123456",
      "pokVazenjaResenjaOStatusu": "2024-2025",
      "createdAt": "2024-01-01T10:00:00",
      "updatedAt": "2024-01-01T10:00:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 50
  },
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

---

## ⚠️ Važne napomene

### T1 Tabela
- **ED broj polje:** `edBrojBrojMernogUredjaja`
- **Finansijski podaci:** Iznos, broj računa, datumi
- **Energetski podaci:** ED broj, osnov sticanja statusa
- **Adresni podaci:** Grad, mesto, PTT broj

### T2 Tabela
- **ED broj polje:** `edBroj`
- **Energetski podaci:** ED broj, period važenja rešenja
- **Adresni podaci:** Grad, mesto, PTT broj
- **Nema finansijskih podataka**

### Opšte napomene
- **Paginacija:** Sve pretrage podržavaju `page` i `size` parametre
- **Sortiranje:** Po ID-u opadajuće (najnoviji prvi)
- **LIKE pretraga:** Ime, prezime, grad, mesto, ED broj
- **Tačna pretraga:** JMBG, redni broj, PTT broj
- **Autorizacija:** Potreban Bearer token u header-u

---

## 🚀 Implementacija Status

✅ **Kompletno implementirano:**
- T1 API endpoint-i (CRUD + pretrage + statistike)
- T2 API endpoint-i (CRUD + pretrage + statistike)
- T1SearchComponent sa svim filterima
- T2SearchComponent sa svim filterima
- T1ExcelImport sa drag & drop
- T2ExcelImport sa drag & drop
- T1Statistics sa detaljnim statistikama
- T2Statistics sa detaljnim statistikama
- ApiService ažuriranja za T1 i T2
- Kompletna dokumentacija

**Status:** ✅ Sve funkcionalnosti su potpuno implementirane
**Datum:** 2025-01-03
**Verzija:** 1.0
