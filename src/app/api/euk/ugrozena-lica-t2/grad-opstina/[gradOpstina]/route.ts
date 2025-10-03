import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gradOpstina: string }> }
) {
  const { gradOpstina } = await params;
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token je potreban' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/euk/ugrozena-lica-t2/grad-opstina/${gradOpstina}`, {
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
    console.error('Greška pri pretrazi T2 ugroženih lica po gradu/opštini:', error);
    return NextResponse.json(
      { error: 'Greška pri pretrazi T2 ugroženih lica po gradu/opštini' },
      { status: 500 }
    );
  }
}
