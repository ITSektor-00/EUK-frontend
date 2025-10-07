# Template Generation System - Frontend Implementation

## Pregled sistema

Sistem za generisanje template rešenja omogućava hijerarhijski izbor parametara za kreiranje personalizovanih rešenja. Implementiran je na ruti `/euk/formulari` sa sledećim funkcionalnostima:

1. **Hijerarhijski izbor parametara** - Stepper komponenta sa 6 koraka
2. **Upravljanje obrasci vrste** - CRUD operacije
3. **Upravljanje organizacionom strukturom** - CRUD operacije
4. **Generisanje template-a** - Sa download linkom

## Implementirane komponente

### 1. TypeScript interfejsi (`src/types/template.ts`)
- `TemplateGenerationRequest` - Zahtev za generisanje template-a
- `TemplateGenerationResponse` - Odgovor sa generisanim template-om
- `ObrasciVrste` - Model za obrasci vrste
- `OrganizacionaStruktura` - Model za organizacionu strukturu
- `LiceSelection`, `KategorijaSelection` - Selekcije za formu
- `TemplateFormData` - Stanje forme
- `TemplateStep` - Konfiguracija koraka

### 2. API Service (`src/services/templateService.ts`)
- `TemplateGenerationService` klasa sa svim potrebnim metodama
- CRUD operacije za obrasci vrste
- CRUD operacije za organizacionu strukturu
- Generisanje template-a
- Dobijanje podataka potrebnih za formu (lice, kategorije, predmeti)

### 3. TemplateGenerationForm komponenta (`src/components/TemplateGenerationForm.tsx`)
- **Stepper interfejs** sa 6 koraka:
  1. Izbor lice (T1 ili T2)
  2. Izbor kategorije
  3. Izbor obrasci vrste
  4. Izbor organizacione strukture
  5. Izbor predmeta
  6. Generisanje template-a
- **Validacija** na svakom koraku
- **Loading states** tokom API poziva
- **Error handling** sa korisnim porukama
- **Progress indicator** sa vizuelnim koracima

### 4. ObrasciVrsteList komponenta (`src/components/ObrasciVrsteList.tsx`)
- **Lista obrasci vrste** sa mogućnošću selekcije
- **CRUD operacije**:
  - Dodavanje novih obrasci vrste
  - Uređivanje postojećih
  - Brisanje obrasci vrste
- **Inline editing** funkcionalnost
- **Selection highlighting** za izabrane stavke

### 5. OrganizacionaStrukturaList komponenta (`src/components/OrganizacionaStrukturaList.tsx`)
- **Lista organizacione strukture** sa mogućnošću selekcije
- **CRUD operacije**:
  - Dodavanje novih organizacionih struktura
  - Uređivanje postojećih
  - Brisanje organizacionih struktura
- **Inline editing** funkcionalnost
- **Selection highlighting** za izabrane stavke

### 6. Glavna stranica (`src/app/euk/formulari/page.tsx`)
- **Tab interfejs** sa tri sekcije:
  - Generisanje Template-a
  - Obrasci Vrste
  - Organizaciona Struktura
- **Integracija svih komponenti**
- **Template download** funkcionalnost
- **Help sekcija** sa instrukcijama

## API Endpoints

Sistem očekuje sledeće backend endpoints:

### Template Generation
```
POST /api/template/generate
```

### Obrasci Vrste
```
GET /api/template/obrasci-vrste
GET /api/template/obrasci-vrste/{id}
POST /api/template/obrasci-vrste
PUT /api/template/obrasci-vrste/{id}
DELETE /api/template/obrasci-vrste/{id}
```

### Organizaciona Struktura
```
GET /api/template/organizaciona-struktura
GET /api/template/organizaciona-struktura/{id}
POST /api/template/organizaciona-struktura
PUT /api/template/organizaciona-struktura/{id}
DELETE /api/template/organizaciona-struktura/{id}
```

### Dodatni endpoints
```
GET /api/euk/t1 - T1 lice
GET /api/euk/t2 - T2 lice
GET /api/kategorije - Kategorije
GET /api/predmeti - Predmeti
```

## Korišćenje sistema

### 1. Generisanje Template-a
1. Idite na `/euk/formulari`
2. Izaberite "Generisanje Template-a" tab
3. Pratite stepper korake:
   - Izaberite lice iz T1 ili T2 tabele
   - Izaberite kategoriju
   - Izaberite obrasci vrste
   - Izaberite organizacionu strukturu
   - Izaberite predmet
   - Kliknite "Generiši template"
4. Preuzmite generisani template

### 2. Upravljanje Obrasci Vrste
1. Idite na "Obrasci Vrste" tab
2. Dodajte nove obrasci vrste klikom na "Dodaj novu"
3. Uredite postojeće klikom na "Uredi"
4. Obrišite obrasci vrste klikom na "Obriši"

### 3. Upravljanje Organizacionom Strukturom
1. Idite na "Organizaciona Struktura" tab
2. Dodajte nove strukture klikom na "Dodaj novu"
3. Uredite postojeće klikom na "Uredi"
4. Obrišite strukture klikom na "Obriši"

## Karakteristike implementacije

### UI/UX
- **Responsive design** - Radi na svim uređajima
- **Moderni interfejs** - Koristi Tailwind CSS
- **Intuitivna navigacija** - Stepper sa jasnim koracima
- **Loading states** - Prikazuje progress tokom operacija
- **Error handling** - Korisne greške za korisnika

### Funkcionalnost
- **Hijerarhijski izbor** - Logičan tok kroz korake
- **Validacija** - Proverava da li su svi koraci završeni
- **CRUD operacije** - Kompletno upravljanje podacima
- **Real-time updates** - Automatsko osvežavanje nakon promena
- **File download** - Direktan link za preuzimanje template-a

### Tehnička implementacija
- **TypeScript** - Potpuna tipizacija
- **React Hooks** - Moderni React pristup
- **Error boundaries** - Graceful error handling
- **API integration** - Centralizovani service layer
- **State management** - Lokalno stanje komponenti

## Napomene za backend implementaciju

1. **Database setup** - Kreirati tabele `obrasci_vrste` i `organizaciona_struktura`
2. **File storage** - Implementirati čuvanje generisanih template fajlova
3. **Authentication** - Dodati autentifikaciju prema potrebi
4. **Validation** - Validirati sve inpute na backend strani
5. **Error handling** - Vratiti korisne greške u JSON formatu

## Buduća poboljšanja

1. **Cloud storage integracija** - Za čuvanje template fajlova
2. **Template caching** - Za brže generisanje
3. **Batch generisanje** - Za više template-a odjednom
4. **Template versioning** - Za praćenje verzija
5. **Advanced template editor** - Za uređivanje template-a
6. **PDF export** - Za direktan PDF export
7. **Email notifications** - Za obaveštavanje o generisanju

## Testiranje

### Manualno testiranje
1. Kreirati test predmet u bazi
2. Dodati obrasci vrste i organizacionu strukturu
3. Testirati generisanje template-a
4. Proveriti download funkcionalnost
5. Testirati CRUD operacije

### API testiranje
```bash
# Test generisanja template-a
curl -X POST http://localhost:8080/api/template/generate \
  -H "Content-Type: application/json" \
  -d '{
    "liceId": 1,
    "liceTip": "t1",
    "kategorijaId": 1,
    "obrasciVrsteId": 1,
    "organizacionaStrukturaId": 1,
    "predmetId": 1
  }'
```

Sistem je potpuno implementiran i spreman za korišćenje! 🚀
