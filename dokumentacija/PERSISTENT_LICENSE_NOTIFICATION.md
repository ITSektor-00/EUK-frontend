# Stalno Licencno Obaveštenje

## Pregled

Licencno obaveštenje u navbar-u je sada stalno vidljivo kada je `notification_sent = true` u `licenses` tabeli i ne može se obrisati.

## Funkcionalnosti

### 1. **Stalno Vidljivo**
- Prikazuje se u navbar-u kao ikona sa badge-om
- Ne može se zatvoriti ili obrisati
- Stalno je vidljivo dok `notification_sent` nije `false`

### 2. **Vizuelni Efekti**
- **Animate pulse**: Ikona pulsira da privuče pažnju
- **Animate bounce**: Badge skače da bude upadljiv
- **Gradient background**: Dropdown ima gradient pozadinu
- **Shadow effects**: Duboke senke za bolji vizuelni efekat

### 3. **Dropdown Sadržaj**
- **Naslov**: Veliki, bold tekst sa emoji-ima
- **Poruka**: Detaljna poruka o statusu licence
- **Datum**: Datum isteka licence
- **Akcija**: Dugme za kontaktiranje administratora

### 4. **Stilizovanje**
- **Ikona**: Pulsira i ima bounce badge
- **Dropdown**: Gradient pozadina sa border-om
- **Dugme**: Gradient sa hover efektima
- **Tekst**: Bold i upadljiv

## Korišćenje

### Kada se prikazuje:
- Kada je `notification_sent = true` u `licenses` tabeli
- Kada je licenca istekla ili ističe uskoro
- Stalno je vidljivo u navbar-u

### Kada se ne prikazuje:
- Kada je `notification_sent = false`
- Kada je licenca važeća i ne ističe uskoro
- Kada je greška zbog rate limiting-a

## Implementacija

### LicenseNotification komponenta:
```typescript
// Uvek prikaži ako postoji licence info i (licenca je istekla ili ističe uskoro)
if (!licenseInfo || (!isLicenseExpired && !isLicenseExpiringSoon)) {
  return null;
}
```

### Stilizovanje:
```css
/* Pulsirajuća ikona */
animate-pulse

/* Bounce badge */
animate-bounce

/* Gradient pozadina */
bg-gradient-to-r from-red-50 to-yellow-50

/* Gradient dugme */
bg-gradient-to-r from-blue-600 to-blue-700
```

## Navbar Integracija

Dodato u sve navbar-ove:
- `UserNavbar.tsx` - za obične korisnike
- `AdminNavbar.tsx` - za administratore  
- `Navbar.tsx` - za glavni navbar

## Testiranje

1. Postavite `notification_sent = true` u `licenses` tabeli
2. Licencno obaveštenje će se pojaviti u navbar-u
3. Neće se moći zatvoriti ili obrisati
4. Stalno će biti vidljivo dok se ne postavi `notification_sent = false`

## Napomene

- Obaveštenje je stalno vidljivo i ne može se obrisati
- Vizuelno je upadljivo sa animacijama
- Sadrži sve potrebne informacije o licenci
- Omogućava direktan kontakt sa administratorom
