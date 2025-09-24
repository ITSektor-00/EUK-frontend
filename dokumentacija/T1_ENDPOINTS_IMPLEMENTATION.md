# T1 Endpoints Implementation - EUK-T1 Ugrožena Lica

## Pregled
Frontend je migriran sa legacy endpoint-a (`/api/euk/ugrozena-lica`) na nove T1 endpoint-e (`/api/euk/ugrozena-lica-t1`) sa naprednim pretragama i statistikama. Tabela se sada zove "EUK-T1" i prikazuje se u sidebar-u kao "ЕУК-Т1 УГРОЖЕНА ЛИЦА".

## Implementirani T1 Endpoint-i

### 1. Osnovni CRUD Endpoint-i
```typescript
// GET - Lista ugrženih lica
GET /api/euk/ugrozena-lica-t1?page=0&size=10

// GET - Dohvatanje po ID-u
GET /api/euk/ugrozena-lica-t1/{id}

// POST - Kreiranje novog
POST /api/euk/ugrozena-lica-t1

// PUT - Ažuriranje
PUT /api/euk/ugrozena-lica-t1/{id}

// DELETE - Brisanje
DELETE /api/euk/ugrozena-lica-t1/{id}
```

### 2. Napredni Pretraga Endpoint-i
```typescript
// Pretraga po JMBG-u
GET /api/euk/ugrozena-lica-t1/search/jmbg/{jmbg}

// Pretraga po rednom broju
GET /api/euk/ugrozena-lica-t1/search/redni-broj/{redniBroj}

// Pretraga po imenu i prezimenu
GET /api/euk/ugrozena-lica-t1/search/name?ime={ime}&prezime={prezime}

// Napredni filteri
POST /api/euk/ugrozena-lica-t1/search/filters
```

### 3. Statistike i Count Endpoint-i
```typescript
// Statistike
GET /api/euk/ugrozena-lica-t1/statistics

// Ukupan broj
GET /api/euk/ugrozena-lica-t1/count

// Test endpoint
GET /api/euk/ugrozena-lica-t1/test
```

## Frontend Implementacija

### ApiService Ažuriranja
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

### Napredne Pretrage UI

#### 1. Pretraga po JMBG-u
- **Input polje** - Za unos JMBG-a
- **Enter key** - Aktivira pretragu
- **Dugme** - Ručna aktivacija
- **Endpoint** - `/api/euk/ugrozena-lica-t1/search/jmbg/{jmbg}`

#### 2. Pretraga po Rednom Broju
- **Input polje** - Za unos rednog broja
- **Enter key** - Aktivira pretragu
- **Dugme** - Ručna aktivacija
- **Endpoint** - `/api/euk/ugrozena-lica-t1/search/redni-broj/{redniBroj}`

#### 3. Pretraga po Imenu i Prezimenu
- **Input polje** - Format: "Ime Prezime"
- **Enter key** - Aktivira pretragu
- **Dugme** - Ručna aktivacija
- **Endpoint** - `/api/euk/ugrozena-lica-t1/search/name?ime={ime}&prezime={prezime}`

#### 4. Napredni Filteri
- **Dugme** - Aktivira filter pretragu
- **Endpoint** - `POST /api/euk/ugrozena-lica-t1/search/filters`
- **Body** - JSON sa filter objektom

### Statistike Implementacija

#### Server Statistike
```typescript
// Učitavanje sa servera
const stats = await apiService.getUgrozenaLicaStatistics(token);

// Prikaz u UI
{serverStatistics && (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
    <h3>Сервер статистике</h3>
    {Object.entries(serverStatistics).map(([key, value]) => (
      <div key={key}>
        <h4>{key}</h4>
        <p>{value}</p>
      </div>
    ))}
  </div>
)}
```

#### Client Statistike
- **Overview kartice** - Ukupno, prosečne vrednosti
- **Grafikoni** - Po kategorijama, gradovima, mestima
- **Kalendar** - Događaji po mesecima
- **Prosečne vrednosti** - Statistički podaci

## UI Komponente

