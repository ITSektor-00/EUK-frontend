# System Roles Update - Tri uloge u sistemu

## 🎯 Pregled

Sistem je prilagođen da podržava samo **tri osnovne uloge**:

1. **👑 ADMIN** - Administrator u bazi
2. **📋 OBRADJIVAC** - Obrađivač predmeta  
3. **✍️ POTPISNIK** - Potpisnik dokumenata

## 🔧 Implementirane izmene

### ✅ Popravka starih prikaza nivoa

**Problem:** Još uvek su se prikazivali stari nivoi 1-5 umesto novog sistema sa tri uloge.

**Rešenje:**
- ✅ Ažuriran `RouteGuard.tsx` - samo nivoi 2, 3, 5
- ✅ Ažuriran `UserLevelManager.tsx` - prikazuje samo tri uloge
- ✅ Ažuriran `profile/page.tsx` - progress bar sa tri nivoa
- ✅ Uklonjen stari prikaz "Доступне функционалности" sa nivoima 1-5

### 1. Definicija uloga u sistemu

```typescript
const SYSTEM_ROLES = {
  ADMIN: {
    name: 'ADMIN',
    displayName: 'Administrator',
    description: 'Pun pristup sistemu',
    icon: '👑',
    level: 5
  },
  OBRADJIVAC: {
    name: 'OBRADJIVAC',
    displayName: 'Obrađivač predmeta',
    description: 'Obrađuje predmete u EUK sistemu',
    icon: '📋',
    level: 3
  },
  POTPISNIK: {
    name: 'POTPISNIK',
    displayName: 'Potpisnik',
    description: 'Potpisuje dokumente',
    icon: '✍️',
    level: 2
  }
};
```

### 2. Route kategorije prilagođene ulogama

```typescript
const routeCategories = [
  {
    name: 'EUK Sistem',
    routes: ['euk/kategorije', 'euk/predmeti', 'euk/ugrozena-lica', 'euk/stampanje'],
    description: 'Osnovne EUK funkcionalnosti',
    icon: '📁'
  },
  {
    name: 'Administracija',
    routes: ['admin/korisnici', 'admin/sistem'],
    description: 'Administrativne funkcije',
    icon: '⚙️'
  },
  {
    name: 'Korisnički profil',
    routes: ['profile', 'settings'],
    description: 'Korisničke postavke',
    icon: '👤'
  }
];
```

### 3. Filtriranje ruta po ulogama

#### ADMIN (Nivo 5)
- **Pristup:** Svi sistemi
- **Rute:** Sve dostupne rute
- **Funkcionalnosti:** 
  - Upravljanje korisnicima
  - Upravljanje sistemom
  - Pregled izveštaja
  - EUK funkcionalnosti

#### OBRADJIVAC (Nivo 3)
- **Pristup:** EUK sistem + profil
- **Rute:** 
  - `euk/kategorije`
  - `euk/predmeti`
  - `euk/ugrozena-lica`
  - `euk/stampanje`
  - `profile`
  - `settings`
- **Funkcionalnosti:**
  - Obrađivanje predmeta
  - Upravljanje kategorijama
  - Upravljanje ugroženim licima
  - Štampanje dokumenata

#### POTPISNIK (Nivo 2)
- **Pristup:** Štampanje + profil
- **Rute:**
  - `euk/stampanje`
  - `profile`
  - `settings`
- **Funkcionalnosti:**
  - Potpisivanje dokumenata
  - Pregled štampanih dokumenata

## 🎨 UI prilagođavanja

### 1. Role filter dropdown

```typescript
<select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
  <option value="all">СВЕ УЛОГЕ</option>
  <option value="ADMIN">👑 АДМИНИСТРАТОР</option>
  <option value="OBRADJIVAC">📋 ОБРАЂИВАЧ ПРЕДМЕТА</option>
  <option value="POTPISNIK">✍️ ПОТПИСНИК</option>
</select>
```

### 2. User card prikaz

```typescript
<span className={`px-2 py-1 text-xs rounded-full ${
  user.role === 'ADMIN' 
    ? 'bg-purple-100 text-purple-800' 
    : user.role === 'OBRADJIVAC'
    ? 'bg-blue-100 text-blue-800'
    : user.role === 'POTPISNIK'
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800'
}`}>
  {user.role === 'ADMIN' ? '👑 ADMIN' :
   user.role === 'OBRADJIVAC' ? '📋 ОБРАЂИВАЧ' :
   user.role === 'POTPISNIK' ? '✍️ ПОТПИСНИК' :
   user.role}
</span>
```

### 3. Nivo pristupa prikaz

```typescript
<span className={`px-2 py-1 text-xs rounded-full ${
  user.nivoPristupa >= 5 ? 'bg-purple-100 text-purple-800' :
  user.nivoPristupa >= 3 ? 'bg-blue-100 text-blue-800' :
  user.nivoPristupa >= 2 ? 'bg-green-100 text-green-800' :
  'bg-red-100 text-red-800'
}`}>
  Ниво {user.nivoPristupa} - {
    user.nivoPristupa >= 5 ? '👑 Администратор' :
    user.nivoPristupa >= 3 ? '📋 Обрађивач' :
    user.nivoPristupa >= 2 ? '✍️ Потписник' :
    '❌ Нема приступ'
  }
</span>
```

