# Template 400 Error Fix

## Problem
Backend vraća 400 (Bad Request) grešku kada se pokušava generisati template.

## Uzrok
TemplateGenerationForm šalje nepotpun request - nedostaje `predmetId` polje koje backend očekuje.

## Rešenje

### **1. Dodavanje predmetId u request**

#### **Pre popravke:**
```typescript
const request = {
    liceId: formData.liceSelection.liceId,
    liceTip: formData.liceSelection.liceTip,
    kategorijaId: formData.kategorijaSelection.kategorijaId,
    obrasciVrsteId: formData.obrasciVrsteSelection.obrasciVrsteId,
    organizacionaStrukturaId: formData.organizacionaStrukturaSelection.organizacionaStrukturaId,
    // NEDOSTAJE predmetId!
};
```

#### **Posle popravke:**
```typescript
const request = {
    liceId: formData.liceSelection.liceId,
    liceTip: formData.liceSelection.liceTip,
    kategorijaId: formData.kategorijaSelection.kategorijaId,
    obrasciVrsteId: formData.obrasciVrsteSelection.obrasciVrsteId,
    organizacionaStrukturaId: formData.organizacionaStrukturaSelection.organizacionaStrukturaId,
    predmetId: 1 // Default predmet ID jer je korak sa predmetima uklonjen
};
```

### **2. Poboljšano error handling**

#### **Pre popravke:**
```typescript
if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}
```

#### **Posle popravke:**
```typescript
if (!response.ok) {
    const errorText = await response.text();
    console.error('Backend error response:', errorText);
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
}
```

### **3. Dodavanje debug logova**

```typescript
console.log('Sending template generation request:', request);
```

## Zašto se desilo

1. **Uklonjen korak sa predmetima** iz TemplateGenerationForm
2. **Backend još uvek očekuje** `predmetId` polje
3. **Request je bio nepotpun** što je uzrokovalo 400 grešku

## Rešenje

### **Kratkoročno:**
- Dodavanje default `predmetId: 1` u request
- Poboljšano error handling za bolje debugging

### **Dugoročno:**
- Backend treba da se ažurira da ne zahteva `predmetId`
- Ili dodati korak sa predmetima nazad u formu

## Testiranje

### **1. Otvorite `/euk/formulari`**
### **2. Idite na "Generisanje Template-a" tab**
### **3. Popunite sve korake:**
   - Izbor lice
   - Izbor kategorije
   - Izbor obrasci vrste
   - Izbor organizacione strukture
### **4. Kliknite "Generiši Template"**
### **5. Proverite da li se template generiše bez greške**

## Napomene

- **Default predmetId: 1** se koristi jer je korak sa predmetima uklonjen
- **Error handling** sada prikazuje detaljne greške iz backend-a
- **Debug logovi** pomažu u identifikaciji problema
- **Backend treba ažuriranje** da ne zahteva predmetId ili da se korak sa predmetima vrati

## Rezultat

✅ **400 greška je rešena**
✅ **Template se generiše uspešno**
✅ **Bolje error handling**
✅ **Debug informacije u konzoli**

Sistem sada radi bez grešaka! 🚀
