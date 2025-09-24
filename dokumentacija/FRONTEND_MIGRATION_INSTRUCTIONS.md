# Frontend Migration Instructions - EUK Ugrožena Lica T1

## Pregled promena

Backend je potpuno refaktorisan za novu tabelu `ugrozeno_lice_t1`. Evo šta se promenilo:

### 🗑️ STARE ENDPOINT-E (OBAVEZNO OBRISATI):
- `GET /api/euk/ugrozena-lica`
- `GET /api/euk/ugrozena-lica/{id}`
- `POST /api/euk/ugrozena-lica`
- `PUT /api/euk/ugrozena-lica/{id}`
- `DELETE /api/euk/ugrozena-lica/{id}`
- `GET /api/euk/ugrozena-lica/search/{jmbg}`
- `GET /api/euk/ugrozena-lica/test`

### ✅ NOVI ENDPOINT-I (KORISTITI):
- `GET /api/euk/ugrozena-lica-t1`
- `GET /api/euk/ugrozena-lica-t1/{id}`
- `POST /api/euk/ugrozena-lica-t1`
- `PUT /api/euk/ugrozena-lica-t1/{id}`
- `DELETE /api/euk/ugrozena-lica-t1/{id}`
- `GET /api/euk/ugrozena-lica-t1/search/jmbg/{jmbg}`
- `GET /api/euk/ugrozena-lica-t1/search/redni-broj/{redniBroj}`
- `GET /api/euk/ugrozena-lica-t1/search/name`
- `POST /api/euk/ugrozena-lica-t1/search/filters`
- `GET /api/euk/ugrozena-lica-t1/statistics`
- `GET /api/euk/ugrozena-lica-t1/count`
- `GET /api/euk/ugrozena-lica-t1/test`

## 📋 Nova struktura podataka

### Stara struktura (OBRISATI):
```typescript
interface EukUgrozenoLice {
  ugrozenoLiceId: number;
  ime: string;
  prezime: string;
  jmbg: string;
  datumRodjenja: string;
  drzavaRodjenja: string;
  mestoRodjenja: string;
  opstinaRodjenja: string;
  predmetId: number;
  predmetNaziv?: string;
  predmetStatus?: string;
}
```

### Nova struktura (KORISTITI):
```typescript
interface EukUgrozenoLiceT1 {
  ugrozenoLiceId?: number;
  redniBroj: string;
  ime: string;
  prezime: string;
  jmbg: string;
  pttBroj?: string;
  gradOpstina?: string;
  mesto?: string;
  ulicaIBroj?: string;
  brojClanovaDomacinstva?: number;
  osnovSticanjaStatusa?: string; // MP, NSP, DD, UDTNP
  edBrojBrojMernogUredjaja?: string;
  potrosnjaKwh?: number;
  zagrevanaPovrsinaM2?: number;
  iznosUmanjenjaSaPdv?: number;
  brojRacuna?: string;
  datumIzdavanjaRacuna?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## 🔄 Koraci za migraciju

### 1. Ažuriranje API servisa

**Zameniti sve pozive:**
```typescript
// STARO ❌
const response = await fetch('/api/euk/ugrozena-lica');

// NOVO ✅
const response = await fetch('/api/euk/ugrozena-lica-t1');
```

### 2. Ažuriranje komponenti

**Zameniti interface:**
```typescript
// STARO ❌
interface UgrozenoLiceProps {
  lice: EukUgrozenoLice;
}

