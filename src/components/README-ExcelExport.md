# Excel Export Component Documentation

## 🎯 Pregled

Kompletna implementacija Excel export sistema sa template-om, progress tracking-om i WebSocket podrškom.

## 📁 Struktura fajlova

```
src/
├── components/
│   ├── ExcelExportComponent.tsx          # Osnovna export komponenta
│   ├── AdvancedExcelExportComponent.tsx # Napredna komponenta sa WebSocket
│   └── README-ExcelExport.md           # Ova dokumentacija
├── app/
│   ├── excel-export/
│   │   └── page.tsx                     # Demo stranica za osnovnu komponentu
│   └── advanced-excel-export/
│       └── page.tsx                     # Demo stranica za naprednu komponentu
├── types/
│   └── excel-export.ts                   # TypeScript tipovi
├── utils/
│   └── excelExportUtils.ts              # Utility funkcije
└── styles/
    └── excel-export.css                 # CSS stilovi
```

## 🚀 Komponente

### 1. ExcelExportComponent

Osnovna komponenta za Excel export sa sledećim karakteristikama:

#### **Props:**
```typescript
interface ExcelExportComponentProps {
  baseUrl?: string;                    // Backend URL (default: 'http://localhost:8080')
  onExportComplete?: (type: string, filename: string) => void;
  onExportError?: (type: string, error: string) => void;
}
```

#### **Karakteristike:**
- ✅ **Template-based export** - koristi postojeće Excel template fajlove
- ✅ **Progress tracking** - simulacija progress-a
- ✅ **Error handling** - robustno rukovanje greškama
- ✅ **File download** - automatsko preuzimanje fajlova
- ✅ **Responsive design** - prilagođeno za sve uređaje

#### **Korišćenje:**
```tsx
import ExcelExportComponent from '../components/ExcelExportComponent';

<ExcelExportComponent
  baseUrl="http://localhost:8080"
  onExportComplete={(type, filename) => console.log('Export completed:', type, filename)}
  onExportError={(type, error) => console.error('Export error:', type, error)}
/>
```

### 2. AdvancedExcelExportComponent

Napredna komponenta sa WebSocket podrškom i dodatnim funkcionalnostima:

#### **Props:**
```typescript
interface AdvancedExcelExportComponentProps {
  baseUrl?: string;
  config?: Partial<ExportConfig>;
  onExportComplete?: (type: ExportType, filename: string, size: number) => void;
  onExportError?: (type: ExportType, error: string) => void;
  showHistory?: boolean;
  maxHistoryEntries?: number;
  enableWebSocket?: boolean;
}
```

#### **Napredne karakteristike:**
- ✅ **WebSocket support** - real-time progress updates
- ✅ **Export history** - praćenje istorije izvoza
- ✅ **File size tracking** - prikaz veličine fajlova
- ✅ **Retry logic** - automatsko ponavljanje neuspešnih zahteva
- ✅ **Timeout protection** - zaštita od dugotrajnih operacija
- ✅ **Configurable settings** - prilagodljive postavke

#### **Korišćenje:**
```tsx
import AdvancedExcelExportComponent from '../components/AdvancedExcelExportComponent';

<AdvancedExcelExportComponent
  baseUrl="http://localhost:8080"
  config={{
    timeout: 30000,
    retryAttempts: 3,
    progressInterval: 200
  }}
  enableWebSocket={true}
  showHistory={true}
  maxHistoryEntries={10}
  onExportComplete={(type, filename, size) => {
    console.log(`Export completed: ${type} - ${filename} (${size} bytes)`);
  }}
/>
```

## 🔧 TypeScript Tipovi

### **ExportStatus**
```typescript
interface ExportStatus {
  isExporting: boolean;
  progress: number;
  error?: string;
}
```

### **ExportProgress**
```typescript
interface ExportProgress {
  current: number;
  total: number;
  percentage: number;
  stage: 'preparing' | 'processing' | 'generating' | 'downloading' | 'complete';
  message: string;
}
```

### **ExportConfig**
```typescript
interface ExportConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  progressInterval: number;
}
```

## 🛠️ Utility Funkcije

### **downloadFile**
```typescript
const downloadFile = (blob: Blob, filename: string): void
```
Preuzima fajl u browser-u.

### **generateFilename**
```typescript
const generateFilename = (
  type: ExportType, 
  options?: DownloadOptions
): string
```
Generiše ime fajla sa timestamp-om.

### **formatFileSize**
```typescript
const formatFileSize = (bytes: number): string
```
Formatira veličinu fajla u čitljiv format.

### **exportWithRetry**
```typescript
const exportWithRetry = async (
  type: ExportType,
  config: ExportConfig,
  onProgress?: (progress: number) => void
): Promise<Blob>
```
Export sa retry logikom i timeout zaštitom.

## 🎨 CSS Stilovi

### **Glavne klase:**
- `.excel-export-container` - glavni kontejner
- `.export-card` - kartice za export
- `.export-button` - dugmad za export
- `.progress-bar` - progress bar
- `.error-message` - poruke grešaka
- `.export-history` - istorija izvoza

