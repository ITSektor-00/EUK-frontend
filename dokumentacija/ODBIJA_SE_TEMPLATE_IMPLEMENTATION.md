# OДБИЈА СЕ Template Implementation

## Pregled
Implementiran je kompletan frontend sistem za generisanje "OДБИЈА СЕ NSP,UNSP,DD,UDTNP" template-a sa svim potrebnim poljima i funkcionalnostima.

## Implementirane komponente

### **1. TypeScript interfejsi (`src/types/odbijaSeTemplate.ts`)**

#### **OdbijaSeManualData interface:**
```typescript
export interface OdbijaSeManualData {
    // Ručno uneti podaci
    predmet: string;
    datumDonosenjaResenja: string;
    brojResenja: string;
    datumOvlastenja: string;
    datumPodnosenja: string;
    
    // Podaci iz baze
    imePrezimeLica: string;
    ulicaIBroj: string;
    imePrezimePravnogLica: string;
    jmbgPravnogLica: string;
    adresaPravnogLica: string;
    imePrezimePodnosioca: string;
    jmbgPodnosioca: string;
    adresaPodnosioca: string;
    
    // Opciona polja
    dodatniTekst?: string;
    
    // Logička polja
    pribavljaDokumentaciju: boolean;
    vdPotpis: boolean;
    srPotpis: boolean;
}
```

#### **OdbijaSeTemplateRequest interface:**
```typescript
export interface OdbijaSeTemplateRequest {
    liceId: number;
    liceTip: 't1' | 't2';
    kategorijaId: number;
    obrasciVrsteId: number;
    organizacionaStrukturaId: number;
    predmetId: number;
    manualData: OdbijaSeManualData;
}
```

### **2. API servis (`src/services/odbijaSeTemplateService.ts`)**

#### **Glavne metode:**
- `generateOdbijaSeTemplate()` - generisanje template-a
- `downloadTemplate()` - download generisanog fajla
- `getT1Lice()`, `getT2Lice()` - učitavanje lice podataka
- `getKategorije()`, `getObrasciVrste()` - učitavanje kategorija i obrasci
- `getOrganizacionaStruktura()`, `getPredmeti()` - učitavanje organizacije i predmeta

#### **Mock data podrška:**
- Automatski fallback na mock data ako backend nije dostupan
- Console warning poruke za debug
- Kompletni mock podaci za sve tipove

### **3. Glavna komponenta (`src/components/OdbijaSeTemplateForm.tsx`)**

#### **Stepper navigacija (7 koraka):**
1. **Izbor Lica** - T1/T2 lice sa pretraživanjem
2. **Kategorija** - izbor kategorije (NSP, UNSP, DD, UDTNP)
3. **Obrasci Vrste** - izbor obrasci vrste
4. **Organizaciona Struktura** - izbor organizacije
5. **Predmet** - izbor predmeta
6. **Ručni Podaci** - unos svih potrebnih podataka
7. **Generisanje** - pregled i generisanje template-a

#### **Ručni podaci forma:**
- **Osnovni podaci**: predmet, datum donošenja, broj rešenja, datum ovlašćenja, datum podnošenja
- **Logička polja**: prikupljanje dokumentacije, в.д. потпис, с.р. потпис
- **Dodatni tekst**: opciono polje za dodatne podatke

#### **Automatsko popunjavanje:**
- Podaci iz T1/T2 tabele se automatski popunjavaju
- Ime i prezime, JMBG, adresa se automatski postavljaju
- Logička polja kontrolišu prikaz teksta u finalnom dokumentu

### **4. CSS stilovi (`src/styles/odbija-se-template.css`)**

#### **Glavni stilovi:**
- Gradient pozadina sa crvenim temama
- Stepper navigacija sa animacijama
- Form elementi sa fokus efektima
- Responsive dizajn za mobilne uređaje
- Cyrillic text podrška

#### **Specijalni stilovi:**
- `.odbija-se-template-header` - crveni header za OДБИЈА СЕ
- `.odbija-se-red-button` - crvena dugmad za generisanje
- `.odbija-se-cyrillic` - podrška za ćirilicu

### **5. Integracija u glavnu stranicu**

