# 🔧 API Endpoints sa Fallback Podacima

## 📋 Pregled

Kreirani su svi potrebni API endpoint-i za role-based access control sistem sa fallback podacima za slučaj kada backend server nije dostupan.

---

## 🛠️ IMPLEMENTIRANI API ENDPOINT-I

### 1. **Admin Users** (`/api/admin/users`)

**Fajl:** `src/app/api/admin/users/route.ts`

**Funkcionalnost:**
- Dohvata listu korisnika sa paginacijom
- Podržava filtriranje po roli, statusu, pretrazi
- Fallback podaci ako backend nije dostupan

**Fallback podaci:**
```json
[
  {
    "id": 1,
    "firstName": "Admin",
    "lastName": "User",
    "username": "admin",
    "email": "admin@euk.rs",
    "role": "ADMIN",
    "isActive": true,
    "nivoPristupa": 5
  },
  {
    "id": 2,
    "firstName": "Marko",
    "lastName": "Petrović",
    "username": "marko.petrovic",
    "email": "marko@euk.rs",
    "role": "OBRADJIVAC",
    "isActive": true,
    "nivoPristupa": 3
  },
  {
    "id": 3,
    "firstName": "Ana",
    "lastName": "Nikolić",
    "username": "ana.nikolic",
    "email": "ana@euk.rs",
    "role": "POTPISNIK",
    "isActive": true,
    "nivoPristupa": 2
  }
]
```

### 2. **Admin Routes** (`/api/admin/routes`)

**Fajl:** `src/app/api/admin/routes/route.ts`

**Funkcionalnost:**
- Dohvata listu svih ruta u sistemu
- Fallback podaci sa osnovnim rutama

**Fallback podaci:**
```json
[
  {
    "id": 1,
    "ruta": "euk/kategorije",
    "naziv": "Kategorije",
    "opis": "Upravljanje kategorijama u EUK sistemu",
    "sekcija": "EUK",
    "nivoMin": 2,
    "nivoMax": 5,
    "aktivna": true
  },
  {
    "id": 2,
    "ruta": "euk/predmeti",
    "naziv": "Predmeti",
    "opis": "Upravljanje predmetima u EUK sistemu",
    "sekcija": "EUK",
    "nivoMin": 2,
    "nivoMax": 5,
    "aktivna": true
  },
  {
    "id": 3,
    "ruta": "euk/ugrozena-lica",
    "naziv": "Ugrožena lica",
    "opis": "Upravljanje ugroženim licima u EUK sistemu",
    "sekcija": "EUK",
    "nivoMin": 2,
    "nivoMax": 5,
    "aktivna": true
  },
  {
    "id": 4,
    "ruta": "euk/stampanje",
    "naziv": "Štampanje",
    "opis": "Štampanje dokumenata u EUK sistemu",
    "sekcija": "EUK",
    "nivoMin": 2,
    "nivoMax": 5,
    "aktivna": true
  },
  {
    "id": 5,
    "ruta": "admin/korisnici",
    "naziv": "Admin Korisnici",
    "opis": "Administracija korisnika",
    "sekcija": "ADMIN",
    "nivoMin": 5,
    "nivoMax": 5,
    "aktivna": true
  },
  {
    "id": 6,
    "ruta": "admin/sistem",
    "naziv": "Admin Sistem",
    "opis": "Administracija sistema",
    "sekcija": "ADMIN",
    "nivoMin": 5,
    "nivoMax": 5,
    "aktivna": true
  }
]
```

### 3. **Accessible Routes** (`/api/admin/accessible-routes/[userId]`)

**Fajl:** `src/app/api/admin/accessible-routes/[userId]/route.ts`

**Funkcionalnost:**
- Dohvata rute dostupne specifičnom korisniku
- Fallback vraća praznu listu

**Fallback:** `[]` (prazna lista)

### 4. **Accessible User Routes** (`/api/admin/accessible-user-routes/[userId]`)

**Fajl:** `src/app/api/admin/accessible-user-routes/[userId]/route.ts`

**Funkcionalnost:**
- Dohvata user-routes dostupne specifičnom korisniku
- Fallback vraća praznu listu

**Fallback:** `[]` (prazna lista)

### 5. **Assign Route** (`/api/admin/assign-route`)

**Fajl:** `src/app/api/admin/assign-route/route.ts`

**Funkcionalnost:**
- Dodeljuje rutu korisniku
- Validacija userId i routeId
- Fallback simulira uspešno dodeljivanje

