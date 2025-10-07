# 📋 API Zahtev za e-smart Pisarnicu

## 🎯 TOK PODATAKA: Zahtevi → Rešenja → T1/T2 → Štampanje

### **POST /api/pisarnica/zahtevi**

**Opis:** Endpoint koji vraća sve zahteve (ručno upisane na šalterima) iz pisarnice za broj XIX0255.

---

## 📋 ZAHTEVANI PODACI

### **1. ZAHTEVI (ručno upisani na šalterima)**
```json
{
  "zahtevId": 12345,
  "brojZahteva": "XIX0255",
  "nazivZahteva": "Zahtev za socijalnu zaštitu",
  "status": "PODNET",
  "datumPodnosenja": "2024-01-15",
  "salterId": 1,
  "salterNaziv": "Šalter 1 - Socijalna zaštita",
  "kategorijaId": 1,
  "kategorijaNaziv": "Socijalna zaštita"
}
```

### **2. UGROŽENA LICA IZ ZAHTEVA**
```json
{
  "ugrozenoLiceId": 1,
  "zahtevId": 12345,  // ← OBAVEZNO! (veza sa zahtevom)
  "redniBroj": "RB001",
  "ime": "Marko",
  "prezime": "Marković",
  "jmbg": "1234567890123",
  "pttBroj": "11000",
  "gradOpstina": "Beograd",
  "mesto": "Zvezdara",
  "ulicaIBroj": "Kralja Milana 1",
  "brojClanovaDomacinstva": 3,
  "osnovSticanjaStatusa": "SOC",
  "edBroj": "ED123456",
  "potrosnjaKwh": 100,
  "zagrevanaPovrsinaM2": 50,
  "iznosUmanjenjaSaPdv": 1500.00,
  "brojRacuna": "123-456-789",
  "datumIzdavanjaRacuna": "2024-01-15",
  "datumTrajanjaPrava": "2024-12-31"
}
```

---

## 🔌 API SPECIFIKACIJA

### **Endpoint:**
```
POST /api/pisarnica/sync
```

### **Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

### **Request Body:**
```json
{
  "sekretarijatId": 1,
  "brojZahteva": "XIX0255",
  "datumOd": "2024-01-01",
  "datumDo": "2024-12-31",
  "status": "PODNET"
}
```

### **Response Format:**
```json
{
  "success": true,
  "message": "Podaci uspešno učitani",
  "data": {
    "zahtevi": [
      {
        "zahtevId": 12345,
        "brojZahteva": "XIX0255",
        "nazivZahteva": "Zahtev za socijalnu zaštitu",
        "status": "PODNET",
        "datumPodnosenja": "2024-01-15",
        "salterId": 1,
        "salterNaziv": "Šalter 1 - Socijalna zaštita",
        "kategorijaId": 1,
        "kategorijaNaziv": "Socijalna zaštita",
        "ugrozenaLica": [
          {
            "ugrozenoLiceId": 1,
            "zahtevId": 12345,
            "redniBroj": "RB001",
            "ime": "Marko",
            "prezime": "Marković",
            "jmbg": "1234567890123",
            "pttBroj": "11000",
            "gradOpstina": "Beograd",
            "mesto": "Zvezdara",
            "ulicaIBroj": "Kralja Milana 1",
            "brojClanovaDomacinstva": 3,
            "osnovSticanjaStatusa": "SOC",
            "edBroj": "ED123456",
            "potrosnjaKwh": 100,
            "zagrevanaPovrsinaM2": 50,
            "iznosUmanjenjaSaPdv": 1500.00,
            "brojRacuna": "123-456-789",
            "datumIzdavanjaRacuna": "2024-01-15",
            "datumTrajanjaPrava": "2024-12-31"
          }
        ]
      }
    ]
  }
}
```

---

## 📋 OBAVEZNI PODACI

