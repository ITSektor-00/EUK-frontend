# Template Manual Data Format Fix

## Problem
Frontend koristi pogrešan format za `manualData` polja. Backend očekuje:
- `ZAGLAVLJE` (velika slova)
- `OBRAZLOZENJE` (velika slova)
- `DODATNI_PODACI` (velika slova)

A frontend je koristio:
- `zaglavlje` (mala slova)
- `obrazlozenje` (mala slova)
- `dodatniPodaci` (camelCase)

## Rešenje

### **1. Ažuriran ManualData interface**
```typescript
// Pre
export interface ManualData {
    zaglavlje: string;
    obrazlozenje: string;
    dodatniPodaci?: string;
}

// Posle
export interface ManualData {
    ZAGLAVLJE: string;
    OBRAZLOZENJE: string;
    DODATNI_PODACI?: string;
}
```

### **2. Ažuriran WordTemplateGenerationForm**
```typescript
// Pre
manualData: {
    zaglavlje: '',
    obrazlozenje: '',
    dodatniPodaci: ''
}

// Posle
manualData: {
    ZAGLAVLJE: '',
    OBRAZLOZENJE: '',
    DODATNI_PODACI: ''
}
```

### **3. Ažurirana validacija**
```typescript
// Pre
!formData.manualData.zaglavlje || !formData.manualData.obrazlozenje

// Posle
!formData.manualData.ZAGLAVLJE || !formData.manualData.OBRAZLOZENJE
```

### **4. Ažuriran ManualDataStep**
```typescript
// Pre
value={manualData.zaglavlje}
onChange={(e) => handleChange('zaglavlje', e.target.value)}

// Posle
value={manualData.ZAGLAVLJE}
onChange={(e) => handleChange('ZAGLAVLJE', e.target.value)}
```

### **5. Ažuriran GenerationStep**
```typescript
// Pre
{formData.manualData.zaglavlje && (
    <span>{formData.manualData.zaglavlje}</span>
)}

// Posle
{formData.manualData.ZAGLAVLJE && (
    <span>{formData.manualData.ZAGLAVLJE}</span>
)}
```

## Backend format

Backend očekuje `manualData` u ovom formatu:
```json
{
    "manualData": {
        "ZAGLAVLJE": "Ručno uneto zaglavlje",
        "OBRAZLOZENJE": "Ručno uneto obrazloženje",
        "DODATNI_PODACI": "Dodatni podaci ako treba"
    }
}
```

## Testiranje

### **1. Otvorite `/euk/formulari`**
### **2. Idite na "Word Template" tab**
### **3. Popunite sve korake do ručnih podataka**
### **4. Unesite zaglavlje i obrazloženje**
### **5. Kliknite "Generiši Word dokument"**
### **6. Proverite da li se template generiše sa pravilnim podacima**

## Očekivani rezultat

### **Request format:**
```json
{
    "liceId": 2639,
    "liceTip": "t1",
    "kategorijaId": 6,
    "obrasciVrsteId": 1,
    "organizacionaStrukturaId": 2,
    "predmetId": 1,
    "manualData": {
        "ZAGLAVLJE": "Ručno uneto zaglavlje",
        "OBRAZLOZENJE": "Ručno uneto obrazloženje",
        "DODATNI_PODACI": "Dodatni podaci ako treba"
    }
}
```

### **Backend response:**
```json
{
    "predmetId": 1,
    "templateFilePath": "generated_templates/resenje_1_1234567890.doc",
    "templateStatus": "generated",
    "templateGeneratedAt": "2024-01-15T10:30:00",
    "message": "Word dokument je uspešno generisan",
    "success": true
}
```

## Napomene

- **Backend format** zahteva velika slova za `manualData` polja
- **Frontend format** je ažuriran da odgovara backend-u
- **Sve komponente** su ažurirane da koriste novi format
- **Validacija** je ažurirana da koristi nova polja

## Rezultat

✅ **ManualData format je ažuriran**
✅ **Backend prima pravilni format**
✅ **Template se generiše sa ručnim podacima**
✅ **Sve komponente koriste novi format**

Sistem sada koristi pravi format za ručne podatke! 🚀
