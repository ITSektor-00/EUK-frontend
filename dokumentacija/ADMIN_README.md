# Admin Dashboard - Sistem za odobravanje korisnika

## Pregled

Admin dashboard omogućava administratorima da upravljaju korisnicima sistema, uključujući odobravanje novih registracija, promenu rola i sistem notifikacija.

## Funkcionalnosti

### 1. Automatsko preusmeravanje

- Korisnici sa `ADMIN` role se automatski preusmeravaju na `/admin` umesto `/dashboard`
- Admin layout proverava privilegije i ne dozvoljava pristup korisnicima koji nisu admini

### 2. Upravljanje korisnicima (`/admin/korisnici`)

#### Pregled korisnika
- Tabela sa svim korisnicima sistema
- Filtriranje po statusu:
  - **Na čekanju**: Korisnici koji čekaju odobravanje
  - **Odobreni**: Aktivni korisnici
  - **Odbijeni**: Deaktivirani korisnici
  - **Svi**: Svi korisnici

#### Akcije nad korisnicima
- **Odobravanje**: Aktiviranje korisnika (`PUT /api/admin/users/{id}/approve`)
- **Odbijanje**: Deaktiviranje korisnika (`PUT /api/admin/users/{id}/reject`)
- **Promena role**: Dodeljivanje ADMIN/MODERATOR/USER role (`PUT /api/admin/users/{id}/role`)
- **Brisanje**: Potpuno uklanjanje korisnika (`DELETE /api/admin/users/{id}`)

#### Statistike
- Ukupan broj korisnika
- Broj korisnika na čekanju
- Broj odobrenih korisnika
- Broj današnjih registracija
- Distribucija po rolama

### 3. Sistemske postavke (`/admin/sistem`)

- Automatsko odobravanje novih korisnika
- Maksimum registracija po danu
- Email notifikacije
- Režim održavanja
- Session timeout
- Informacije o sistemu

### 4. Real-time notifikacije

#### Notifikacioni sistem
- Automatsko osvežavanje svakih 30 sekundi
- Badge sa brojem korisnika na čekanju
- Dropdown sa listom novih korisnika
- Brzo odobravanje iz notifikacije

## API Endpoints

### Admin API
```
GET    /api/admin/users           - Dohvata sve korisnike
PUT    /api/admin/users/{id}/approve - Odobrava korisnika
PUT    /api/admin/users/{id}/reject  - Odbija korisnika
PUT    /api/admin/users/{id}/role    - Ažurira rolu korisnika
DELETE /api/admin/users/{id}         - Briše korisnika
```

### Struktura korisnika
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
}
```

## Komponente

### 1. AdminLayout (`/admin/layout.tsx`)
- Glavni layout za admin stranice
- Proverava admin privilegije
- Uključuje notifikacije u navbar

### 2. KorisniciPage (`/admin/korisnici/page.tsx`)
- Glavna stranica za upravljanje korisnicima
- Tabela sa filterima i akcijama
- Integracija sa API-jem

### 3. AdminDashboardStats (`/admin/korisnici/AdminDashboardStats.tsx`)
- Prikazuje statistike korisnika
- Real-time ažuriranje

### 4. AdminNotifications (`/admin/korisnici/AdminNotifications.tsx`)
- Notifikacioni bell sa badge-om
- Dropdown sa novim korisnicima
- Brzo odobravanje

### 5. SistemPage (`/admin/sistem/page.tsx`)
- Sistemske postavke
- Toggle-ovi za različite opcije
- Informacije o sistemu

## Sigurnost

### Autorizacija
- Svi admin API pozivi zahtevaju Bearer token
- Backend proverava da li korisnik ima ADMIN rolu
- Frontend komponente proveravaju `isAdmin` flag

### Validation
- Svi API pozivi prolaze kroz middleware za autorizaciju
- Error handling za neautorizovane pristupe

## Konfiguracija

### Environment varijable
```
BACKEND_URL=http://localhost:8080  # Backend API URL
```

### Database struktura
Tabela `public.users` mora imati kolone:
- `role` (ADMIN/MODERATOR/USER)
- `isActive` (boolean)
- `isApproved` (boolean)

## Korišćenje

### 1. Kreiranje admin korisnika
Admin korisnici se kreiraju direktno u bazi podataka ili kroz backend API sa `role = 'ADMIN'`.

### 2. Pristup admin panelu
- Prijavi se kao korisnik sa ADMIN role
- Automatski ćeš biti preusmeren na `/admin`
- Koristi sidebar za navigaciju između admin sekcija

### 3. Odobravanje korisnika
1. Idi na `/admin/korisnici`
2. Koristi filter "Na čekanju" 
3. Klikni "Odobri" ili "Odbij" za svakog korisnika
4. Koristi notifikacije za brzo odobravanje

### 4. Upravljanje rolama
- Koristi dropdown u tabeli korisnika
- Promene se čuvaju automatski
- Korisnici će videti promene nakon sledećeg login-a

## Troubleshooting

### Problem: Admin korisnik se ne preusmerava
- Proveri da li `role` kolona u bazi sadrži 'ADMIN'
- Proveri da li `isActive` i `isApproved` su `true`

### Problem: API pozivi ne rade
- Proveri `BACKEND_URL` environment varijablu
- Proveri da li backend ima admin endpoints implementirane

### Problem: Notifikacije se ne ažuriraju
- Proveri konzolu za greške
- Proveri da li API vratila pravilnu strukturu podataka