### **Responsive design:**
- Mobilni uređaji: `@media (max-width: 768px)`
- Dark mode: `@media (prefers-color-scheme: dark)`

## 🌐 API Endpoint-i

### **Export Endpoint-i:**
```
GET /api/export/excel/t1    # Izvoz T1 tabele
GET /api/export/excel/t2    # Izvoz T2 tabele
GET /api/export/status      # Status export operacija
```

### **WebSocket Endpoint:**
```
WS /ws/export              # Real-time progress updates
```

## 📊 Template Struktura

### **Excel Template Format:**
- **Zaglavlje:** Fiksno na vrhu (redovi 1-9)
- **Tabela:** Počinje od reda 10
- **Footer:** Redovi 36 i 39 (pomeraju se naniže)
- **Kolone:** A-O (indeks 0-14)

### **T1 Tabela (15 kolona):**
```
A: Redni broj          B: Ime              C: Prezime           D: JMBG
E: PTT broj            F: Grad/Opština     G: Mesto            H: Ulica i broj
I: Broj članova        J: Osnov statusa    K: ED broj          L: Potrošnja/Površina
M: Iznos umanjenja     N: Broj računa      O: Datum računa
```

### **T2 Tabela (15 kolona):**
```
A: Redni broj          B: Ime              C: Prezime           D: JMBG
E: PTT broj            F: Grad/Opština     G: Mesto            H: Ulica i broj
I: Broj članova        J: Osnov statusa    K: ED broj          L: Potrošnja kWh
M: Zagrevana površina  N: Iznos umanjenja  O: Broj računa
```

## 🚀 Demo Stranice

### **Osnovna demo stranica:**
```
http://localhost:3000/excel-export
```

### **Napredna demo stranica:**
```
http://localhost:3000/advanced-excel-export
```

## 🔧 Konfiguracija

### **Osnovna konfiguracija:**
```typescript
const config: ExportConfig = {
  baseUrl: 'http://localhost:8080',
  timeout: 30000,        // 30 sekundi
  retryAttempts: 3,     // 3 pokušaja
  progressInterval: 200 // 200ms interval
};
```

### **WebSocket konfiguracija:**
```typescript
const wsConfig = {
  url: 'ws://localhost:8080/ws/export',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
};
```

## 📝 Primeri korišćenja

### **1. Osnovna implementacija:**
```tsx
import React from 'react';
import ExcelExportComponent from './components/ExcelExportComponent';

export default function MyPage() {
  return (
    <div>
      <h1>Excel Export</h1>
      <ExcelExportComponent />
    </div>
  );
}
```

### **2. Napredna implementacija:**
```tsx
import React, { useState } from 'react';
import AdvancedExcelExportComponent from './components/AdvancedExcelExportComponent';

export default function MyPage() {
  const [config, setConfig] = useState({
    baseUrl: 'http://localhost:8080',
    timeout: 30000,
    retryAttempts: 3
  });

  return (
    <div>
      <h1>Napredni Excel Export</h1>
      <AdvancedExcelExportComponent
        config={config}
        enableWebSocket={true}
        showHistory={true}
        onExportComplete={(type, filename, size) => {
          console.log(`Export completed: ${type} - ${filename} (${size} bytes)`);
        }}
      />
    </div>
  );
}
```

### **3. Custom event handling:**
```tsx
const handleExportComplete = (type: string, filename: string) => {
  // Show success notification
  toast.success(`Export completed: ${filename}`);
  
  // Update analytics
  analytics.track('excel_export_completed', { type, filename });
  
  // Refresh data if needed
  if (type === 't1') {
    refreshT1Data();
  }
};

const handleExportError = (type: string, error: string) => {
  // Show error notification
  toast.error(`Export failed: ${error}`);
  
  // Log error
  console.error(`Export error for ${type}:`, error);
};
```

## 🐛 Troubleshooting

### **Česti problemi:**

1. **CORS greške:**
   - Proverite da li je backend konfigurisan za CORS
   - Dodajte frontend URL u allowed origins

2. **WebSocket konekcija:**
   - Proverite da li je WebSocket server pokrenut
   - Proverite URL format (ws:// ili wss://)

3. **Timeout greške:**
   - Povećajte timeout vrednost u konfiguraciji
   - Proverite da li je backend dostupan

4. **File download problemi:**
   - Proverite da li je browser blokirao popup-ove
   - Proverite da li je blob validan

### **Debug informacije:**
```typescript
// Enable debug mode
const config = {
  ...defaultConfig,
  debug: true,
  logLevel: 'verbose'
};
```

## 📚 Dodatni resursi

- [Excel Export API Documentation](./API_DOCUMENTATION.md)
- [WebSocket Implementation Guide](./WEBSOCKET_IMPLEMENTATION.md)
- [Template Structure Guide](./TEMPLATE_STRUCTURE.md)
- [Error Handling Best Practices](./ERROR_HANDLING.md)

## 🤝 Doprinos

Za doprinos projektu, molimo vas da:

1. Fork-ujte repository
2. Kreirate feature branch
3. Commit-ujte promene
4. Push-ujte na branch
5. Otvorite Pull Request

## 📄 Licenca

Ovaj projekat je licenciran pod MIT licencom.
