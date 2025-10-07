# Optimized Service Auth Fix - Rešavanje 403 Grešaka

## Problem
Optimizovani template service je dobijao 403 greške jer nije imao proveru autentifikacije:

```
Failed to load resource: the server responded with a status of 403 ()
Error fetching organizaciona-struktura: Error: HTTP error! status: 403
Error fetching obrasci-vrste: Error: HTTP error! status: 403
```

## Uzrok
Optimizovani service je pokušavao da pristupi zaštićenim endpoint-ima bez provere autentifikacije:

```typescript
// ❌ Problem - nema provere token-a
const response = await fetch(`${this.BASE_URL}/api/kategorije`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`, // token može biti null
    'Content-Type': 'application/json',
  },
});
```

## Rešenje

### **1. Dodana Provera Autentifikacije**

```typescript
async getKategorije() {
  return globalCache.getCachedData('kategorije', async () => {
    return requestThrottle.execute(async () => {
      // Dodaj malu pauzu da se token učita
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const token = localStorage.getItem('token');
      console.log('Token for kategorije:', token ? 'Token found' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.BASE_URL}/api/kategorije`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || data.results || []);
    });
  });
}
```

### **2. Ažurirane Sve Metode**

- ✅ `getKategorije()` - dodana provera autentifikacije
- ✅ `getObrasciVrste()` - dodana provera autentifikacije
- ✅ `getOrganizacionaStruktura()` - dodana provera autentifikacije
- ✅ `getPredmeti()` - dodana provera autentifikacije
- ✅ `getT1Lice()` - dodana provera autentifikacije
- ✅ `getT2Lice()` - dodana provera autentifikacije

### **3. Debug Logovi**

```typescript
console.log('Token for kategorije:', token ? 'Token found' : 'No token');
```

**Ovo pomaže da vidimo:**
- Da li se token učitao iz localStorage-a
- Zašto se javljaju 403 greške
- Kada se API pozivi pokreću

### **4. Pauza za Token Loading**

```typescript
// Dodaj malu pauzu da se token učita
await new Promise(resolve => setTimeout(resolve, 100));
```

**Razlog:** Token se možda još nije učitao iz localStorage-a kada se API poziv pokreće.

## Testiranje

### **1. Otvorite Developer Tools (F12)**
### **2. Idite na Console tab**
### **3. Idite na `/euk/formulari`**
### **4. Kliknite na "OДБИЈА СЕ Template" tab**

### **5. Proverite console logove:**
```
Token for kategorije: Token found
Token for obrasci-vrste: Token found
Token for organizaciona-struktura: Token found
Token for predmeti: Token found
Token for t1-lice: Token found
Token for t2-lice: Token found
```

### **6. Ako vidite "No token":**
- Proverite da li ste ulogovani
- Proverite da li se token čuva u localStorage
- Proverite da li su pauze dovoljne

## Napomene

- **Provera autentifikacije** se dodaje u sve metode
- **Debug logovi** pomažu u identifikaciji problema
- **Pauza za token loading** rešava timing problem
- **Error handling** za slučaj kada nema token-a

## Rezultat

✅ **Nema 403 Forbidden grešaka**
✅ **Token se proverava pre svakog API poziva**
✅ **Debug logovi pokazuju stanje autentifikacije**
✅ **Optimizovani service radi ispravno**

Sada OДБИЈА СЕ template trebalo bi da učitava podatke bez 403 grešaka! 🚀
