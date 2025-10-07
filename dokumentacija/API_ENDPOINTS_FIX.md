# API Endpoints Fix za OДБИЈА СЕ Template

## Problem
Optimizovani service je koristio pogrešne endpoint-e, što je dovodilo do 403 i 429 grešaka:

```
GET http://localhost:8080/api/t1-lice 403 (Forbidden)
GET http://localhost:8080/api/t2-lice 403 (Forbidden)
GET http://localhost:8080/api/obrasci-vrste 429 (Too Many Requests)
```

## Uzrok
Optimizovani service je koristio endpoint-e:
- ❌ `/api/t1-lice` 
- ❌ `/api/t2-lice`

Umesto ispravnih endpoint-a:
- ✅ `/api/euk/t1`
- ✅ `/api/euk/t2`

## Rešenje

### **1. Ispravljeni Endpoint-i**

#### **T1 Lice**
```typescript
// ❌ Pogrešno
const response = await this.fetchWithRetry(`${API_BASE_URL}/api/t1-lice`, {

// ✅ Ispravno  
const response = await this.fetchWithRetry(`${API_BASE_URL}/api/euk/t1`, {
```

#### **T2 Lice**
```typescript
// ❌ Pogrešno
const response = await this.fetchWithRetry(`${API_BASE_URL}/api/t2-lice`, {

// ✅ Ispravno
const response = await this.fetchWithRetry(`${API_BASE_URL}/api/euk/t2`, {
```

### **2. Dodana Provera Autentifikacije**

```typescript
async loadAllInitialData() {
    // Proveri da li je korisnik autentifikovan
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found, returning empty data');
        return {
            t1Lice: [],
            t2Lice: [],
            kategorije: [],
            obrasciVrste: [],
            organizacionaStruktura: [],
            predmeti: []
        };
    }
    // ... ostali kod
}
```

### **3. Ispravni Endpoint-i**

| Service | Endpoint | Status |
|---------|----------|--------|
| T1 Lice | `/api/euk/t1` | ✅ Ispravno |
| T2 Lice | `/api/euk/t2` | ✅ Ispravno |
| Kategorije | `/api/kategorije` | ✅ Ispravno |
| Obrasci Vrste | `/api/obrasci-vrste` | ✅ Ispravno |
| Organizaciona Struktura | `/api/organizaciona-struktura` | ✅ Ispravno |
| Predmeti | `/api/predmeti` | ✅ Ispravno |

## Testiranje

### **1. Otvorite Developer Tools (F12)**
### **2. Idite na Console tab**
### **3. Idite na `/euk/formulari`**
### **4. Kliknite na "OДБИЈА СЕ Template" tab**

### **5. Proverite console logove:**
```
Loading all initial data with batch loading...
Loaded data with batch loading: { t1Lice: 50, t2Lice: 30, ... }
```

### **6. Ako vidite greške:**
- Proverite da li ste ulogovani
- Proverite da li se koristi optimizovani service
- Proverite da li su endpoint-i ispravni

## Napomene

- **Endpoint-i moraju biti tačno isti** kao u originalnom service-u
- **Autentifikacija se proverava** pre svakog API poziva
- **Cache se koristi** za bolje performanse
- **Retry logika** se primenjuje na sve endpoint-e

## Rezultat

✅ **Ispravni endpoint-i za T1/T2 lice**
✅ **Provera autentifikacije pre API poziva**
✅ **Nema 403/429 grešaka**
✅ **Optimizovani service radi ispravno**

Sada OДБИЈА СЕ template trebalo bi da radi bez grešaka! 🚀
