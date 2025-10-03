# Backend Endpoints za Generisanje Word Rešenja

## Pregled
Potrebno je implementirati backend endpointe za generisanje Word rešenja na osnovu podataka iz tabele `euk.ugrozeno_lice_t1`.

## Potrebni Endpoints

### 1. POST `/api/word/generate-from-form`
**Opis:** Generiše Word rešenje iz ručno unetih podataka

**Request Body:**
```json
{
  "broj_predmeta": "string",
  "datum_donosenja": "2024-01-15",
  "broj_ovlascenja": "string",
  "datum_ovlascenja": "2024-01-10",
  "ime_podsekretara": "string",
  "ime_prezime_korisnika": "string",
  "jmbg_korisnika": "string",
  "adresa_korisnika": "string",
  "broj_ed": "string",
  "domacinstvo": "string",
  "kolicina_kwh": "string",
  "godina": "string",
  "broj_infostan": "string",
  "procenat_racuna": "string",
  "broj_gas_meter": "string",
  "kolicina_gas": "string",
  "meseci_gas": "string",
  "datum_podnosenja": "2024-01-01",
  "datum_resenja": "2024-01-20",
  "broj_clanova": "string",
  "godina_pocetka": "string"
}
```

**Response:**
- Status: 200 OK
- Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Body: Word dokument (.docx fajl)

### 2. POST `/api/word/generate-from-database`
**Opis:** Generiše Word rešenje iz podataka iz baze na osnovu ID-a

**Request Body:**
```json
{
  "id": 123
}
```

**Response:**
- Status: 200 OK
- Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Body: Word dokument (.docx fajl)

### 3. POST `/api/word/save-and-generate`
**Opis:** Čuva podatke u bazu i generiše Word rešenje

**Request Body:** (isti kao `/api/word/generate-from-form`)

**Response:**
```json
{
  "id": 123,
  "message": "Podaci su sačuvani i Word je generisan",
  "downloadUrl": "/api/word/download/123"
}
```

### 4. GET `/api/ugrozeno-lice-t1`
**Opis:** Dohvata sva lica iz tabele za dropdown

**Response:**
```json
[
  {
    "id": 1,
    "ime": "string",
    "prezime": "string",
    "jmbg": "string",
    "adresa": "string",
    "broj_ed": "string",
    "domacinstvo": "string",
    "kolicina_kwh": "string",
    "godina": "string",
    "broj_infostan": "string",
    "procenat_racuna": "string",
    "broj_gas_meter": "string",
    "kolicina_gas": "string",
    "meseci_gas": "string",
    "datum_podnosenja": "2024-01-01",
    "datum_resenja": "2024-01-20",
    "broj_clanova": "string",
    "godina_pocetka": "string"
  }
]
```

## Word Template Placeholder-i

Template treba da ima sledeće placeholder-e koji se zamenjuju:

### Osnovni podaci
- `${broj_predmeta}` - broj predmeta
- `${datum_donosenja}` - datum donošenja rešenja
- `${broj_ovlascenja}` - broj ovlašćenja
- `${datum_ovlascenja}` - datum ovlašćenja
- `${ime_podsekretara}` - ime i prezime podsekretara

### Podaci o korisniku
- `${ime_prezime_korisnika}` - ime i prezime korisnika
- `${jmbg_korisnika}` - JMBG korisnika
- `${adresa_korisnika}` - adresa korisnika
- `${broj_ed}` - broj ED (električne distribucije)
- `${domacinstvo}` - domaćinstvo
- `${kolicina_kwh}` - količina kWh
- `${godina}` - godina
- `${broj_infostan}` - broj Infostan
- `${procenat_racuna}` - procenat računa
- `${broj_gas_meter}` - broj gasnog brojila
- `${kolicina_gas}` - količina gasa
- `${meseci_gas}` - meseci za gas

### Datumi
- `${datum_podnosenja}` - datum podnošenja zahteva
- `${datum_resenja}` - datum rešenja
- `${broj_clanova}` - broj članova domaćinstva
- `${godina_pocetka}` - godina početka

## Tehnološki zahtevi

### Potrebne biblioteke
- **Apache POI** (Java) - za rad sa Word dokumentima
- **Spring Boot** - za REST API
- **JPA/Hibernate** - za rad sa bazom podataka

### Implementacija
1. Kreirati Word template (.docx) sa placeholder-ima
2. Implementirati servis za zamenjivanje placeholder-a
3. Implementirati REST kontrolere
4. Konfigurisati CORS za frontend
5. Implementirati error handling

### Primer implementacije (Java/Spring Boot)

```java
@RestController
@RequestMapping("/api/word")
@CrossOrigin(origins = "http://localhost:3000")
public class WordGenerationController {

    @Autowired
    private WordGenerationService wordService;

    @PostMapping("/generate-from-form")
    public ResponseEntity<byte[]> generateFromForm(@RequestBody FormData formData) {
        try {
            byte[] wordDocument = wordService.generateWordFromForm(formData);
            return ResponseEntity.ok()
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                .header("Content-Disposition", "attachment; filename=resenje.docx")
                .body(wordDocument);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/generate-from-database")
    public ResponseEntity<byte[]> generateFromDatabase(@RequestBody Map<String, Integer> request) {
        try {
            int id = request.get("id");
            byte[] wordDocument = wordService.generateWordFromDatabase(id);
            return ResponseEntity.ok()
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                .header("Content-Disposition", "attachment; filename=resenje.docx")
                .body(wordDocument);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
```

## Frontend Integration

Frontend će pozivati ove endpointe na sledeći način:

```typescript
// Generisanje iz forme
const generateFromForm = async (formData: FormData) => {
  const response = await fetch('/api/word/generate-from-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resenje.docx';
    a.click();
  }
};

// Generisanje iz baze
const generateFromDatabase = async (id: number) => {
  const response = await fetch('/api/word/generate-from-database', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resenje.docx';
    a.click();
  }
};
```

## Napomene
- Sve datume formatirati u srpski format (dd.MM.yyyy)
- Implementirati validaciju podataka
- Dodati error handling za sve slučajeve
- Konfigurisati CORS za frontend domen
- Implementirati logging za debugging
