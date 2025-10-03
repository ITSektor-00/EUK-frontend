# Excel Import Komponenta - Dokumentacija

## 🎯 Pregled

Kompletna implementacija Excel import funkcionalnosti za EUK frontend aplikaciju. Sistem podržava univerzalni import za sve tabele u aplikaciji sa real-time progress tracking-om.

## 📁 Struktura Fajlova

```
src/
├── components/
│   ├── ExcelImportComponent.tsx    # Glavna komponenta
│   └── README-ExcelImport.md       # Ova dokumentacija
├── app/
│   └── excel-import/
│       └── page.tsx               # Demo stranica
├── types/
│   └── excel-import.ts            # TypeScript tipovi
└── styles/
    └── excel-import.css           # CSS stilovi
```

## 🚀 Korišćenje

### Osnovno Korišćenje

```tsx
import ExcelImportComponent from '@/components/ExcelImportComponent';

export default function MyPage() {
  const handleImportComplete = (response) => {
    console.log('Import completed:', response);
  };

  const handleImportError = (error) => {
    console.error('Import error:', error);
  };

  return (
    <ExcelImportComponent
      onImportComplete={handleImportComplete}
      onImportError={handleImportError}
      baseUrl="http://localhost:8080"
    />
  );
}
```

### Napredno Korišćenje

```tsx
import { useState } from 'react';
import ExcelImportComponent from '@/components/ExcelImportComponent';
import type { ImportResponse } from '@/types/excel-import';

export default function AdvancedImportPage() {
  const [importHistory, setImportHistory] = useState<ImportResponse[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportComplete = (response: ImportResponse) => {
    setImportHistory(prev => [response, ...prev]);
    setIsImporting(false);
    
    if (response.status === 'SUCCESS') {
      // Show success notification
      showNotification('Import uspešan!', 'success');
    }
  };

  const handleImportError = (error: any) => {
    setIsImporting(false);
    showNotification('Import neuspešan!', 'error');
  };

  return (
    <div>
      <ExcelImportComponent
        onImportComplete={handleImportComplete}
        onImportError={handleImportError}
        baseUrl="http://localhost:8080"
      />
      
      {/* Import History */}
      <div className="mt-8">
        <h3>Istorija Import-a</h3>
        {importHistory.map((import_, index) => (
          <div key={index} className="import-item">
            <span>{import_.filename}</span>
            <span className={import_.status === 'SUCCESS' ? 'success' : 'error'}>
              {import_.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 Props Interface

```typescript
interface ExcelImportComponentProps {
  onImportComplete?: (response: ImportResponse) => void;
  onImportError?: (error: any) => void;
  baseUrl?: string;
}
```

### Props Opis

- **onImportComplete**: Callback funkcija koja se poziva kada import završi uspešno
- **onImportError**: Callback funkcija koja se poziva kada dođe do greške
- **baseUrl**: Base URL za API endpoint-e (default: 'http://localhost:8080')

## 📊 API Endpoint-i

### 1. GET /api/import/tables
Dohvatanje liste dostupnih tabela za import.

**Response:**
```json
{
  "status": "SUCCESS",
  "tables": ["euk.ugrozeno_lice_t1", "euk.ugrozeno_lice_t2", "euk.kategorija"],
  "tableDetails": {
    "euk.ugrozeno_lice_t1": {
      "tableName": "euk.ugrozeno_lice_t1",
      "entityName": "EukUgrozenoLiceT1",
      "columnCount": 16,
      "columns": ["redni_broj", "ime", "prezime", ...],
      "displayNames": ["Redni broj", "Ime", "Prezime", ...]
    }
  }
}
```

### 2. POST /api/import/excel
Upload Excel fajla za određenu tabelu.

**Request:**
- `file` (MultipartFile) - Excel fajl
- `table` (String) - Naziv tabele

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Uvoz pokrenut u pozadini",
  "filename": "ugrozena_lica.xlsx",
  "table": "euk.ugrozeno_lice_t1"
}
```

### 3. GET /api/import/status
Provera statusa trenutnog uvoza.

**Response:**
```json
{
  "status": "PROCESSING",
  "processedRows": 1500,
  "totalRows": 3000,
  "progress": 50.0,
  "elapsedTimeSeconds": 30.0
}
```

## 📋 Podržane Tabele

### euk.ugrozeno_lice_t1 (16 kolona)
```
A: Redni broj          B: Ime              C: Prezime           D: JMBG
E: PTT broj            F: Grad/Opština     G: Mesto            H: Ulica i broj
I: Broj članova        J: Osnov statusa    K: ED broj          L: Potrošnja/Površina
M: Iznos umanjenja     N: Broj računa      O: Datum računa     P: Datum prava
```

### euk.ugrozeno_lice_t2 (8 kolona)
```
A: Redni broj          B: Ime              C: Prezime           D: JMBG
E: PTT broj            F: Grad/Opština     G: Mesto            H: Ulica i broj
```

### euk.kategorija (1 kolona)
```
A: Naziv
```

### euk.predmet (1 kolona)
```
A: Naziv predmeta
```

### users (4 kolone)
```
A: Username            B: Email            C: First Name       D: Last Name
```

## 🎨 Stilizovanje