### **1. ZAHTEVI (ručno upisani na šalterima)**
- ✅ `zahtevId` - jedinstveni ID zahteva
- ✅ `brojZahteva` - broj zahteva (XIX0255)
- ✅ `nazivZahteva` - naziv zahteva
- ✅ `status` - status zahteva (PODNET, U_OBRADI, ODOBREN, ODBIJEN)
- ✅ `datumPodnosenja` - datum podnošenja zahteva
- ✅ `salterId` - ID šaltera gde je podnet zahtev
- ✅ `salterNaziv` - naziv šaltera
- ✅ `kategorijaId` - ID kategorije
- ✅ `kategorijaNaziv` - naziv kategorije

### **2. UGROŽENA LICA**
- ✅ `ugrozenoLiceId` - ID ugroženog lica
- ✅ `zahtevId` - ID zahteva (OBAVEZNO!)
- ✅ `redniBroj` - redni broj
- ✅ `ime` - ime
- ✅ `prezime` - prezime
- ✅ `jmbg` - JMBG
- ✅ `pttBroj` - PTT broj
- ✅ `gradOpstina` - grad/opština
- ✅ `mesto` - mesto
- ✅ `ulicaIBroj` - ulica i broj
- ✅ `brojClanovaDomacinstva` - broj članova domaćinstva
- ✅ `osnovSticanjaStatusa` - osnov sticanja statusa (MP, NSP, DD, UDTNP)
- ✅ `edBroj` - ED broj
- ✅ `potrosnjaKwh` - potrošnja u kWh
- ✅ `zagrevanaPovrsinaM2` - zagrevana površina u m²
- ✅ `iznosUmanjenjaSaPdv` - iznos umanjenja sa PDV-om
- ✅ `brojRacuna` - broj računa
- ✅ `datumIzdavanjaRacuna` - datum izdavanja računa
- ✅ `datumTrajanjaPrava` - datum trajanja prava

---

## 🔧 TEHNIČKI ZAHTEVI

### **Autentifikacija:**
- JWT token u Authorization header-u
- Ili API key u header-u

### **Format datuma:**
- ISO 8601 format: `YYYY-MM-DD`
- Primer: `2024-01-15`

### **Format brojeva:**
- Decimalni brojevi sa tačkom: `1500.00`
- Celi brojevi: `12345`

### **Encoding:**
- UTF-8 encoding
- Cyrillic karakteri podržani

### **Rate Limiting:**
- **Maksimum zahteva:** 1000 zahteva po minuti
- **Burst limit:** 100 zahteva u 10 sekundi
- **Timeout:** 60 sekundi
- **Retry policy:** 3 pokušaja sa eksponencijalnim backoff-om
- **Rate limit headers:**
  - `X-RateLimit-Limit` - maksimum zahteva
  - `X-RateLimit-Remaining` - preostali zahtevi
  - `X-RateLimit-Reset` - vreme resetovanja (Unix timestamp)
- **HTTP status kodovi:**
  - `429 Too Many Requests` - prekoračen limit
  - `503 Service Unavailable` - privremeno preopterećenje

---

## 📝 PRIMER KORIŠĆENJA

