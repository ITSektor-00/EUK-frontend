import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/config/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Nema authorization header-a' },
        { status: 401 }
      );
    }
    
    const response = await apiRequest('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      }
    });

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return NextResponse.json({ message: text }, { status: response.status });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Greška pri komunikaciji sa backend-om' },
      { status: 500 }
    );
  }
} 
