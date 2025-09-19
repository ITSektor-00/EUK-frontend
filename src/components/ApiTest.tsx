'use client';

import React, { useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function ApiTest() {
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testBackendConnection = async () => {
    setLoading(prev => ({ ...prev, backend: true }));
    try {
      const response = await fetch('http://localhost:8080/api/test/status');
      if (response.ok) {
        const data = await response.text();
        setTestResults(prev => ({ ...prev, backend: `✅ Backend dostupan: ${data}` }));
      } else {
        setTestResults(prev => ({ ...prev, backend: `❌ Backend greška: ${response.status} ${response.statusText}` }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, backend: `❌ Backend nedostupan: ${error instanceof Error ? error.message : 'Nepoznata greška'}` }));
    } finally {
      setLoading(prev => ({ ...prev, backend: false }));
    }
  };

  const testCors = async () => {
    setLoading(prev => ({ ...prev, cors: true }));
    try {
      const response = await fetch('http://localhost:8080/api/test/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setTestResults(prev => ({ ...prev, cors: '✅ CORS test uspešan' }));
      } else {
        setTestResults(prev => ({ ...prev, cors: `❌ CORS greška: ${response.status}` }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, cors: `❌ CORS test neuspešan: ${error instanceof Error ? error.message : 'Nepoznata greška'}` }));
    } finally {
      setLoading(prev => ({ ...prev, cors: false }));
    }
  };

  const testWebSocket = async () => {
    setLoading(prev => ({ ...prev, websocket: true }));
    
    try {
      // Kreiranje SockJS konekcije sa STOMP
      const socket = new SockJS('http://localhost:8080/ws');
      const stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      const timeout = setTimeout(() => {
        setTestResults(prev => ({ ...prev, websocket: '❌ WebSocket timeout - server možda nije pokrenut' }));
        setLoading(prev => ({ ...prev, websocket: false }));
        stompClient.deactivate();
      }, 10000);

      stompClient.onConnect = (frame) => {
        clearTimeout(timeout);
        setTestResults(prev => ({ ...prev, websocket: '✅ SockJS + STOMP konekcija uspešna' }));
        setLoading(prev => ({ ...prev, websocket: false }));
        
        // Test slanje poruke
        stompClient.publish({
          destination: '/app/message',
          body: JSON.stringify({
            content: 'Test message from frontend',
            timestamp: new Date().toISOString()
          })
        });
        
        // Subscribe na topic
        stompClient.subscribe('/topic/messages', (message) => {
          console.log('Test message received:', message.body);
        });
        
        // Zatvaranje konekcije nakon testa
        setTimeout(() => {
          stompClient.deactivate();
        }, 2000);
      };

      stompClient.onStompError = (frame) => {
        clearTimeout(timeout);
        setTestResults(prev => ({ ...prev, websocket: `❌ STOMP greška: ${frame.headers['message']}` }));
        setLoading(prev => ({ ...prev, websocket: false }));
      };

      stompClient.onWebSocketError = (error) => {
        clearTimeout(timeout);
        console.error('WebSocket Error:', error);
        setTestResults(prev => ({ ...prev, websocket: '❌ WebSocket greška - server možda nije pokrenut' }));
        setLoading(prev => ({ ...prev, websocket: false }));
      };

      // Aktiviranje STOMP konekcije
      stompClient.activate();
      
    } catch (error) {
      setTestResults(prev => ({ ...prev, websocket: `❌ WebSocket test neuspešan: ${error instanceof Error ? error.message : 'Nepoznata greška'}` }));
      setLoading(prev => ({ ...prev, websocket: false }));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Backend Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testBackendConnection}
            disabled={loading.backend}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading.backend ? 'Testiram...' : 'Test Backend Connection'}
          </button>
          {testResults.backend && (
            <p className="mt-2 text-sm">{testResults.backend}</p>
          )}
        </div>

        <div>
          <button
            onClick={testCors}
            disabled={loading.cors}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading.cors ? 'Testiram...' : 'Test CORS'}
          </button>
          {testResults.cors && (
            <p className="mt-2 text-sm">{testResults.cors}</p>
          )}
        </div>

        <div>
          <button
            onClick={testWebSocket}
            disabled={loading.websocket}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading.websocket ? 'Testiram...' : 'Test SockJS'}
          </button>
          {testResults.websocket && (
            <p className="mt-2 text-sm">{testResults.websocket}</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Trenutni status:</h3>
        <ul className="text-sm space-y-1">
          <li>• Frontend: Running on port 3001</li>
          <li>• Backend: Should be running on port 8080</li>
          <li>• CORS: Backend must allow requests from localhost:3001</li>
        </ul>
      </div>
    </div>
  );
} 