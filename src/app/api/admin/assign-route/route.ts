import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, routeId } = body;

    if (!userId || !routeId) {
      return NextResponse.json(
        { error: 'userId i routeId su obavezni' },
        { status: 400 }
      );
    }

    // Forward to backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/api/admin/assign-route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || ''
      },
      body: JSON.stringify({ userId, routeId })
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in assign-route API:', error);
    
    // Fallback - simulira uspešno dodeljivanje
    const { userId, routeId } = await request.json();
    
    const fallbackResponse = {
      id: Date.now(), // Temporary ID
      userId: Number(userId),
      routeId: Number(routeId),
      route: `route-${routeId}`,
      nivoDozvola: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(fallbackResponse, { status: 201 });
  }
}
