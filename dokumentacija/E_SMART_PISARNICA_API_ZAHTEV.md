# 📋 API Zahtev za e-smart Pisarnicu- EUK Integracija

**Datum:** 2025-01-03  
**Projekt:** EUK Frontend Integracija  
**Kontakt:** Luka Rakić  

---

## 🎯 PREGLED PROJEKTA

### **Cilj Integracije**
Integracija e-smart pisarnice sa EUK sistemom za automatsko preuzimanje svih podataka koji se u pisarnici vode pod brojem **XIX0255**. Potrebni su svi podaci vezani za ovaj broj - zahtevi, ugrožena lica, dokumenti i ostali relevantni podaci.

### **Tok Podataka**
```
Zahtevi (pisarnica - broj XIX0255) → Rešenja (EUK softver) → T1/T2 tabele → Štampanje
```

---

## 📋 TEHNIČKI ZAHTEVI

### **1. API Endpoint**
```
POST /api/pisarnica/zahtevi
```
**Napomena:** Endpoint mora da vrati sve podatke koji se u pisarnici vode pod brojem **XIX0255**. 

### **2. Autentifikacija**
- **Tip:** JWT Bearer Token
- **Header:** `Authorization: Bearer {token}`
- **Expiration:** 24 sata

### **3. Request Format**
```json
{
  "sekretarijatId": 1,
  "brojZahteva": "XIX0255",
  "datumOd": "2024-01-01",
  "datumDo": "2024-12-31",
  "status": "PODNET"
}
```
**Napomena:** Request format je predlog. E-smart firma može da prilagodi format prema svojoj strukturi baze, ali obavezno mora da vrati sve podatke vezane za broj **XIX0255**.

### **4. Response Format (PRIMER)**
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

> **📝 NAPOMENA:** Response format je **PRIMER**. E-smart firma može da prilagodi strukturu prema svojoj bazi, ali obavezno mora da vrati sve podatke vezane za broj **XIX0255**.

---

## 📋 OBAVEZNI PODACI

### **A. ZAHTEVI (ručno upisani na šalterima)**
| Polje | Tip | Opis | Obavezno |
|-------|-----|------|----------|
| `zahtevId` | number | Jedinstveni ID zahteva | ✅ |
| `brojZahteva` | string | Broj zahteva (XIX0255) | ✅ |
| `nazivZahteva` | string | Naziv zahteva | ✅ |
| `status` | string | Status (PODNET, U_OBRADI, ODOBREN, ODBIJEN) | ✅ |
| `datumPodnosenja` | string | Datum podnošenja (YYYY-MM-DD) | ✅ |
| `salterId` | number | ID šaltera | ✅ |
| `salterNaziv` | string | Naziv šaltera | ✅ |
| `kategorijaId` | number | ID kategorije | ✅ |
| `kategorijaNaziv` | string | Naziv kategorije | ✅ |

### **B. UGROŽENA LICA**
| Polje | Tip | Opis | Obavezno |
|-------|-----|------|----------|
| `ugrozenoLiceId` | number | ID ugroženog lica | ✅ |
| `zahtevId` | number | ID zahteva (veza) | ✅ |
| `redniBroj` | string | Redni broj | ✅ |
| `ime` | string | Ime | ✅ |
| `prezime` | string | Prezime | ✅ |
| `jmbg` | string | JMBG (13 cifara) | ✅ |
| `pttBroj` | string | PTT broj | ❌ |
| `gradOpstina` | string | Grad/Opština | ❌ |
| `mesto` | string | Mesto | ❌ |
| `ulicaIBroj` | string | Ulica i broj | ❌ |
| `brojClanovaDomacinstva` | number | Broj članova domaćinstva | ❌ |
| `osnovSticanjaStatusa` | string | Osnov sticanja statusa (MP, NSP, DD, UDTNP) | ❌ |
| `edBroj` | string | ED broj | ❌ |
| `potrosnjaKwh` | number | Potrošnja u kWh | ❌ |
| `zagrevanaPovrsinaM2` | number | Zagrevana površina u m² | ❌ |
| `iznosUmanjenjaSaPdv` | number | Iznos umanjenja sa PDV-om | ❌ |
| `brojRacuna` | string | Broj računa | ❌ |
| `datumIzdavanjaRacuna` | string | Datum izdavanja računa (YYYY-MM-DD) | ❌ |
| `datumTrajanjaPrava` | string | Datum trajanja prava (YYYY-MM-DD) | ❌ |

