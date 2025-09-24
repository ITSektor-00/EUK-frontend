# EUK-T1 Ugrožena Lica - Redesign sa istim dizajnom kao Predmeti

## Pregled
Ugrožena lica stranica je potpuno redesignovana da koristi isti dizajn i strukturu kao stranica za predmete. Ovo obezbeđuje konzistentnost kroz ceo EUK sistem. Tabela se sada zove "EUK-T1" i prikazuje se u sidebar-u kao "ЕУК-Т1 УГРОЖЕНА ЛИЦА".

## Izmene

### 1. Glavna stranica (`src/app/euk/ugrozena-lica/page.tsx`)
- **Potpuno novi dizajn** - Identičan sa `src/app/euk/predmeti/page.tsx`
- **Material-UI DataGrid** - Zamenio custom tabelu sa profesionalnim DataGrid komponentom
- **Tab navigacija** - Tabela i Statistika tabovi sa istim dizajnom
- **Filteri** - Napredni filteri sa grid layout-om
- **Paginacija** - Profesionalna paginacija sa opcijama za broj stavki po stranici
- **Export funkcionalnost** - CSV, Excel i PDF export
- **Responsive dizajn** - Optimizovano za sve veličine ekrana

### 2. Statistika komponenta (`src/app/euk/ugrozena-lica/UgrozenaLicaStatistika.tsx`)
- **Nova komponenta** - Kreirana na osnovu `PredmetiStatistika.tsx`
- **Overview kartice** - Ukupno ugrženih lica, prosečan broj članova, prosečna potrošnja, prosečno umanjenje
- **Grafikoni po kategorijama**:
  - Po osnovu sticanja statusa (MP, NSP, DD, UDTNP)
  - Po gradovima/opštinama
  - Po mestima
- **Prosečne vrednosti** - Zagrevana površina, potrošnja, broj članova, umanjenje
- **Kalendar događaja** - Prikaz datuma izdavanja računa

### 3. Modal za dodavanje/uređivanje (`src/app/euk/ugrozena-lica/NovoUgrozenoLiceModal.tsx`)
- **Redesign** - Identičan dizajn kao `NoviPredmetModal.tsx`
- **Grid layout** - 2-kolona layout za polja
- **Validacija** - Napredna validacija sa error porukama
- **Loading stanje** - Spinner tokom čuvanja
- **Responsive** - Optimizovano za mobile i desktop

### 4. Tipovi (`src/app/euk/ugrozena-lica/types.ts`)
- **Index signature** - Dodato `[key: string]: string | number | undefined` za kompatibilnost sa ApiService

## Funkcionalnosti

### Tabela
- **Sortiranje** - Po svim kolonama
- **Filteri** - Redni broj, ime, prezime, JMBG, grad/opština, mesto, osnov sticanja
- **Paginacija** - 10, 25, 50, 100 stavki po stranici
- **Akcije** - Uredi i obriši dugmad za svaki red
- **Refresh** - Dugme za osvežavanje podataka

### Statistike
- **Overview metrike** - Ključni pokazatelji na vrhu
- **Kategorizacija** - Podaci grupisani po različitim kriterijumima
- **Kalendar** - Prikaz događaja po mesecima
- **Prosečne vrednosti** - Statistički podaci

### Modal
- **Sva polja UgrozenoLiceT1** - Kompletna forma sa svim novim poljima
- **Validacija** - Obavezna polja, format JMBG-a, opsezi vrednosti
- **Error handling** - Korisničke poruke o greškama
- **Loading stanje** - Vizuelni indikator tokom čuvanja

## Dizajn elementi

### Boje
- **Primarna** - `#3B82F6` (plava)
- **Sekundarna** - `#E5E7EB` (siva)
- **Hover** - `#2563EB` (tamno plava)
- **Error** - `#EF4444` (crvena)
- **Success** - `#10B981` (zelena)

### Komponente
- **DataGrid** - Material-UI sa custom styling
- **Modal** - Full-screen overlay sa rounded corners
- **Kartice** - Shadow i border radius
- **Dugmad** - Hover efekti i transition animacije

### Layout
- **Grid sistem** - Responsive grid za filtere i forme
- **Flexbox** - Za alignment i spacing
- **Gradient pozadina** - `from-blue-50 via-indigo-50 to-purple-50`

## API integracija

### Endpoint-ovi
- **GET** `/api/euk/ugrozena-lica` - Lista ugrženih lica
- **POST** `/api/euk/ugrozena-lica` - Kreiranje novog
- **PUT** `/api/euk/ugrozena-lica/{id}` - Ažuriranje
- **DELETE** `/api/euk/ugrozena-lica/{id}` - Brisanje

### WebSocket
- **Real-time updates** - Automatsko osvežavanje pri promenama
- **Notifications** - Obaveštenja o kreiranju/uređivanju/brisanju

## Responsive dizajn

### Breakpoints
- **Mobile** - `< 768px` - Single column layout
- **Tablet** - `768px - 1024px` - 2-column layout
- **Desktop** - `> 1024px` - 3-column layout

### Optimizacije
- **Horizontal scroll** - Za tabele na malim ekranima
- **Collapsible filteri** - Sakrivanje filtera na mobile
- **Touch-friendly** - Veći dugmići za touch uređaje

## Testiranje

### Funkcionalnosti za testiranje
1. **Učitavanje stranice** - Da li se podaci učitavaju
2. **Dodavanje novog** - Modal i validacija
3. **Uređivanje** - Popunjavanje forme sa postojećim podacima
4. **Brisanje** - Potvrda i uklanjanje iz liste
5. **Filteri** - Pretraga po različitim kriterijumima
6. **Paginacija** - Navigacija kroz stranice
7. **Export** - CSV, Excel, PDF izvoz
8. **Statistike** - Prikaz metrika i grafika
9. **Responsive** - Testiranje na različitim veličinama ekrana

### Browser kompatibilnost
- **Chrome** - 90+
- **Firefox** - 88+
- **Safari** - 14+
- **Edge** - 90+

## Status
✅ **ZAVRŠENO** - Ugrožena lica stranica je potpuno redesignovana sa istim dizajnom kao predmeti stranica

## Napomene
- Svi postojeći podaci su zadržani
- API endpoint-ovi su ispravni
- WebSocket integracija je funkcionalna
- Responsive dizajn je optimizovan
- Error handling je implementiran
- Loading stanja su dodana
