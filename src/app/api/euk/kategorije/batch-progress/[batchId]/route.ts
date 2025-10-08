import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token je potreban' }, { status: 401 });
    }

    const resolvedParams = await params;
    const response = await fetch(`${API_BASE_URL}/api/euk/kategorije/batch-progress/${resolvedParams.batchId}`, {
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
    const resolvedParams = await params;
    console.error(`Greška pri dohvatanju batch progress za batch ${resolvedParams.batchId}:`, error);
    return NextResponse.json(
      { error: `Greška pri dohvatanju batch progress za batch ${resolvedParams.batchId}` },
      { status: 500 }
    );
  }
}
