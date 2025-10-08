import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ edBroj: string }> }
) {
  const { edBroj } = await params;
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token je potreban' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/euk/ugrozena-lica-t2/ed-broj/${edBroj}`, {
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
    console.error('Greška pri pretrazi T2 ugroženih lica po ED broju:', error);
    return NextResponse.json(
      { error: 'Greška pri pretrazi T2 ugroženih lica po ED broju' },
      { status: 500 }
    );
  }
}
