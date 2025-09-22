import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export interface WebSocketMessage {
  type: string;
  content: any;
  timestamp: string;
}

export interface WebSocketSubscription {
  topic: string;
  callback: (message: any) => void;
}

class WebSocketService {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, WebSocketSubscription> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      // Dinamički određivanje WebSocket URL-a na osnovu environment-a
      const getWebSocketUrl = () => {
        if (typeof window === 'undefined') {
          // Server-side rendering
          return 'http://localhost:8080/ws';
        }
        
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          return 'http://localhost:8080/ws';
        }
        
        // Production - koristi HTTPS protokol ako je stranica učitana preko HTTPS-a
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        return `${protocol}//euk.onrender.com/ws`;
      };
      
      const wsUrl = getWebSocketUrl();
      
      const socket = new SockJS(wsUrl);
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: () => {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: this.handleConnect.bind(this),
        onStompError: this.handleStompError.bind(this),
        onWebSocketError: this.handleWebSocketError.bind(this),
        onWebSocketClose: this.handleWebSocketClose.bind(this),
      });

      this.stompClient.activate();
    } catch (error) {
      this.handleConnectionError();
    }
  }

  private handleConnect(frame: any): void {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Re-subscribe to all topics
    this.subscriptions.forEach((subscription, topic) => {
      this.subscribeToTopic(topic, subscription.callback);
    });
  }

  private handleStompError(frame: any): void {
    this.isConnected = false;
  }

  private handleWebSocketError(error: any): void {
    this.isConnected = false;
    this.handleConnectionError();
  }

  private handleWebSocketClose(event: any): void {
    this.isConnected = false;
    this.handleConnectionError();
  }

  private handleConnectionError(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, 5000 * this.reconnectAttempts); // Exponential backoff
    }
  }

  private subscribeToTopic(topic: string, callback: (message: any) => void): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          callback(message.body);
        }
      });
    }
  }

  // Public methods
  public subscribe(topic: string, callback: (message: any) => void): void {
    this.subscriptions.set(topic, { topic, callback });
    
    if (this.isConnected && this.stompClient) {
      this.subscribeToTopic(topic, callback);
    }
  }

  public unsubscribe(topic: string): void {
    this.subscriptions.delete(topic);
    // Note: STOMP.js doesn't provide unsubscribe method in current version
  }

  public publish(destination: string, message: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(message)
      });
    }
  }

  public sendMessage(content: string, type: string = 'general'): void {
    const message: WebSocketMessage = {
      type,
      content,
      timestamp: new Date().toISOString()
    };
    this.publish('/app/message', message);
  }

  public isConnectedToWebSocket(): boolean {
    return this.isConnected && this.stompClient !== null && this.stompClient.connected;
  }

  public disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
      this.isConnected = false;
      this.subscriptions.clear();
    }
  }

  // Specific methods for EUK application
  public subscribeToPredmetiUpdates(callback: (data: any) => void): void {
    this.subscribe('/topic/predmeti', callback);
  }

  public subscribeToKategorijeUpdates(callback: (data: any) => void): void {
    this.subscribe('/topic/kategorije', callback);
  }

  public subscribeToUgrozenaLicaUpdates(callback: (data: any) => void): void {
    this.subscribe('/topic/ugrozena-lica', callback);
  }

  public subscribeToGeneralMessages(callback: (data: any) => void): void {
    this.subscribe('/topic/messages', callback);
  }

  public notifyPredmetChange(type: 'created' | 'updated' | 'deleted', predmetId: number): void {
    this.publish('/app/predmet', {
      type: `predmet_${type}`,
      predmetId,
      timestamp: new Date().toISOString()
    });
  }

  public notifyKategorijaChange(type: 'created' | 'updated' | 'deleted', kategorijaId: number): void {
    this.publish('/app/kategorija', {
      type: `kategorija_${type}`,
      kategorijaId,
      timestamp: new Date().toISOString()
    });
  }

  public notifyUgrozenoLiceChange(type: 'created' | 'updated' | 'deleted', ugrozenoLiceId: number): void {
    this.publish('/app/ugrozeno-lice', {
      type: `ugrozeno_lice_${type}`,
      ugrozenoLiceId,
      timestamp: new Date().toISOString()
    });
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// Export for testing
export { WebSocketService };