#### **Dodat tab:**
```typescript
{ id: 'odbija-se', label: 'OДБИЈА СЕ Template', icon: '❌' }
```

#### **Help sekcija ažurirana:**
- Dodana objašnjenja za OДБИЈА СЕ template
- Ažurirani brojevi u help sekciji

## Backend integracija

### **API endpoint:**
```
POST /api/template/generate-odbija-se
```

### **Request format:**
```json
{
    "liceId": 2639,
    "liceTip": "t1",
    "kategorijaId": 6,
    "obrasciVrsteId": 1,
    "organizacionaStrukturaId": 2,
    "predmetId": 1,
    "manualData": {
        "predmet": "Енергетски угрожени купац",
        "datumDonosenjaResenja": "2024-01-15",
        "brojResenja": "123/2024",
        "datumOvlastenja": "2024-01-10",
        "datumPodnosenja": "2024-01-05",
        "imePrezimeLica": "Марко Петровић",
        "ulicaIBroj": "Краља Петра 15",
        "imePrezimePravnogLica": "Петар Јовановић",
        "jmbgPravnogLica": "1234567890123",
        "adresaPravnogLica": "Немањина 25, Београд, 11000",
        "imePrezimePodnosioca": "Марко Петровић",
        "jmbgPodnosioca": "1234567890123",
        "adresaPodnosioca": "Краља Петра 15, Београд, 11000",
        "dodatniTekst": "Додатни текст ако је потребан",
        "pribavljaDokumentaciju": true,
        "vdPotpis": false,
        "srPotpis": true
    }
}
```

### **Response format:**
```json
{
    "predmetId": 1,
    "templateFilePath": "generated_templates/odbija-se_1_1234567890.doc",
    "templateStatus": "generated",
    "templateGeneratedAt": "2024-01-15T10:30:00",
    "message": "OДБИЈА СЕ template je uspešno generisan",
    "success": true
}
```

## Funkcionalnosti

### **1. Automatsko popunjavanje podataka**
- Podaci iz T1/T2 tabele se automatski popunjavaju
- Ime, prezime, JMBG, adresa se automatski postavljaju
- Korisnik može da menja podatke ako je potrebno

### **2. Logička polja**
- **pribavljaDokumentaciju**: kontroliše da li se prikazuje tekst o prikupljanju dokumentacije
- **vdPotpis**: kontroliše da li se prikazuje "в.д." u potpisu
- **srPotpis**: kontroliše da li se prikazuje "с.р." u potpisu

### **3. Validacija**
- Obavezna polja se proveravaju pre generisanja
- Datum validacija
- JMBG format validacija
- Email validacija za kontakt podatke

### **4. Download funkcionalnost**
- Automatski download nakon generisanja
- Koristi download endpoint: `/api/template/download?filePath=...`
- Generiše .doc fajl sa imenom: `odbija-se_{predmetId}_{timestamp}.doc`

## Testiranje

### **1. Otvorite `/euk/formulari`**
### **2. Idite na "OДБИЈА СЕ Template" tab (❌)**
### **3. Popunite sve korake:**
   - Izaberite lice (T1 ili T2)
   - Izaberite kategoriju
   - Izaberite obrasci vrste
   - Izaberite organizacionu strukturu
   - Izaberite predmet
   - Unesite ručne podatke
   - Generiši template

### **4. Proverite da li se template generiše i download-uje**

## Napomene

- **Backend mora biti pokrenut** za generisanje template-a
- **Mock data** se koristi ako backend nije dostupan
- **Cyrillic text** je podržan u svim poljima
- **Responsive dizajn** radi na svim uređajima
- **Error handling** je implementiran na svim nivoima

## Rezultat

✅ **Kompletna frontend implementacija**
✅ **7-korak stepper navigacija**
✅ **Automatsko popunjavanje podataka**
✅ **Logička polja za kontrolu teksta**
✅ **Download funkcionalnost**
✅ **Mock data podrška**
✅ **Cyrillic text podrška**
✅ **Responsive dizajn**
✅ **Error handling**

OДБИЈА СЕ template sistem je potpuno implementiran i spreman za korišćenje! 🚀