---

## 🔧 TEHNIČKE SPECIFIKACIJE

### **1. Rate Limiting**
| Parametar | Vrednost | Opis |
|-----------|----------|------|
| **Maksimum zahteva** | 1000/min | Maksimalni broj zahteva po minuti |
| **Burst limit** | 100/10s | Maksimalni broj zahteva u 10 sekundi |
| **Timeout** | 60s | Timeout za pojedinačni zahtev |
| **Retry policy** | 3 pokušaja | Sa eksponencijalnim backoff-om |

### **2. Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### **3. HTTP Status Kodovi**
| Kod | Status | Opis |
|-----|--------|------|
| `200` | OK | ✅ Uspešan zahtev |
| `400` | Bad Request | ❌ Neispravan zahtev |
| `401` | Unauthorized | 🔒 Neispravan token |
| `429` | Too Many Requests | ⚠️ Prekoračen rate limit |
| `503` | Service Unavailable | 🔧 Privremeno preopterećenje |

### **4. Format Podataka**
| Tip | Specifikacija | Primer |
|-----|---------------|--------|
| **Encoding** | UTF-8 | Cyrillic karakteri podržani |
| **Content-Type** | application/json | JSON format |
| **Datumi** | ISO 8601 | YYYY-MM-DD |
| **Brojevi** | Decimalni | 1500.00 |
| **Stringovi** | Unicode | Potpuna podrška za ćirilicu |

---

## 📝 PRIMERI KORIŠĆENJA

### **🔵 JavaScript/TypeScript**
```javascript
// Osnovni API poziv
const response = await fetch('/api/pisarnica/zahtevi', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    sekretarijatId: 1,
    brojZahteva: 'XIX0255',
    datumOd: '2024-01-01',
    datumDo: '2024-12-31',
    status: 'PODNET'
  })
});

const data = await response.json();
console.log('Zahtevi:', data.data.zahtevi);
```

### **🟢 cURL**
```bash
# Osnovni poziv
curl -X POST "https://pisarnica-api.com/api/pisarnica/zahtevi" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sekretarijatId": 1,
    "brojZahteva": "XIX0255",
    "datumOd": "2024-01-01",
    "datumDo": "2024-12-31",
    "status": "PODNET"
  }'
```

### **🟡 Python**
```python
import requests

# Headers
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
}

# Request data
data = {
    'sekretarijatId': 1,
    'brojZahteva': 'XIX0255',
    'datumOd': '2024-01-01',
    'datumDo': '2024-12-31',
    'status': 'PODNET'
}

# API poziv
response = requests.post(
    'https://pisarnica-api.com/api/pisarnica/zahtevi',
    headers=headers,
    json=data
)

# Rezultat
print('Zahtevi:', response.json()['data']['zahtevi'])
```

---

## 🔒 SIGURNOSNE MERE

### **1. Autentifikacija**
| Parametar | Specifikacija | Opis |
|-----------|---------------|------|
| **Token tip** | JWT Bearer | JSON Web Token |
| **Trajanje** | 24 sata | Token expiration |
| **Storage** | Secure | Sigurno čuvanje tokena |
| **Refresh** | Automatski | Token refresh mehanizam |

### **2. HTTPS**
| Parametar | Specifikacija | Opis |
|-----------|---------------|------|
| **Protokol** | HTTPS | Obavezno za sve API pozive |


### **3. CORS**
| Parametar | Vrednost | Opis |
|-----------|----------|------|
| **Metode** | GET, POST, OPTIONS | Dozvoljene HTTP metode |
| **Headers** | Authorization, Content-Type | Dozvoljeni headers |

---

## 📊 MONITORING I LOGGING