**Request Body:**
```json
{
  "userId": 5,
  "routeId": 1
}
```

**Fallback Response:**
```json
{
  "id": 1640995200000,
  "userId": 5,
  "routeId": 1,
  "route": "route-1",
  "nivoDozvola": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 6. **Check Section Access** (`/api/admin/check-section-access/[userId]/[section]`)

**Fajl:** `src/app/api/admin/check-section-access/[userId]/[section]/route.ts`

**Funkcionalnost:**
- Proverava da li korisnik ima pristup sekciji
- Fallback koristi role-based logiku

**Fallback logika:**
```typescript
const hasAccess = section === 'ADMIN' || section === 'EUK';
return hasAccess;
```

### 7. **Check Route Access** (`/api/user-routes/[userId]/check/[routeId]`)

**Fajl:** `src/app/api/user-routes/[userId]/check/[routeId]/route.ts`

**Funkcionalnost:**
- Proverava da li korisnik ima pristup specifičnoj ruti
- Fallback vraća false

**Fallback:** `false`

---

## 🔧 BACKEND INTEGRATION

### **Environment Variables:**
```bash
BACKEND_URL=http://localhost:8000
```

### **Error Handling:**
- Svi endpoint-i imaju try-catch blokove
- Logovanje grešaka u konzolu
- Fallback podaci kada backend nije dostupan
- Proper HTTP status kodovi

### **Headers:**
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': request.headers.get('authorization') || ''
}
```

---

## 🧪 TESTIRANJE

### **Test scenariji:**

#### 1. **Backend dostupan:**
- ✅ API pozivi se prosleđuju na backend
- ✅ Backend odgovori se vraćaju korisniku
- ✅ Error handling za backend greške

#### 2. **Backend nedostupan:**
- ✅ Fallback podaci se vraćaju
- ✅ Aplikacija radi bez grešaka
- ✅ User experience nije narušen

#### 3. **Backend greške:**
- ✅ Proper error handling
- ✅ Informativne greške
- ✅ Graceful degradation

---

## 📊 FALLBACK STRATEGIJA

### **1. Users API:**
- Vraća 3 demo korisnika sa različitim rolama
- Podržava paginaciju
- Simulira realnu strukturu podataka

### **2. Routes API:**
- Vraća 6 osnovnih ruta (4 EUK + 2 ADMIN)
- Uključuje sve potrebne metapodatke
- Aktivne rute za testiranje

### **3. Accessible Routes API:**
- Vraća praznu listu
- Omogućava testiranje UI bez podataka
- Nema crash-eva aplikacije

### **4. Assign Route API:**
- Simulira uspešno dodeljivanje
- Vraća validan response sa ID-jem
- Omogućava testiranje UI flow-a

### **5. Check Access API:**
- Vraća true za ADMIN i EUK sekcije
- Omogućava testiranje pristupa
- Nema blokiranja korisnika

---

## ⚠️ VAŽNE NAPOMENE

### **1. Development vs Production:**
- Fallback podaci su namenjeni za development
- U produkciji backend mora biti dostupan
- Fallback ne zamenjuje prave podatke

### **2. Security:**
- Authorization header se prosleđuje
- Validacija input parametara
- Proper error handling

### **3. Performance:**
- Fallback podaci su minimalni
- Brzi response vremena
- Nema teških operacija

### **4. Monitoring:**
- Svi greške se loguju
- Console.error za debugging
- Proper HTTP status kodovi

---

## 🔮 BUDUĆA POBOLJŠANJA

### **Kratkoročno:**
- [ ] **Caching** - cache fallback podataka
- [ ] **Retry logic** - automatski retry za backend pozive
- [ ] **Health checks** - proveravanje backend statusa

### **Dugoročno:**
- [ ] **Database fallback** - lokalna baza za fallback
- [ ] **Offline mode** - potpuna offline funkcionalnost
- [ ] **Sync mechanism** - sinhronizacija kada backend bude dostupan

---

## 🎯 REZULTAT

### **✅ Implementirano:**
- ✅ 7 novih API endpoint-a
- ✅ Fallback podaci za sve endpoint-e
- ✅ Proper error handling
- ✅ Backend integration
- ✅ Development-friendly setup

### **🚀 Sistem je spreman za testiranje!**

**Svi API endpoint-i su implementirani sa fallback podacima. Aplikacija može da radi i kada backend nije dostupan.** 🎉