### **JavaScript/TypeScript sa Rate Limiting:**
```javascript
// Funkcija za retry sa eksponencijalnim backoff-om
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Proveri rate limit headers
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');
      
      if (response.status === 429) {
        const resetTime = parseInt(rateLimitReset) * 1000;
        const waitTime = resetTime - Date.now();
        console.log(`Rate limit exceeded. Waiting ${waitTime}ms until reset.`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (response.status === 503) {
        const backoffTime = Math.pow(2, attempt) * 1000; // Eksponencijalni backoff
        console.log(`Service unavailable. Retrying in ${backoffTime}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const backoffTime = Math.pow(2, attempt) * 1000;
      console.log(`Request failed. Retrying in ${backoffTime}ms (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
}

// Korišćenje sa rate limiting podrškom
const response = await fetchWithRetry('/api/pisarnica/sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    sekretarijatId: 1,
    brojPredmeta: 'XIX0255',
    datumOd: '2024-01-01',
    datumDo: '2024-12-31',
    status: 'AKTIVAN'
  })
});

console.log('Predmeti:', response.data.predmeti);
```

### **cURL sa Rate Limiting:**
```bash
# Osnovni poziv
curl -X POST "https://pisarnica-api.com/api/pisarnica/sync" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sekretarijatId": 1,
    "brojPredmeta": "XIX0255",
    "datumOd": "2024-01-01",
    "datumDo": "2024-12-31",
    "status": "AKTIVAN"
  }' \
  -v  # Verbose output za rate limit headers

# Proveri rate limit headers
curl -I "https://pisarnica-api.com/api/pisarnica/sync" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Python sa Rate Limiting:**
```python
import requests
import time
import math

def fetch_with_retry(url, headers, data, max_retries=3):
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(url, headers=headers, json=data, timeout=60)
            
            # Proveri rate limit headers
            rate_limit_remaining = response.headers.get('X-RateLimit-Remaining')
            rate_limit_reset = response.headers.get('X-RateLimit-Reset')
            
            if response.status_code == 429:
                reset_time = int(rate_limit_reset)
                wait_time = reset_time - int(time.time())
                print(f"Rate limit exceeded. Waiting {wait_time}s until reset.")
                time.sleep(wait_time)
                continue
                
            if response.status_code == 503:
                backoff_time = math.pow(2, attempt)
                print(f"Service unavailable. Retrying in {backoff_time}s (attempt {attempt}/{max_retries})")
                time.sleep(backoff_time)
                continue
                
            if not response.ok:
                raise Exception(f"HTTP {response.status_code}: {response.text}")
                
            return response.json()
            
        except Exception as error:
            if attempt == max_retries:
                raise error
            backoff_time = math.pow(2, attempt)
            print(f"Request failed. Retrying in {backoff_time}s (attempt {attempt}/{max_retries})")
            time.sleep(backoff_time)

# Korišćenje
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
}

data = {
    'sekretarijatId': 1,
    'brojPredmeta': 'XIX0255',
    'datumOd': '2024-01-01',
    'datumDo': '2024-12-31',
    'status': 'AKTIVAN'
}

response = fetch_with_retry('https://pisarnica-api.com/api/pisarnica/sync', headers, data)
print('Predmeti:', response['data']['predmeti'])
```

---

## ⚠️ VAŽNE NAPOMENE

1. **`zahtevId` je OBAVEZAN** za svako ugroženo lice
2. **Zahtevi su ručno upisani** na šalterima pisarnice
3. **Osnovni podaci** o ugroženim licima iz zahteva
4. **Energetski podaci** (ED broj, potrošnja, površina)
5. **Finansijski podaci** (iznos, računi, datumi)
6. **Svi podaci moraju biti povezani sa zahtevima**

---

## 🎯 ZAKLJUČAK

**Traži od e-smart pisarnice:**
- **JEDAN endpoint** `/api/pisarnica/zahtevi`
- **Svi zahtevi** (ručno upisani na šalterima) u jednom pozivu
- **Zahtevi sa ugroženim licima** za broj XIX0255
- **JWT autentifikacija**
- **JSON format** sa UTF-8 encoding
- **Rate limiting** informacije:
  - Maksimum 1000 zahteva po minuti
  - Burst limit 100 zahteva u 10 sekundi
  - Rate limit headers (X-RateLimit-*)
  - HTTP 429 i 503 status kodovi
  - Retry policy sa eksponencijalnim backoff-om
- **Test environment** za razvoj
- **Monitoring** rate limit statusa
- **Dokumentacija** za rate limiting

**TOK: Zahtevi (pisarnica) → Rešenja (tvoj softver) → T1/T2 → Štampanje**
