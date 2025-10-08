import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Forward to backend API
    const response = await apiRequest(`/api/admin/accessible-routes/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('authorization') || ''
      }
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in accessible-routes API:', error);
    
    // Fallback - vraća praznu listu ako backend nije dostupan
    return NextResponse.json([]);
  }
}
