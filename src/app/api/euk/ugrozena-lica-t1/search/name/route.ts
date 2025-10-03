import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const ime = searchParams.get('ime');
    const prezime = searchParams.get('prezime');

    if (!token) {
      return NextResponse.json({ error: 'Token je potreban' }, { status: 401 });
    }

    if (!ime || !prezime) {
      return NextResponse.json({ error: 'Ime i prezime su potrebni' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/api/euk/ugrozena-lica-t1/search/name?ime=${ime}&prezime=${prezime}`, {
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
    console.error('Greška pri pretrazi T1 ugroženih lica po imenu i prezimenu:', error);
    return NextResponse.json(
      { error: 'Greška pri pretrazi T1 ugroženih lica po imenu i prezimenu' },
      { status: 500 }
    );
  }
}
