import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; section: string }> }
) {
  try {
    const { userId, section } = await params;
    
    // Forward to backend API
    const backendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8080' 
      : 'https://euk.onrender.com';
    
    const response = await fetch(`${backendUrl}/api/admin/check-section-access/${userId}/${section}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || ''
      }
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in check-section-access API:', error);
    
    // Fallback - role-based logika
    const { section } = await params;
    
    // Ako je ADMIN sekcija, dozvoli pristup (admin endpoint)
    // Ako je EUK sekcija, dozvoli pristup (korisnici mogu da pristupe EUK)
    const hasAccess = section === 'ADMIN' || section === 'EUK';
    
    return NextResponse.json(hasAccess);
  }
}
