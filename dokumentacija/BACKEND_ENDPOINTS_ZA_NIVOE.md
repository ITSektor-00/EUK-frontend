# BACKEND ENDPOINTS ZA NOVI SISTEM NIVOA PRISTUPA

## 📋 ENDPOINT-I KOJI TREBA DA IMPLEMENTIRA BACKEND TIM

### 1. **GET /api/admin/routes**
**Opis:** Vrati sve rute sa nivoima pristupa
**Response:**
```json
[
  {
    "id": 1,
    "ruta": "euk/kategorije",
    "naziv": "Kategorije",
    "opis": "Upravljanje kategorijama predmeta",
    "sekcija": "EUK",
    "nivoMin": 1,
    "nivoMax": 5,
    "aktivna": true,
    "datumKreiranja": "2024-01-15T10:30:00"
  }
]
```

### 2. **GET /api/admin/user-routes**
**Opis:** Vrati sve user routes sa nivoima
**Response:**
```json
[
  {
    "id": 1,
    "userId": 6,
    "routeId": 1,
    "route": "euk/kategorije",
    "nivoDozvola": 3,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "user": {
      "id": 6,
      "username": "luka.rakic",
      "firstName": "Luka",
      "lastName": "Rakic",
      "role": "admin",
      "isActive": true,
      "nivoPristupa": 5
    },
    "routeDto": {
      "id": 1,
      "ruta": "euk/kategorije",
      "naziv": "Kategorije",
      "nivoMin": 1,
      "nivoMax": 5
    }
  }
]
```

### 3. **GET /api/admin/user-routes/{userId}**
**Opis:** Vrati rute za specifičnog korisnika
**Response:** Isti kao gore, ali filtrirano po userId

### 4. **POST /api/admin/user-routes**
**Opis:** Dodaj novu rutu za korisnika
**Request Body:**
```json
{
  "userId": 6,
  "routeId": 1,
  "nivoDozvola": 3
}
```

### 5. **PUT /api/admin/user-routes/{userId}/{routeId}**
**Opis:** Ažuriraj nivo dozvole
**Request Body:**
```json
{
  "nivoDozvola": 4
}
```

### 6. **DELETE /api/admin/user-routes/{userId}/{routeId}**
**Opis:** Ukloni rutu za korisnika
**Response:** 200 OK

### 7. **PUT /api/admin/users/{userId}/level**
**Opis:** Ažuriraj nivo pristupa korisnika
**Request Body:**
```json
{
  "nivoPristupa": 4
}
```

## 🗄️ DATABASE SCHEMA

### Tabela `rute`:
```sql
CREATE TABLE rute (
    id SERIAL PRIMARY KEY,
    ruta VARCHAR(255) NOT NULL UNIQUE,
    naziv VARCHAR(255) NOT NULL,
    opis TEXT,
    sekcija VARCHAR(100),
    nivo_min INTEGER NOT NULL DEFAULT 1,
    nivo_max INTEGER NOT NULL DEFAULT 5,
    aktivna BOOLEAN DEFAULT true,
    datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `user_routes`:
```sql
CREATE TABLE user_routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    nivo_dozvole INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES rute(id) ON DELETE CASCADE,
    UNIQUE(user_id, route_id)
);
```

### Dodati u tabelu `users`:
```sql
ALTER TABLE users ADD COLUMN nivo_pristupa INTEGER DEFAULT 1;
```

## 🎯 NIVOI PRISTUPA

```javascript
const NIVOI_PRISTUPA = {
  1: "Основни корисник",      // Pristup osnovnim funkcionalnostima
  2: "Потписник",            // Može potpisivati dokumente  
  3: "Обрађивач предмета",   // Može obrađivati predmete
  4: "Супервизор",           // Može pregledati izveštaje
  5: "Администратор"         // Pristup svim funkcionalnostima
};
```

## 🔧 IMPLEMENTACIJA

1. **Kreiraj tabele** koristeći SQL skriptu iz `database_setup_nivoi_pristupa.sql`
2. **Implementiraj endpoint-e** prema specifikaciji gore
3. **Dodaj validaciju** da nivo_dozvole bude između nivo_min i nivo_max
4. **Dodaj autorizaciju** da samo admin može da upravlja nivoima
5. **Testiraj** sa frontend-om

## 📝 NAPOMENE

- Frontend već ima fallback logiku ako endpoint-i ne rade
- Sve greške se loguju kao warning-ovi, ne kao error-i
- Sistem radi sa test podacima dok se backend ne implementira
- Korisnici automatski dobijaju pristup na osnovu nivoa pristupa
- Admin može davati eksplicitne dozvole za prekoračenje nivoa
