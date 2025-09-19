# WebSocket Implementacija - SockJS + STOMP

## 🚀 Pregled

Implementirana je potpuna WebSocket komunikacija koristeći SockJS i STOMP protokol za real-time updates u EUK aplikaciji.

## 📦 Instalirani paketi

```bash
npm install @stomp/stompjs
```

## 🏗️ Arhitektura

### WebSocket Service (`src/services/websocketService.ts`)

Centralizovani servis za upravljanje WebSocket konekcijama:

```typescript
import { webSocketService } from '../services/websocketService';

// Singleton instance - jedna konekcija za celu aplikaciju
export const webSocketService = new WebSocketService();
```

### Ključne funkcionalnosti:

- **Singleton pattern** - jedna konekcija za celu aplikaciju
- **Automatsko reconnect** - eksponencijalni backoff strategija
- **Subscription management** - upravljanje pretplatama
- **Error handling** - robustno rukovanje greškama
- **Heartbeat** - održavanje konekcije

## 🔌 Konekcija

```typescript
// Automatsko povezivanje prilikom kreiranja servisa
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = new Client({
  webSocketFactory: () => socket,
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});
```

## 📡 Subscription

### Osnovni subscription

```typescript
// Subscribe na topic
webSocketService.subscribe('/topic/messages', (data) => {
  console.log('Message received:', data);
});

// Unsubscribe
webSocketService.unsubscribe('/topic/messages');
```

### EUK specifični subscriptions

```typescript
// Predmeti updates
webSocketService.subscribeToPredmetiUpdates((data) => {
  if (data.type === 'predmet_updated') {
    // Refresh predmeti data
  }
});

// Kategorije updates
webSocketService.subscribeToKategorijeUpdates((data) => {
  // Handle kategorije changes
});

// Ugrožena lica updates
webSocketService.subscribeToUgrozenaLicaUpdates((data) => {
  // Handle ugrožena lica changes
});

// General messages
webSocketService.subscribeToGeneralMessages((data) => {
  // Handle general notifications
});
```

## 📤 Slanje poruka

### Osnovno slanje

```typescript
// Slanje general poruke
webSocketService.sendMessage('Hello from frontend', 'greeting');

// Slanje custom poruke
webSocketService.publish('/app/message', {
  content: 'Custom message',
  timestamp: new Date().toISOString()
});
```

### EUK specifične notifikacije

```typescript
// Notifikacija promene predmeta
webSocketService.notifyPredmetChange('created', predmetId);
webSocketService.notifyPredmetChange('updated', predmetId);
webSocketService.notifyPredmetChange('deleted', predmetId);

// Notifikacija promene kategorije
webSocketService.notifyKategorijaChange('created', kategorijaId);

// Notifikacija promene ugroženog lica
webSocketService.notifyUgrozenoLiceChange('updated', ugrozenoLiceId);
```

## 🔄 Reconnection logika

```typescript
private handleConnectionError(): void {
  if (this.reconnectAttempts < this.maxReconnectAttempts) {
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, 5000 * this.reconnectAttempts); // Exponential backoff
  }
}
```

- **Max pokušaja:** 5
- **Delay:** 5s, 10s, 15s, 20s, 25s
- **Heartbeat:** 4 sekunde

## 🎯 Korišćenje u komponentama

### Predmeti Page

```typescript
useEffect(() => {
  if (!token) return;

  // Subscribe na predmete updates
  webSocketService.subscribeToPredmetiUpdates((data) => {
    if (data.type === 'predmet_updated' || 
        data.type === 'predmet_created' || 
        data.type === 'predmet_deleted') {
      fetchPredmeti(false); // Refresh bez loading spinner-a
    }
  });

  return () => {
    webSocketService.unsubscribe('/topic/predmeti');
  };
}, [token]);
```

### API Test komponenta

```typescript
const runWebSocketTest = async () => {
  if (webSocketService.isConnectedToWebSocket()) {
    // Test slanje poruke
    webSocketService.sendMessage('Test message', 'test');
  }
};
```

## 🔍 Monitoring i debugging

### Console logovi

```typescript
// STOMP debug
console.log('STOMP Debug:', str);

// Connection status
console.log('WebSocketService: STOMP Connected:', frame);

// Message handling
console.log('WebSocket message received:', data);
```

### Status provera

```typescript
// Provera konekcije
if (webSocketService.isConnectedToWebSocket()) {
  console.log('WebSocket je povezan');
}
```

## 🧪 Testiranje

### ApiTest komponenta

- **WebSocket Test** - testira konekciju
- **Message Test** - testira slanje poruka
- **Reconnect Test** - testira ponovno povezivanje

### Test rezultati

- ✅ **SockJS + STOMP konekcija uspešna**
- ✅ **Poruka poslata preko WebSocket-a**
- ❌ **WebSocket greška - server možda nije pokrenut**

## 📋 Backend endpoint-i

### WebSocket endpoint

```
SockJS: http://localhost:8080/ws
```

### Topics

```
/topic/messages      - General messages
/topic/predmeti      - Predmeti updates
/topic/kategorije    - Kategorije updates
/topic/ugrozena-lica - Ugrožena lica updates
```

### Destinations

```
/app/message         - Slanje general poruka
/app/predmet         - Slanje predmet notifikacija
/app/kategorija      - Slanje kategorija notifikacija
/app/ugrozeno-lice   - Slanje ugrožena lica notifikacija
```

## 🔧 Konfiguracija

### Environment varijable

```typescript
// U development-u
const WS_URL = 'http://localhost:8080/ws';

// U production-u (treba dodati)
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'https://euk.onrender.com/ws';
```

### CORS konfiguracija

Backend mora imati konfigurisan CORS za WebSocket:

```java
@CrossOrigin(origins = {"http://localhost:3000", "https://euk-frontend.vercel.app"})
```

## 🚨 Troubleshooting

### Česti problemi

1. **Connection failed**
   - Proverite da li je backend pokrenut
   - Proverite CORS konfiguraciju
   - Proverite firewall settings

2. **Messages not received**
   - Proverite subscription topic-e
   - Proverite da li backend šalje na pravi topic
   - Proverite console logove

3. **Reconnection issues**
   - Proverite network konekciju
   - Proverite backend availability
   - Povećajte maxReconnectAttempts ako je potrebno

### Debug komande

```typescript
// Provera statusa
console.log('WebSocket connected:', webSocketService.isConnectedToWebSocket());

// Manual disconnect/reconnect
webSocketService.disconnect();
// Service će automatski pokušati reconnect

// Test slanje poruke
webSocketService.sendMessage('Debug test', 'debug');
```

## 🔮 Buduća poboljšanja

- [ ] **Authentication** - JWT token u WebSocket konekciji
- [ ] **Message queuing** - offline message queue
- [ ] **Compression** - message compression
- [ ] **Metrics** - connection metrics i monitoring
- [ ] **Load balancing** - multiple WebSocket servers
