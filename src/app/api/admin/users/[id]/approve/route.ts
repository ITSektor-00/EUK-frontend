import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/config/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = id;

    const response = await apiRequest(`/api/admin/users/${userId}/approve`, {
      method: 'POST',
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
    console.error('Error in approve user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
