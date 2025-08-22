import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    // Ovde možeš dodati logiku za odjavu (npr. invalidiranje tokena)
    // Za sada samo vraćamo uspešan odgovor
    
    return NextResponse.json(
      { message: 'Uspešno ste se odjavili' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Greška pri odjavi:', error);
    return NextResponse.json(
      { error: 'Greška pri odjavi' },
      { status: 500 }
    );
  }
}