Komponenta koristi Tailwind CSS klase i može se stilizovati preko CSS varijabli:

```css
/* Custom CSS variables */
:root {
  --excel-import-primary: #3b82f6;
  --excel-import-success: #10b981;
  --excel-import-error: #ef4444;
  --excel-import-bg: #ffffff;
  --excel-import-border: #d1d5db;
}

/* Custom styling */
.excel-import-container {
  --primary-color: var(--excel-import-primary);
  --success-color: var(--excel-import-success);
  --error-color: var(--excel-import-error);
}
```

## 🔄 State Management

Komponenta koristi sledeće state varijable:

```typescript
const [availableTables, setAvailableTables] = useState<string[]>([]);
const [selectedTable, setSelectedTable] = useState<string>('');
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
const [isImporting, setIsImporting] = useState<boolean>(false);
const [tableDetails, setTableDetails] = useState<Record<string, TableDetails>>({});
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string>('');
```

## ⚡ Funkcionalnosti

### ✅ Implementirane Funkcionalnosti

- **File Upload**: Podrška za .xlsx i .xls fajlove
- **Table Selection**: Dinamičko učitavanje dostupnih tabela
- **Progress Tracking**: Real-time praćenje napretka
- **Error Handling**: Detaljno rukovanje greškama
- **File Validation**: Validacija tipa i veličine fajla
- **Format Info**: Prikaz potrebnih kolona za svaku tabelu
- **Responsive Design**: Prilagođeno za sve uređaje
- **TypeScript Support**: Potpuna type safety
- **Accessibility**: ARIA podrška za screen readere

### 🔄 Asinhrona Obrada

- **Non-blocking UI**: Import se izvršava u pozadini
- **Real-time Progress**: Polling svakih 2 sekunde
- **Status Updates**: Automatsko ažuriranje statusa
- **Error Recovery**: Automatsko rukovanje greškama

### 📱 Responsive Design

- **Mobile First**: Optimizovano za mobilne uređaje
- **Tablet Support**: Prilagođeno za tablete
- **Desktop**: Puna funkcionalnost na desktop-u
- **Touch Friendly**: Touch-optimizovani elementi

## 🚨 Error Handling

### Tipovi Grešaka

```typescript
interface ImportError {
  error: 'EMPTY_FILE' | 'INVALID_FILE_TYPE' | 'INVALID_TABLE' | 'INTERNAL_ERROR' | 'UNKNOWN';
  message: string;
  details?: string;
}
```

### Error Messages

- **EMPTY_FILE**: "Fajl je prazan"
- **INVALID_FILE_TYPE**: "Podržani su samo Excel fajlovi (.xlsx, .xls)"
- **INVALID_TABLE**: "Neispravan naziv tabele"
- **INTERNAL_ERROR**: "Greška u obradi: {message}"
- **UNKNOWN**: "Nepoznata greška: {message}"

## 🧪 Testiranje

### Unit Testovi

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExcelImportComponent from '@/components/ExcelImportComponent';

describe('ExcelImportComponent', () => {
  it('renders without crashing', () => {
    render(<ExcelImportComponent />);
    expect(screen.getByText('Excel Import')).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<ExcelImportComponent />);
    const fileInput = screen.getByLabelText('Odaberite Excel fajl:');
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText('test.xlsx')).toBeInTheDocument();
  });
});
```

### Integration Testovi

```typescript
describe('Excel Import Integration', () => {
  it('completes full import flow', async () => {
    // Mock API responses
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'SUCCESS', tables: ['test'] }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'SUCCESS', message: 'Import started' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'COMPLETED', progress: 100 }) });

    render(<ExcelImportComponent />);
    
    // Select table and file
    // Click upload
    // Wait for completion
    
    await waitFor(() => {
      expect(screen.getByText('Import završen uspešno!')).toBeInTheDocument();
    });
  });
});
```

## 🔧 Konfiguracija

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.xlsx,.xls
```

### Next.js Config

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['xlsx']
  }
};
```

## 📝 Napomene za Implementaciju

1. **Backend Requirements**: Potrebni su API endpoint-i na backend-u
2. **File Size Limits**: Preporučeno maksimalno 10MB
3. **Polling Interval**: 2 sekunde je optimalno
4. **Error Messages**: Prikazati korisničke poruke
5. **Progress Tracking**: Vizuelno prikazati napredak
6. **Table Info**: Prikazati format za svaku tabelu
7. **Responsive Design**: Prilagoditi za mobilne uređaje

## 🎉 Zaključak

Excel Import komponenta je potpuno implementirana i spremna za korišćenje! 

**Ključne karakteristike:**
- ✅ **Asinhrona obrada** - ne blokira UI
- ✅ **Real-time progress** - praćenje napretka
- ✅ **Error handling** - prikaz grešaka
- ✅ **File validation** - samo Excel fajlovi
- ✅ **Table validation** - samo podržane tabele
- ✅ **Progress bar** - vizuelno praćenje
- ✅ **Format info** - prikaz potrebnih kolona
- ✅ **TypeScript support** - tipovi za type safety
- ✅ **Responsive design** - prilagođeno za sve uređaje

**Sistem je potpuno spreman za implementaciju!** 🚀
