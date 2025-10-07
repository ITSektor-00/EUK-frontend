# Template System Testing Instructions

## Kako testirati sistem

### 1. Otvorite `/euk/formulari`
- Idite na rutu `/euk/formulari` u browseru
- Trebalo bi da vidite glavnu stranicu sa tabovima

### 2. Testiranje mock podataka
- Kliknite na **"Test Podataka"** tab
- Trebalo bi da vidite sve mock podatke:
  - **T1 Lice (3)**: Marko Marković, Petar Petrović, Ana Anić
  - **T2 Lice (3)**: Jovan Jovanović, Milica Milić, Stefan Stefanović
  - **Kategorije (3)**: Kategorija 1, 2, 3
  - **Obrasci Vrste (6)**: negativno, neograničeno, ograničeno, borci, penzioneri, obustave
  - **Organizaciona Struktura (2)**: sekretar, podsekretar

### 3. Testiranje generisanja template-a
- Kliknite na **"Generisanje Template-a"** tab
- Trebalo bi da vidite stepper sa 6 koraka
- U prvom koraku trebalo bi da vidite lice u oba kolona (T1 i T2)

### 4. Debug informacije
- Otvorite **Developer Tools** (F12)
- Idite na **Console** tab
- Trebalo bi da vidite logove:
  ```
  Loading initial data...
  Getting mock lice for t1
  Mock T1 lice: [...]
  Getting mock lice for t2
  Mock T2 lice: [...]
  Loaded data: {...}
  Setting state with arrays: {...}
  ```

### 5. Testiranje CRUD operacija
- Idite na **"Obrasci Vrste"** tab
- Trebalo bi da vidite listu obrasci vrste
- Možete dodati nove, uređivati ili brisati postojeće

- Idite na **"Organizaciona Struktura"** tab
- Trebalo bi da vidite listu organizacione strukture
- Možete dodati nove, uređivati ili brisati postojeće

## Očekivani rezultati

### ✅ Uspesno
- Mock podaci se prikazuju u "Test Podataka" tabu
- Lice se prikazuju u "Generisanje Template-a" tabu
- CRUD operacije rade u "Obrasci Vrste" i "Organizaciona Struktura" tabovima
- Nema JavaScript grešaka u konzoli

### ❌ Problemi
- Ako se ne prikazuju podaci, proverite Console za greške
- Ako se prikazuje "Nema podataka", proverite da li se mock podaci učitavaju
- Ako se prikazuje loading beskonačno, proverite API pozive

## Troubleshooting

### Problem: "Nema T1 lice" / "Nema T2 lice"
**Rešenje**: Proverite Console logove. Trebalo bi da vidite:
- "Getting mock lice for t1/t2"
- "Mock T1/T2 lice: [...]"

### Problem: Podaci se ne učitavaju
**Rešenje**: 
1. Proverite da li je backend pokrenut
2. Proverite Console za API greške
3. Mock podaci se trebaju učitati čak i bez backend-a

### Problem: "map is not a function"
**Rešenje**: Ovo je već rešeno sa Array.isArray() proverama

## Mock podaci za testiranje

### T1 Lice
- Marko Marković (JMBG: 1234567890123)
- Petar Petrović (JMBG: 1234567890124)
- Ana Anić (JMBG: 1234567890125)

### T2 Lice
- Jovan Jovanović (JMBG: 1234567890126)
- Milica Milić (JMBG: 1234567890127)
- Stefan Stefanović (JMBG: 1234567890128)

### Ostali podaci
- **Kategorije**: Kategorija 1, 2, 3
- **Obrasci vrste**: negativno, neograničeno, ograničeno, borci, penzioneri, obustave
- **Organizaciona struktura**: sekretar, podsekretar
- **Predmeti**: Predmet 1, 2, 3

Sistem je spreman za testiranje! 🚀
