import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      // Pozovi backend API za odjavu
      try {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
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
