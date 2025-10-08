import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '50';

    if (!token) {
      return NextResponse.json({ error: 'Token je potreban' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/euk/ugrozena-lica-t2?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend greška: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Greška pri dohvatanju T2 ugroženih lica:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju T2 ugroženih lica' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token je potreban' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/euk/ugrozena-lica-t2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend greška: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Greška pri kreiranju T2 ugroženog lica:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju T2 ugroženog lica' },
      { status: 500 }
    );
  }
}