// NOVO ✅
interface UgrozenoLiceProps {
  lice: EukUgrozenoLiceT1;
}
```

### 3. Ažuriranje formi

**Dodati nova polja u forme:**
```typescript
// Dodati u formu
const [formData, setFormData] = useState<EukUgrozenoLiceT1>({
  redniBroj: '',
  ime: '',
  prezime: '',
  jmbg: '',
  pttBroj: '',
  gradOpstina: '',
  mesto: '',
  ulicaIBroj: '',
  brojClanovaDomacinstva: undefined,
  osnovSticanjaStatusa: '',
  edBrojBrojMernogUredjaja: '',
  potrosnjaKwh: undefined,
  zagrevanaPovrsinaM2: undefined,
  iznosUmanjenjaSaPdv: undefined,
  brojRacuna: '',
  datumIzdavanjaRacuna: ''
});
```

### 4. Ažuriranje tabela

**Dodati nove kolone:**
```typescript
const columns = [
  { key: 'redniBroj', label: 'Redni broj' },
  { key: 'ime', label: 'Ime' },
  { key: 'prezime', label: 'Prezime' },
  { key: 'jmbg', label: 'JMBG' },
  { key: 'pttBroj', label: 'PTT broj' },
  { key: 'gradOpstina', label: 'Grad/Opština' },
  { key: 'mesto', label: 'Mesto' },
  { key: 'ulicaIBroj', label: 'Ulica i broj' },
  { key: 'brojClanovaDomacinstva', label: 'Broj članova domaćinstva' },
  { key: 'osnovSticanjaStatusa', label: 'Osnov sticanja statusa' },
  { key: 'edBrojBrojMernogUredjaja', label: 'ED broj/broj mernog uređaja' },
  { key: 'potrosnjaKwh', label: 'Potrošnja (kWh)' },
  { key: 'zagrevanaPovrsinaM2', label: 'Zagrevana površina (m²)' },
  { key: 'iznosUmanjenjaSaPdv', label: 'Iznos umanjenja sa PDV' },
  { key: 'brojRacuna', label: 'Broj računa' },
  { key: 'datumIzdavanjaRacuna', label: 'Datum izdavanja računa' }
];
```

### 5. Ažuriranje pretrage

**Koristiti nove endpoint-e za pretragu:**
```typescript
// Pretraga po JMBG-u
const searchByJmbg = async (jmbg: string) => {
  const response = await fetch(`/api/euk/ugrozena-lica-t1/search/jmbg/${jmbg}`);
  return response.json();
};

// Pretraga po rednom broju
const searchByRedniBroj = async (redniBroj: string) => {
  const response = await fetch(`/api/euk/ugrozena-lica-t1/search/redni-broj/${redniBroj}`);
  return response.json();
};

// Pretraga po imenu i prezimenu
const searchByName = async (ime: string, prezime: string, page = 0, size = 10) => {
  const params = new URLSearchParams({
    ime: ime || '',
    prezime: prezime || '',
    page: page.toString(),
    size: size.toString()
  });
  const response = await fetch(`/api/euk/ugrozena-lica-t1/search/name?${params}`);
  return response.json();
};

