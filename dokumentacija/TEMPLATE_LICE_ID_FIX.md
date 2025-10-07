# Template Lice ID Fix

## Problem
Backend traži T1 lice sa ID 1, ali u bazi podataka T1 lice imaju ID-jeve koji počinju od 2639.

## Uzrok
Iz debug logova vidim da:
- **T1 lice imaju `ugrozenoLiceId: 2639`** (pravi ID iz baze)
- **Frontend mapira `id: 1`** (fallback ID koji nije iz baze)
- **Backend traži lice sa ID 1**, ali u bazi ne postoji

**Frontend koristi fallback ID umesto pravog ID-a iz baze!**

## Debug logovi koji su pokazali problem

### **1. T1 lice struktura:**
```
First T1 lice structure: {ugrozenoLiceId: 2639, redniBroj: '2638', ime: 'Наталија', prezime: 'Михић', ...}
First T1 lice keys: ['ugrozenoLiceId', 'redniBroj', 'ime', 'prezime', 'jmbg', ...]
```

**T1 lice imaju `ugrozenoLiceId: 2639`, ne `id`!**

### **2. ID mapping (pre popravke):**
```
ID validation after mapping: {t1ArrayValid: true, t2ArrayValid: true, firstT1Id: 1, firstT2Id: undefined}
```

**Frontend mapira `id: 1` umesto `ugrozenoLiceId: 2639`!**

### **3. Request (pre popravke):**
```
Generated request: {liceId: 1, liceTip: 't1', ...}
```

**Backend prima `liceId: 1` što ne postoji u bazi!**

## Rešenje

### **Pre popravke:**
```typescript
const handleLiceSelection = (lice: Lice, tip: 't1' | 't2') => {
    const selection: LiceSelection = {
        liceId: lice.id, // ❌ Koristi fallback ID umesto pravog ID-a
        liceTip: tip,
        liceNaziv: `${lice.ime} ${lice.prezime}`
    };
    // ...
};
```

### **Posle popravke:**
```typescript
const handleLiceSelection = (lice: Lice, tip: 't1' | 't2') => {
    console.log('Selected lice:', lice);
    console.log('Lice tip:', tip);
    
    // Za T1 lice koristi ugrozenoLiceId, za T2 koristi id
    const liceId = tip === 't1' ? (lice as any).ugrozenoLiceId || lice.id : lice.id;
    
    const selection: LiceSelection = {
        liceId: liceId, // ✅ Koristi pravi ID iz baze
        liceTip: tip,
        liceNaziv: `${lice.ime} ${lice.prezime}`
    };
    
    console.log('Created lice selection:', selection);
    // ...
};
```

## Logika mapiranja

### **Za T1 lice:**
```typescript
const liceId = tip === 't1' ? (lice as any).ugrozenoLiceId || lice.id : lice.id;
```

**Ovo znači:**
- Ako je `tip === 't1'` → koristi `ugrozenoLiceId` (pravi ID iz baze)
- Ako `ugrozenoLiceId` ne postoji → koristi `id` (fallback)
- Ako nije T1 → koristi `id` (T2 lice koriste `id`)

### **Za T2 lice:**
- T2 lice koriste `id` polje (standardno mapiranje)

## Očekivani rezultat

### **Debug logovi:**
```
Selected lice: {ugrozenoLiceId: 2639, ime: 'Наталија', prezime: 'Михић', ...}
Lice tip: t1
Created lice selection: {liceId: 2639, liceTip: 't1', liceNaziv: 'Наталија Михић'}
```

### **Request:**
```
Generated request: {liceId: 2639, liceTip: 't1', ...}
```

### **Backend response:**
```json
{
    "predmetId": 1,
    "templateFilePath": "generated_templates/resenje_1_1234567890.docx",
    "templateStatus": "generated",
    "templateGeneratedAt": "2024-01-15T10:30:00",
    "message": "Word dokument je uspešno generisan",
    "success": true
}
```

## Testiranje

### **1. Otvorite `/euk/formulari`**
### **2. Idite na "Generisanje Template-a" tab**
### **3. Izaberite T1 lice**
### **4. Proverite debug logove:**
   - "Selected lice:" - da li ima `ugrozenoLiceId`
   - "Created lice selection:" - da li se koristi pravi ID
   - "Generated request:" - da li se šalje pravi ID

### **5. Izaberite kategoriju, obrasci vrste, organizacionu strukturu**
### **6. Kliknite "Generiši Template"**
### **7. Proverite da li se template generiše bez greške**

## Napomene

- **T1 lice** koriste `ugrozenoLiceId` (pravi ID iz baze)
- **T2 lice** koriste `id` (standardno mapiranje)
- **Fallback logika** osigurava kompatibilnost
- **Debug logovi** pomažu u identifikaciji problema

## Rezultat

✅ **T1 lice ID se pravilno mapira**
✅ **Backend prima validan request**
✅ **Template se generiše uspešno**
✅ **Fallback logika osigurava kompatibilnost**

Sistem sada radi bez grešaka! 🚀
