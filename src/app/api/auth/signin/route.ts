import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await apiRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(body)
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
