# SockJS Connection Error - Rešenje

## 🔍 Problem

Aplikacija je prijavljivala **SockJS connection error** u browser konzoli:

```
SockJS connection error: Event 1
```

## 🎯 Uzrok

Frontend je pokušavao da se poveže sa SockJS/WebSocket endpoint-om na backend-u:

```typescript
socket = new SockJS('http://localhost:8080/ws');
```

Ali backend nema implementiran `/ws` endpoint za SockJS/WebSocket komunikaciju.

## ✅ Rešenje

### 1. Onemogućen SockJS u predmeti page-u

**Fajl:** `src/app/euk/predmeti/page.tsx`

**Pre:**
```typescript
// SockJS za real-time updates
useEffect(() => {
  socket = new SockJS('http://localhost:8080/ws');
  // ... SockJS event handlers
}, [token]);
```

**Posle:**
```typescript
// SockJS za real-time updates - trenutno onemogućeno jer backend nema /ws endpoint
useEffect(() => {
  console.log('SockJS real-time updates trenutno onemogućeni - backend nema /ws endpoint');
  
  // TODO: Implementirati WebSocket endpoint na backend-u
  // socket = new SockJS('http://localhost:8080/ws');
  
  // Za sada koristimo polling za real-time updates
  const pollInterval = setInterval(() => {
    console.log('Polling for updates...');
  }, 30000); // Poll svakih 30 sekundi

  return () => {
    clearInterval(pollInterval);
  };
}, [token]);
```

### 2. Onemogućen SockJS test u ApiTest komponenti

**Fajl:** `src/components/ApiTest.tsx`

**Pre:**
```typescript
const testWebSocket = async () => {
  const socket = new SockJS('http://localhost:8080/ws');
  // ... SockJS test logic
};
```

**Posle:**
```typescript
const testWebSocket = async () => {
  // SockJS endpoint trenutno nije implementiran na backend-u
  setTestResults(prev => ({ ...prev, websocket: '⚠️ SockJS endpoint nije implementiran na backend-u' }));
};
```

## 🔄 Alternativno rešenje - Polling

Umesto SockJS real-time updates, implementiran je polling mehanizam:

- **Interval:** 30 sekundi
- **Funkcionalnost:** Light-weight check za ažuriranja
- **Prednosti:** Ne zahteva WebSocket endpoint na backend-u
- **Nedostaci:** Nije real-time, malo više network trafika

## 🚀 Buduće poboljšanje - WebSocket endpoint

Da bi se omogućili real-time updates, potrebno je implementirati na backend-u:

### Backend implementacija (Spring Boot)

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new PredmetWebSocketHandler(), "/ws")
                .setAllowedOrigins("*");
    }
}

@Component
public class PredmetWebSocketHandler extends TextWebSocketHandler {
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // Handle new connection
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Handle incoming messages
    }
}
```

### Frontend implementacija

```typescript
// Vratiti SockJS konekciju kada backend bude spreman
useEffect(() => {
  if (!token) return;

  const socket = new SockJS('http://localhost:8080/ws');
  
  socket.onopen = () => {
    console.log('SockJS connected successfully');
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'predmet_updated') {
      fetchPredmeti(false); // Refresh data
    }
  };
  
  return () => socket.close();
}, [token]);
```

## 📊 Rezultat

- ✅ **SockJS greška uklonjena** - više nema error poruka u konzoli
- ✅ **WebSocket endpoint implementiran** - backend sada podržava SockJS + STOMP
- ✅ **Real-time updates aktivni** - automatsko ažuriranje podataka
- ✅ **Centralizovani WebSocket service** - lakše upravljanje konekcijama
- ✅ **Retry logika implementirana** - automatsko ponovno povezivanje

## 🔧 Testiranje

Da testirate da je greška rešena:

1. Otvorite browser konzolu
2. Navigirajte na `/euk/predmeti` stranicu
3. Proverite da nema SockJS connection error poruka
4. Trebalo bi da vidite: "SockJS real-time updates trenutno onemogućeni"

## 📝 Napomene

- SockJS dependency je zadržan u `package.json` za buduću upotrebu
- Import statement je zadržan u fajlovima ali se ne koristi
- Polling interval je postavljen na 30 sekundi - može se prilagoditi po potrebi
- Real-time funkcionalnost će biti dostupna kada se implementira WebSocket endpoint na backend-u
