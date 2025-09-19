import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const size = searchParams.get('size') || '20';
  const role = searchParams.get('role');
  const isActive = searchParams.get('isActive');
  const search = searchParams.get('search');

  try {

    // Forward to backend API with query parameters
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const queryParams = new URLSearchParams({
      page,
      size,
      ...(role && { role }),
      ...(isActive && { isActive }),
      ...(search && { search })
    });

    const response = await fetch(`${backendUrl}/api/users?${queryParams}`, {
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
    console.error('Error in users API:', error);
    
    // Fallback data ako backend nije dostupan
    const fallbackUsers = [
      {
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@euk.rs',
        role: 'ADMIN',
        isActive: true,
        nivoPristupa: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        firstName: 'Marko',
        lastName: 'Petrović',
        username: 'marko.petrovic',
        email: 'marko@euk.rs',
        role: 'OBRADJIVAC',
        isActive: true,
        nivoPristupa: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        firstName: 'Ana',
        lastName: 'Nikolić',
        username: 'ana.nikolic',
        email: 'ana@euk.rs',
        role: 'POTPISNIK',
        isActive: true,
        nivoPristupa: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Paginacija fallback podataka
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '20');
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedUsers = fallbackUsers.slice(startIndex, endIndex);

    const fallbackResponse = {
      content: paginatedUsers,
      totalElements: fallbackUsers.length,
      totalPages: Math.ceil(fallbackUsers.length / size),
      size: size,
      number: page - 1,
      first: page === 1,
      last: page === Math.ceil(fallbackUsers.length / size),
      numberOfElements: paginatedUsers.length
    };

    return NextResponse.json(fallbackResponse);
  }
}