### Filter Sekcija
```jsx
{/* Napredne pretrage */}
<div className="col-span-full">
  <h4>Напредне претраге</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* JMBG pretraga */}
    <div>
      <label>Претрага по ЈМБГ-у</label>
      <div className="flex gap-2">
        <input onKeyPress={handleJmbgSearch} />
        <button onClick={handleJmbgSearch}>Претражи</button>
      </div>
    </div>
    
    {/* Redni broj pretraga */}
    <div>
      <label>Претрага по редном броју</label>
      <div className="flex gap-2">
        <input onKeyPress={handleRedniBrojSearch} />
        <button onClick={handleRedniBrojSearch}>Претражи</button>
      </div>
    </div>
    
    {/* Ime/Prezime pretraga */}
    <div>
      <label>Претрага по имену и презимену</label>
      <div className="flex gap-2">
        <input onKeyPress={handleNameSearch} />
        <button onClick={handleNameSearch}>Претражи</button>
      </div>
    </div>
    
    {/* Filter pretraga */}
    <div>
      <label>Филтер претрага</label>
      <button onClick={handleFilterSearch}>Примени филтере</button>
    </div>
  </div>
</div>
```

### Statistike Sekcija
```jsx
{/* Server Statistics */}
{serverStatistics && (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
    <h3>Сервер статистике</h3>
    {loading ? (
      <div className="animate-spin">Loading...</div>
    ) : error ? (
      <div className="text-red-600">{error}</div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(serverStatistics).map(([key, value]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-4">
            <h4>{key}</h4>
            <p>{value}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

## Funkcionalnosti

### 1. Napredne Pretrage
- **JMBG pretraga** - Direktna pretraga po JMBG-u
- **Redni broj pretraga** - Pretraga po rednom broju
- **Ime/Prezime pretraga** - Kombinovana pretraga
- **Filter pretraga** - Kompleksni filteri

### 2. Statistike
- **Server statistike** - Real-time podaci sa servera
- **Client statistike** - Lokalno izračunate vrednosti
- **Overview metrike** - Ključni pokazatelji
- **Grafikoni** - Vizuelni prikaz podataka

### 3. Error Handling
- **Loading stanja** - Spinner tokom učitavanja
- **Error poruke** - Korisničke poruke o greškama
- **Retry funkcionalnost** - Pokušaj ponovnog učitavanja

## Prednosti T1 Endpoint-a

### 1. Performanse
- **Optimizovani upiti** - Brže pretrage
- **Napredni filteri** - Kompleksni kriterijumi
- **Paginacija** - Efikasno učitavanje

### 2. Funkcionalnosti
- **Specifične pretrage** - JMBG, redni broj, ime
- **Server statistike** - Real-time podaci
- **Napredni filteri** - POST zahtevi sa kompleksnim kriterijumima

### 3. Skalabilnost
- **Modularni endpoint-i** - Specifične funkcionalnosti
- **Različiti tipovi pretrage** - Optimizovano za različite slučajeve
- **Server-side obrada** - Manje opterećenje frontend-a

## Testiranje

### 1. CRUD Operacije
- **Kreiranje** - Novi ugrženih lica
- **Čitanje** - Lista i pojedinačni
- **Ažuriranje** - Modifikacija postojećih
- **Brisanje** - Uklanjanje iz sistema

### 2. Napredne Pretrage
- **JMBG pretraga** - Test sa validnim JMBG-om
- **Redni broj pretraga** - Test sa postojećim brojem
- **Ime/Prezime pretraga** - Test sa različitim kombinacijama
- **Filter pretraga** - Test sa kompleksnim kriterijumima

### 3. Statistike
- **Server statistike** - Učitavanje i prikaz
- **Client statistike** - Lokalno izračunate vrednosti
- **Error handling** - Test sa greškama

## Status
✅ **ZAVRŠENO** - Frontend je potpuno migriran na T1 endpoint-e sa naprednim pretragama i statistikama

## Napomene
- Legacy endpoint-i su i dalje dostupni za backward compatibility
- T1 endpoint-i su preporučeni za nove implementacije
- Napredne pretrage omogućavaju brže i preciznije rezultate
- Server statistike pružaju real-time podatke
- Error handling je implementiran za sve endpoint-e