### **1. Rate Limiting Monitoring**
| Funkcionalnost | Opis | Prioritet |
|----------------|------|-----------|
| **Real-time praćenje** | Trenutni status rate limita | 🔴 Visok |
| **Alerts** | Obaveštenja za prekoračenje | 🔴 Visok |
| **Dashboard** | Grafički prikaz metrika | 🟡 Srednji |

### **2. Error Logging**
| Tip | Opis | Format |
|-----|------|--------|
| **Greške** | Detaljno logovanje | JSON |
| **Stack trace** | Debug informacije | Text |
| **Performance** | Response time metrike | Numerički |

### **3. API Analytics**
| Metrika | Jedinica | Opis |
|---------|----------|------|
| **Zahtevi** | /min, /h | Broj zahteva po vremenu |
| **Response time** | ms | Vreme odgovora |
| **Success rate** | % | Procenat uspešnih zahteva |

---

## 🧪 TESTING ZAHTEVI

### **1. Test Environment**
| Komponenta | Specifikacija | Opis |
|------------|---------------|------|
| **Server** | Dedicirani test | Izolovan test environment |
| **Podaci** | Test dataset | Mock podaci za razvoj |
| **Sandbox** | Izolovan | Bez uticaja na produkciju |

### **2. Test Scenarios**
| Scenario | Opis | Status |
|----------|------|--------|
| **Osnovni API** | Standardni poziv | ✅ Obavezan |
| **Rate limiting** | Test prekoračenja limita | ✅ Obavezan |
| **Error handling** | Test grešaka | ✅ Obavezan |
| **Authentication** | Test tokena | ✅ Obavezan |

### **3. Test Data**
| Tip | Opis | Količina |
|-----|------|----------|
| **Sample zahtevi** | Za broj XIX0255 | 10+ |
| **Mock lica** | Ugrožena lica | 50+ |
| **Kategorije** | Test kategorije | 5+ |
| **Šalteri** | Test šalteri | 3+ |

---

## 📋 DODATNI ZAHTEVI

### **1. Dokumentacija**
| Tip | Format | Opis |
|-----|--------|------|
| **API docs** | Swagger/OpenAPI | Automatska dokumentacija |
| **Postman** | Kolekcija | Test kolekcija |
| **Code examples** | Multi-language | JavaScript, Python, cURL |

### **2. Support**
| Nivo | Opis | Dostupnost |
|------|------|------------|
| **Tehnička podrška** | 24/7 support | 🔴 Kritično |
| **Kontakt osoba** | API specijalista | 🟡 Srednji |
| **SLA** | Service Level Agreement | 🟡 Srednji |

### **3. Backup i Recovery**
| Komponenta | Strategija | Opis |
|------------|------------|------|
| **Backup** | Dnevni | Automatski backup |
| **Disaster recovery** | 4h RTO | Vreme oporavka |
| **Data retention** | 7 godina | Pravni zahtevi |

---

## ⚠️ VAŽNE NAPOMENE

1. **`zahtevId` je OBAVEZAN** za svako ugroženo lice
2. **Zahtevi su ručno upisani** na šalterima pisarnice
3. **Svi podaci moraju biti povezani sa zahtevima**
4. **Broj zahteva XIX0255** je specifičan za ovaj slučaj
5. **Rate limiting** je kritičan za stabilnost sistema

---

## 🎯 ZAKLJUČAK

**Potreban je JEDAN endpoint** koji će vratiti sve podatke koji se u pisarnici vode pod brojem **XIX0255**. Ne znamo tačnu strukturu baze pisarnice, ali potrebni su svi relevantni podaci vezani za ovaj broj.

**Tok integracije:**
1. EUK sistem poziva API za preuzimanje zahteva pod brojem **XIX0255**
2. Podaci se obrađuju u EUK softveru
3. Generišu se rešenja
4. Podaci se upisuju u T1/T2 tabele
5. Na kraju se štampaju dokumenti

**Bez ovog API-ja ne može se izvršiti integracija sa EUK sistemom.**

---

**Kontakt za dodatna pitanja:**  
**Email:** luka.rakic@smarttehnologysolution.co.rs  
**Telefon:** +381 66 8392015  
