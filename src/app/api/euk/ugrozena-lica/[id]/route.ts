import { NextRequest, NextResponse } from 'next/server';

const SPRING_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080' 
  : 'https://euk.onrender.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${SPRING_BASE_URL}/api/euk/ugrozena-lica-t1/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ugrozeno lice:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju ugroženog lica' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const response = await fetch(`${SPRING_BASE_URL}/api/euk/ugrozena-lica-t1/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Greška pri ažuriranju ugroženog lica' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating ugrozeno lice:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju ugroženog lica' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${SPRING_BASE_URL}/api/euk/ugrozena-lica-t1/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Greška pri brisanju ugroženog lica' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Ugroženo lice uspešno obrisano' });
  } catch (error) {
    console.error('Error deleting ugrozeno lice:', error);
    return NextResponse.json(
      { error: 'Greška pri brisanju ugroženog lica' },
      { status: 500 }
    );
  }
}
