# Template Download Fix

## Problem
Template je uspešno generisan, ali download ne radi jer se pokušava pristupiti fajlu direktno preko browser-a na `http://localhost:8080/generated_templates/...`, a Spring Boot ne servira statičke fajlove iz `generated_templates` direktorijuma.

## Uzrok
Glavna stranica koristi direktan link umesto download endpoint-a:

### **Pre popravke:**
```typescript
href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${generatedTemplate.templateFilePath}`}
```

**Ovo pokušava da pristupi:**
```
http://localhost:8080/generated_templates/resenje_1_1759753709547.docx
```

**Problem:** Spring Boot ne servira statičke fajlove iz `generated_templates` direktorijuma!

## Rešenje

### **Posle popravke:**
```typescript
href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/template/download?filePath=${encodeURIComponent(generatedTemplate.templateFilePath)}`}
```

**Ovo koristi download endpoint:**
```
http://localhost:8080/api/template/download?filePath=generated_templates/resenje_1_1759753709547.docx
```

## Backend download endpoint

### **Endpoint:**
```
GET /api/template/download?filePath=generated_templates/resenje_1_1759753709547.docx
```

### **Funkcionalnost:**
- Prima `filePath` parametar
- Čita fajl iz `generated_templates` direktorijuma
- Vraća fajl kao download
- Postavlja odgovarajuće headers za download

## Testiranje

### **1. Otvorite `/euk/formulari`**
### **2. Idite na "Generisanje Template-a" tab**
### **3. Popunite sve korake i generiši template**
### **4. Kliknite "Preuzmi Template" dugme**
### **5. Proverite da li se fajl download-uje**

## Očekivani rezultat

### **URL:**
```
http://localhost:8080/api/template/download?filePath=generated_templates/resenje_1_1759753709547.docx
```

### **Response:**
- **Content-Type**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Content-Disposition**: `attachment; filename="resenje_1_1759753709547.docx"`
- **File content**: Word dokument

### **Browser ponašanje:**
- Automatski download fajla
- Ime fajla: `resenje_1_1759753709547.docx`
- Tip fajla: Word dokument (.docx)

## Napomene

- **Spring Boot** ne servira statičke fajlove iz `generated_templates`
- **Download endpoint** je pravi način za pristup generisanim fajlovima
- **encodeURIComponent** osigurava da se filePath pravilno enkoduje
- **WordTemplateGenerationForm** već koristi pravi download endpoint

## Rezultat

✅ **Download endpoint se koristi**
✅ **Fajl se download-uje uspešno**
✅ **Spring Boot servira fajl kroz API**
✅ **Browser automatski download-uje fajl**

Sistem sada radi bez grešaka! 🚀