## 🔐 RouteLevelManager prilagođavanja

### Filtriranje ruta po ulogama

```typescript
const getFilteredRoutes = () => {
  if (userRole === 'ADMIN') {
    return routes; // Admin vidi sve rute
  } else if (userRole === 'OBRADJIVAC') {
    return routes.filter(route => 
      route.sekcija === 'EUK' || 
      route.ruta === 'profile' || 
      route.ruta === 'settings'
    );
  } else if (userRole === 'POTPISNIK') {
    return routes.filter(route => 
      route.ruta === 'euk/stampanje' || 
      route.ruta === 'profile' || 
      route.ruta === 'settings'
    );
  }
  return routes;
};
```

## 👤 UserLevelManager prilagođavanja

### Dostupni nivoi po ulogama

```typescript
const getAvailableLevels = () => {
  if (userRole === 'ADMIN') {
    return [5]; // Samo admin nivo
  } else if (userRole === 'OBRADJIVAC') {
    return [3]; // Samo obrađivač nivo
  } else if (userRole === 'POTPISNIK') {
    return [2]; // Samo potpisnik nivo
  }
  return [2, 3, 5]; // Svi nivoi ako uloga nije definisana
};
```

### Prikaz nivoa

```typescript
const getLevelDisplayName = (level: number) => {
  const names = {
    2: '✍️ Потписник',
    3: '📋 Обрађивач предмета',
    5: '👑 Администратор'
  };
  return names[level] || `Ниво ${level}`;
};

const getLevelIcon = (level: number) => {
  const icons = {
    2: '✍️', // Potpisnik
    3: '📋', // Obrađivač
    5: '👑'  // Admin
  };
  return icons[level] || '⚪';
};
```

## 📊 Matrica pristupa

| Uloga | EUK Kategorije | EUK Predmeti | EUK Ugrožena lica | EUK Štampanje | Admin Korisnici | Admin Sistem | Profil | Podešavanja |
|-------|----------------|--------------|-------------------|---------------|-----------------|--------------|---------|-------------|
| 👑 ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 📋 OBRADJIVAC | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| ✍️ POTPISNIK | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |

## 🔄 Migracija postojećih korisnika

### Preporučena migracija:

1. **Postojeći admin korisnici** → `ADMIN` (nivo 5)
2. **Korisnici sa nivoom 3-4** → `OBRADJIVAC` (nivo 3)
3. **Korisnici sa nivoom 2** → `POTPISNIK` (nivo 2)
4. **Korisnici sa nivoom 1** → `POTPISNIK` (nivo 2) ili deaktivacija

### SQL migracija (primjer):

```sql
-- Ažuriranje uloga na osnovu nivoa pristupa
UPDATE users SET role = 'ADMIN' WHERE nivo_pristupa >= 5;
UPDATE users SET role = 'OBRADJIVAC' WHERE nivo_pristupa >= 3 AND nivo_pristupa < 5;
UPDATE users SET role = 'POTPISNIK' WHERE nivo_pristupa = 2;

-- Ažuriranje nivoa pristupa na osnovu uloge
UPDATE users SET nivo_pristupa = 5 WHERE role = 'ADMIN';
UPDATE users SET nivo_pristupa = 3 WHERE role = 'OBRADJIVAC';
UPDATE users SET nivo_pristupa = 2 WHERE role = 'POTPISNIK';
```

## 🧪 Testiranje

### Test scenariji:

1. **Admin korisnik:**
   - Treba da vidi sve rute
   - Treba da može da upravlja svim korisnicima
   - Treba da ima pristup admin panelu

2. **Obrađivač predmeta:**
   - Treba da vidi samo EUK rute + profil
   - Ne treba da vidi admin rute
   - Treba da može da obrađuje predmete

3. **Potpisnik:**
   - Treba da vidi samo štampanje + profil
   - Ne treba da vidi EUK rute (osim štampanja)
   - Treba da može da potpisuje dokumente

## 📝 Napomene

- **Backward compatibility:** Sistem podržava postojeće korisnike tokom migracije
- **Flexibility:** Lako dodavanje novih uloga u budućnosti
- **Security:** Svaka uloga ima ograničen pristup samo potrebnim funkcionalnostima
- **UI/UX:** Jasno razlikovanje uloga sa ikonama i bojama

## 🔮 Buduća poboljšanja

- [ ] **Granular permissions** - finija kontrola pristupa na nivou akcija
- [ ] **Role inheritance** - nasleđivanje dozvola između uloga
- [ ] **Temporary permissions** - privremene dozvole
- [ ] **Audit logging** - logovanje svih promena pristupa
- [ ] **Role templates** - preddefinisani šabloni uloga
