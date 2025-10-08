import { NextRequest, NextResponse } from 'next/server';
import { apiRequest } from '@/config/api';

export async function GET(request: NextRequest) {
  try {
    // Forward to backend API
    const response = await apiRequest('/api/routes', {
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
    console.error('Error in routes API:', error);
    
    // Fallback data ako backend nije dostupan
    const fallbackRoutes = [
      {
        id: 1,
        ruta: 'euk/kategorije',
        naziv: 'Kategorije',
        opis: 'Upravljanje kategorijama u EUK sistemu',
        sekcija: 'EUK',
        nivoMin: 2,
        nivoMax: 5,
        aktivna: true,
        datumKreiranja: new Date().toISOString()
      },
      {
        id: 2,
        ruta: 'euk/predmeti',
        naziv: 'Predmeti',
        opis: 'Upravljanje predmetima u EUK sistemu',
        sekcija: 'EUK',
        nivoMin: 2,
        nivoMax: 5,
        aktivna: true,
        datumKreiranja: new Date().toISOString()
      },
      {
        id: 3,
        ruta: 'euk/ugrozena-lica',
        naziv: 'Ugrožena lica',
        opis: 'Upravljanje ugroženim licima u EUK sistemu',
        sekcija: 'EUK',
        nivoMin: 2,
        nivoMax: 5,
        aktivna: true,
        datumKreiranja: new Date().toISOString()
      },
      {
        id: 4,
        ruta: 'euk/stampanje',
        naziv: 'Štampanje',
        opis: 'Štampanje dokumenata u EUK sistemu',
        sekcija: 'EUK',
        nivoMin: 2,
        nivoMax: 5,
        aktivna: true,
        datumKreiranja: new Date().toISOString()
      },
      {
        id: 5,
        ruta: 'admin/korisnici',
        naziv: 'Admin Korisnici',
        opis: 'Administracija korisnika',
        sekcija: 'ADMIN',
        nivoMin: 5,
        nivoMax: 5,
        aktivna: true,
        datumKreiranja: new Date().toISOString()
      },
      {
        id: 6,
        ruta: 'admin/sistem',
        naziv: 'Admin Sistem',
        opis: 'Administracija sistema',
        sekcija: 'ADMIN',
        nivoMin: 5,
        nivoMax: 5,
        aktivna: true,
        datumKreiranja: new Date().toISOString()
      }
    ];

    return NextResponse.json(fallbackRoutes);
  }
}