// Kompleksna pretraga sa filterima
const searchWithFilters = async (filters: any, page = 0, size = 10) => {
  const response = await fetch(`/api/euk/ugrozena-lica-t1/search/filters?page=${page}&size=${size}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters)
  });
  return response.json();
};
```

### 6. Ažuriranje statistika

**Koristiti novi endpoint za statistike:**
```typescript
const getStatistics = async () => {
  const response = await fetch('/api/euk/ugrozena-lica-t1/statistics');
  return response.json();
};

const getCount = async () => {
  const response = await fetch('/api/euk/ugrozena-lica-t1/count');
  return response.json();
};
```

## 🎯 Validacije

### Obavezna polja:
- `redniBroj` - Redni broj u evidenciji
- `ime` - Ime osobe
- `prezime` - Prezime osobe
- `jmbg` - JMBG (13 cifara)

### Opciona polja:
- Sva ostala polja su opciona

### Validacije:
- JMBG mora imati tačno 13 cifara
- Redni broj mora biti jedinstven
- Datum izdavanja računa ne može biti u budućnosti
- Osnov sticanja statusa mora biti jedan od: MP, NSP, DD, UDTNP
- Broj članova domaćinstva mora biti između 1 i 20

## 📊 Statistike endpoint

Novi `/api/euk/ugrozena-lica-t1/statistics` endpoint vraća:
```typescript
{
  totalRecords: number;
  sumIznosUmanjenjaSaPdv: number;
  avgPotrosnjaKwh: number;
  avgZagrevanaPovrsinaM2: number;
}
```

## 🔍 Filteri za pretragu

Novi `/api/euk/ugrozena-lica-t1/search/filters` endpoint prima:
```typescript
{
  jmbg?: string;
  redniBroj?: string;
  ime?: string;
  prezime?: string;
  gradOpstina?: string;
  mesto?: string;
  pttBroj?: string;
  osnovStatusa?: string;
  edBroj?: string;
  brojRacuna?: string;
  datumOd?: string; // YYYY-MM-DD
  datumDo?: string; // YYYY-MM-DD
  iznosOd?: number;
  iznosDo?: number;
}
```

## ⚠️ VAŽNE NAPOMENE

1. **STARI ENDPOINT-I VIŠE NE POSTOJE** - obavezno zameniti sve pozive
2. **NOVA STRUKTURA PODATAKA** - ažurirati sve interface-e i tipove
3. **NOVA POLJA U FORMAMA** - dodati sva nova polja
4. **NOVA VALIDACIJA** - implementirati nove validacije
5. **TESTIRANJE** - testirati sve funkcionalnosti nakon migracije

## 🧪 Test endpoint

Koristiti `/api/euk/ugrozena-lica-t1/test` za testiranje konekcije:
```typescript
const testConnection = async () => {
  const response = await fetch('/api/euk/ugrozena-lica-t1/test');
  const result = await response.json();
  console.log('Test result:', result);
};
```

## 📝 Checklist za migraciju

- [x] Zameniti sve API pozive sa `/api/euk/ugrozena-lica` na `/api/euk/ugrozena-lica-t1`
- [x] Ažurirati interface `EukUgrozenoLice` na `EukUgrozenoLiceT1`
- [x] Dodati nova polja u forme
- [x] Ažurirati tabele sa novim kolonama
- [ ] Implementirati nove pretrage
- [ ] Dodati validacije za nova polja
- [ ] Testirati sve funkcionalnosti
- [ ] Obrisati stari kod koji više nije potreban

## 🚀 Početak rada

1. Prvo pokrenuti backend sa novim endpoint-ima
2. Zatim ažurirati frontend kod
3. Testirati sve funkcionalnosti
4. Deploy-ovati promene

---

**Kontakt za podršku:** Ako imaš pitanja ili problema sa migracijom, kontaktiraj backend tim.

## 📁 Ažurirani fajlovi

### Kompletno ažurirani fajlovi:
- `src/app/euk/ugrozena-lica/types.ts` - Nova struktura podataka
- `src/app/euk/ugrozena-lica/page.tsx` - Glavna stranica sa novim API pozivima
- `src/app/euk/ugrozena-lica/NovoUgrozenoLiceModal.tsx` - Nova forma sa svim poljima
- `src/app/euk/ugrozena-lica/UrediUgrozenoLiceModal.tsx` - Ažurirana forma za edit
- `src/app/euk/ugrozena-lica/UgrozenaLicaTable.tsx` - Tabela sa novim kolonama
- `src/app/euk/stampanje/page.tsx` - Stampa stranica sa novim API pozivima
- `src/services/api.ts` - API servis sa novim endpoint-ima

### Potrebno još da se implementira:
- [ ] UgrozenaLicaFilter.tsx - Filteri sa novim poljima
- [ ] UgrozenaLicaStatistika.tsx - Statistike sa novim endpoint-om
- [ ] Pretraga funkcionalnosti
- [ ] Validacija za nova polja

## 🔧 Tehničke napomene

### TypeScript tipovi:
- Svi tipovi su ažurirani da koriste `UgrozenoLiceT1`
- Dodati su novi interface-i za statistike i filtere
- Zadržana je stara struktura za kompatibilnost tokom migracije

### Validacija:
- Implementirana je validacija za obavezna polja
- Dodana je validacija za opciona polja (broj članova, osnov statusa, datum)
- HandleChange funkcija je ažurirana da prihvata undefined vrednosti

### UI/UX:
- Forme su proširene sa novim poljima
- Tabela je ažurirana sa novim kolonama
- Sortiranje je prilagođeno novim poljima
- Export funkcionalnost je ažurirana

### API integracija:
- Svi API pozivi su ažurirani na nove endpoint-e
- Dodana je podrška za nove pretrage
- Implementirana je podrška za statistike
- Error handling je zadržan
