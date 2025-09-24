import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      console.log('Logout request with token:', authHeader.substring(0, 20) + '...');
      
      // Pozovi backend API za odjavu
      const backendUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8080' 
        : (process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com');
      
      try {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          }
        });
      } catch (backendError) {
        console.warn('Backend logout failed, but continuing with local logout:', backendError);
      }
    }
    
    return NextResponse.json({ message: 'Uspešno odjavljen' });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Greška pri odjavi' },
      { status: 500 }
    );
  }
}
