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
      console.log('WebSocketService: Connecting to WebSocket...');
      
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
      console.log('WebSocketService: Connecting to:', wsUrl);
      
      const socket = new SockJS(wsUrl);
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
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
      console.error('WebSocketService: Failed to create connection:', error);
      this.handleConnectionError();
    }
  }

  private handleConnect(frame: any): void {
    console.log('WebSocketService: STOMP Connected:', frame);
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Re-subscribe to all topics
    this.subscriptions.forEach((subscription, topic) => {
      this.subscribeToTopic(topic, subscription.callback);
    });
  }

  private handleStompError(frame: any): void {
    console.error('WebSocketService: STOMP Error:', frame.headers['message']);
    console.error('WebSocketService: STOMP Error Details:', frame.body);
    this.isConnected = false;
  }

  private handleWebSocketError(error: any): void {
    console.error('WebSocketService: WebSocket Error:', error);
    this.isConnected = false;
    this.handleConnectionError();
  }

  private handleWebSocketClose(event: any): void {
    console.log('WebSocketService: WebSocket connection closed:', event);
    this.isConnected = false;
    this.handleConnectionError();
  }

  private handleConnectionError(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocketService: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect();
      }, 5000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.error('WebSocketService: Max reconnection attempts reached');
    }
  }

  private subscribeToTopic(topic: string, callback: (message: any) => void): void {
    if (this.stompClient && this.stompClient.connected) {
      console.log(`WebSocketService: Subscribing to topic: ${topic}`);
      this.stompClient.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('WebSocketService: Error parsing message:', error);
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
    console.log(`WebSocketService: Unsubscribed from topic: ${topic}`);
  }

  public publish(destination: string, message: any): void {
    if (this.stompClient && this.stompClient.connected) {
      console.log(`WebSocketService: Publishing message to ${destination}:`, message);
      this.stompClient.publish({
        destination,
        body: JSON.stringify(message)
      });
    } else {
      console.warn('WebSocketService: Cannot publish message - not connected');
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
      console.log('WebSocketService: Disconnecting...');
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
