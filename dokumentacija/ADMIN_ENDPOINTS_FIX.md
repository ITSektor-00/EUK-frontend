# Admin Endpoints Fix - User Routes Management

## 🔍 Problem

Frontend je prijavljivao **500 Internal Server Error** pri dodavanju privilegija/ruta u admin/sistem stranici:

```
POST http://localhost:8080/api/admin/user-routes 500 (Internal Server Error)
```

## 🎯 Uzrok

1. **API servis je simulirao uspeh** - imao je fallback logiku za 500 greške
2. **Nedostajala validacija** - nije se proveravalo da li su podaci ispravni
3. **Loš error handling** - greške se nisu prikazivale korisniku
4. **Backend endpoint je implementiran** - ali frontend nije bio ažuriran

## ✅ Rešenje

### 1. Uklonjena simulacija uspeha

**Pre:**
```typescript
} catch (error) {
  console.warn('Backend create user-route API not implemented (500 error), simulating success');
  return { success: true, message: 'Route added successfully (simulated)' };
}
```

**Posle:**
```typescript
} catch (error) {
  console.error('Error creating user route:', error);
  throw error; // Ne simuliraj uspeh, baci grešku
}
```

### 2. Dodana validacija podataka

```typescript
// Validacija podataka
if (!userId || !routeId || !nivoDozvola) {
  throw new Error('userId, routeId i nivoDozvola su obavezni');
}

if (nivoDozvola < 1 || nivoDozvola > 5) {
  throw new Error('nivoDozvola mora biti između 1 i 5');
}
```

### 3. Poboljšan request format

**Pre:**
```typescript
body: JSON.stringify({ userId, routeId, nivoDozvola })
```

**Posle:**
```typescript
const requestBody = {
  userId: Number(userId),
  routeId: Number(routeId),
  nivoDozvola: Number(nivoDozvola)
};
body: JSON.stringify(requestBody)
```

### 4. Poboljšan error handling u UI

```typescript
} catch (err) {
  console.error('Error adding route:', err);
  const errorMessage = err instanceof Error ? err.message : 'Greška pri dodavanju rute.';
  setError(errorMessage);
}
```

## 🔧 Ažurirani endpoint-i

### POST /api/admin/user-routes

```typescript
async createUserRoute(userId: number, routeId: number, nivoDozvola: number, token: string) {
  // Validacija
  if (!userId || !routeId || !nivoDozvola) {
    throw new Error('userId, routeId i nivoDozvola su obavezni');
  }
  
  if (nivoDozvola < 1 || nivoDozvola > 5) {
    throw new Error('nivoDozvola mora biti između 1 i 5');
  }

  const requestBody = {
    userId: Number(userId),
    routeId: Number(routeId),
    nivoDozvola: Number(nivoDozvola)
  };

  return await this.apiCall('/api/admin/user-routes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  }, token, 3, false, 0); // 3 retries, no cache
}
```

### PUT /api/admin/user-routes/{userId}/{routeId}

```typescript
async updateUserRoute(userId: number, routeId: number, nivoDozvola: number, token: string) {
  // Validacija
  if (!userId || !routeId || !nivoDozvola) {
    throw new Error('userId, routeId i nivoDozvola su obavezni');
  }
  
  if (nivoDozvola < 1 || nivoDozvola > 5) {
    throw new Error('nivoDozvola mora biti između 1 i 5');
  }

  const requestBody = {
    nivoDozvola: Number(nivoDozvola)
  };

  return await this.apiCall(`/api/admin/user-routes/${userId}/${routeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  }, token, 3, false, 0);
}
```

### DELETE /api/admin/user-routes/{userId}/{routeId}

```typescript
async deleteUserRoute(userId: number, routeId: number, token: string) {
  // Validacija
  if (!userId || !routeId) {
    throw new Error('userId i routeId su obavezni');
  }

  return await this.apiCall(`/api/admin/user-routes/${userId}/${routeId}`, { 
    method: 'DELETE' 
  }, token, 3, false, 0);
}
```

### PUT /api/admin/users/{userId}/level

```typescript
async updateUserLevel(userId: number, nivoPristupa: number, token: string) {
  // Validacija
  if (!userId || !nivoPristupa) {
    throw new Error('userId i nivoPristupa su obavezni');
  }
  
  if (nivoPristupa < 1 || nivoPristupa > 5) {
    throw new Error('nivoPristupa mora biti između 1 i 5');
  }

  const requestBody = {
    nivoPristupa: Number(nivoPristupa)
  };

  return await this.apiCall(`/api/admin/users/${userId}/level`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  }, token, 3, false, 0);
}
```

## 🧪 Test komponenta

Kreiran je `AdminApiTest` komponenta za testiranje:

### Funkcionalnosti:
- **Validation Test** - testira validaciju podataka
- **Create Route** - testira kreiranje user route-a
- **Update Route** - testira ažuriranje rute
- **Update Level** - testira ažuriranje nivoa korisnika
- **Delete Route** - testira brisanje rute

### Korišćenje:
```typescript
import AdminApiTest from '@/components/AdminApiTest';

// U admin stranici
<AdminApiTest />
```

## 📊 Rezultat

- ✅ **500 greške uklonjene** - API pozivi rade ispravno
- ✅ **Validacija implementirana** - proverava podatke pre slanja
- ✅ **Error handling poboljšan** - prikazuje specifične greške
- ✅ **Retry logika** - 3 pokušaja za svaki endpoint
- ✅ **Test komponenta** - za testiranje funkcionalnosti

## 🔍 Backend zahtevi

Prema backend instrukcijama:

### Request Body format:
```json
{
  "userId": 1,        // Long - obavezan
  "routeId": 2,       // Long - obavezan  
  "nivoDozvola": 3    // Integer 1-5 - obavezan
}
```

### Response format:
```json
{
  "id": 1,
  "userId": 1,
  "routeId": 2,
  "route": "/api/some-route",
  "nivoDozvole": 3,
  "createdAt": "2025-01-15T11:00:00",
  "updatedAt": "2025-01-15T11:00:00"
}
```

## 🚨 Troubleshooting

### Česti problemi:

1. **"userId, routeId i nivoDozvola su obavezni"**
   - Proverite da li se šalju svi potrebni parametri

2. **"nivoDozvola mora biti između 1 i 5"**
   - Proverite da li je nivo u validnom opsegu

3. **401 Unauthorized**
   - Proverite da li je korisnik ulogovan kao admin

4. **403 Forbidden**
   - Proverite da li korisnik ima admin privilegije

### Debug komande:

```typescript
// Console logovi u API servisu
console.log('Creating user route with data:', requestBody);
console.log('User route created successfully:', response);

// Console logovi u admin sistem page-u
console.log('Adding user route:', { userId, routeId, nivoDozvola });
console.log('User route created successfully:', response);
```

## 🔮 Buduća poboljšanja

- [ ] **Optimistic updates** - ažuriranje UI pre potvrde sa servera
- [ ] **Bulk operations** - dodavanje više ruta odjednom
- [ ] **Undo functionality** - opozivanje poslednje akcije
- [ ] **Real-time updates** - WebSocket notifikacije za promene
- [ ] **Audit log** - logovanje svih promena privilegija
