import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Uzmi Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Test endpoint - vrati mock podatke
    const mockUsers = [
      {
        id: 1,
        username: 'testuser1',
        email: 'test1@example.com',
        firstName: 'Test',
        lastName: 'User 1',
        role: 'USER',
        isActive: true,
        isApproved: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        username: 'testuser2',
        email: 'test2@example.com',
        firstName: 'Test',
        lastName: 'User 2',
        role: 'USER',
        isActive: true,
        isApproved: true,
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ 
      users: mockUsers,
      message: 'Admin test endpoint working'
    });

  } catch (error) {
    console.error('Error in admin test API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
