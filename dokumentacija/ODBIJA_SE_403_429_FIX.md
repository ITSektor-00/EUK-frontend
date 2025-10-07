# OДБИЈА СЕ Template 403/429 Error Fix

## Problem
Korisnik je dobijao 403 (Forbidden) i 429 (Too Many Requests) greške kada je pokušavao da učita podatke u OДБИЈА СЕ template tabu:

```
Failed to load resource: the server responded with a status of 403 ()
:8080/api/organizaciona-struktura:1  Failed to load resource: the server responded with a status of 403 ()
:8080/api/obrasci-vrste:1  Failed to load resource: the server responded with a status of 403 ()
:8080/api/kategorije:1  Failed to load resource: the server responded with a status of 429 ()
:8080/api/predmeti:1  Failed to load resource: the server responded with a status of 429 ()
```

## Uzrok
API pozivi se izvršavaju čak i kada korisnik nije autentifikovan, što dovodi do:
- **403 Forbidden**: API endpointi zahtevaju autentifikaciju
- **429 Too Many Requests**: Previše neautentifikovanih zahteva

## Rešenje

### **1. Dodana provera autentifikacije u loadInitialData**
```typescript
const loadInitialData = async () => {
    // Proveri da li je korisnik autentifikovan pre pokretanja API poziva
    if (!isAuthenticated) {
        console.log('User not authenticated, skipping data load');
        return;
    }

    try {
        setLoading(true);
        console.log('Loading initial data for OДБИЈА СЕ template...');
        // ... API pozivi
    } catch (error) {
        // ... error handling
    }
};
```

### **2. Popravljen useEffect dependency array**
```typescript
// ❌ Problem - dependency array se menja
useEffect(() => {
    // ...
}, [isAuthenticated, user]);

// ✅ Rešenje - samo isAuthenticated
useEffect(() => {
    // ...
}, [isAuthenticated]);
```

## Prednosti rešenja

### **1. Sprečava nepotrebne API pozive**
- API pozivi se ne izvršavaju ako korisnik nije autentifikovan
- Sprečava 403 i 429 greške
- Poboljšava performanse

### **2. Stabilan useEffect**
- Dependency array se ne menja između renderovanja
- Nema React warning-a o promeni veličine dependency array-a
- Pouzdaniji lifecycle

### **3. Bolje debug logovanje**
```typescript
console.log('User not authenticated, skipping data load');
```

**Ovo pomaže da vidimo:**
- Da li se API pozivi pokreću
- Zašto se podaci ne učitavaju
- Da li je problem u autentifikaciji

## Testiranje

### **1. Otvorite Developer Tools (F12)**
### **2. Idite na Console tab**
### **3. Idite na `/euk/formulari`**
### **4. Kliknite na "OДБИЈА СЕ Template" tab**

### **5. Ako niste ulogovani:**
```
User not authenticated, skipping data load
```
**Očekivano ponašanje:** Nema API poziva, nema grešaka

### **6. Ako ste ulogovani:**
```
Loading initial data for OДБИЈА СЕ template...
Loaded data: { t1Data: 50, t2Data: 30, ... }
```
**Očekivano ponašanje:** Podaci se učitavaju uspešno

## Napomene

- **Autentifikacija se proverava pre svakog API poziva**
- **useEffect dependency array je stabilan**
- **API pozivi se ne izvršavaju nepotrebno**
- **Debug logovi pomažu u identifikaciji problema**

## Rezultat

✅ **Nema 403 Forbidden grešaka**
✅ **Nema 429 Too Many Requests grešaka**
✅ **API pozivi se izvršavaju samo kada je korisnik autentifikovan**
✅ **Stabilan useEffect bez warning-a**
✅ **Bolje performanse i debug logovanje**

Sada OДБИЈА СЕ template trebalo bi da radi bez grešaka! 🚀
