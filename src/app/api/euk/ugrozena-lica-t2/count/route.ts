import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token je potreban' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/euk/ugrozena-lica-t2/count`, {
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
    // Mapiraj totalCount na count za kompatibilnost sa dashboard-om
    const mappedData = {
      count: data.totalCount || data.count || 0
    };
    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Greška pri dohvatanju broja T2 ugroženih lica:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju broja T2 ugroženih lica' },
      { status: 500 }
    );
  }
}
