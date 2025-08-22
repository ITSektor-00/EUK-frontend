import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  console.log('=== API PROFIL START ===');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  
  try {
    console.log('API profil: Početak obrade zahteva');
    
    const body = await request.json();
    console.log('API profil: Raw body:', body);
    
    const { username, first_name, last_name, email, password, current_username } = body;
    console.log('API profil: Podaci primljeni:', { username, first_name, last_name, email, hasPassword: !!password, current_username });

    // Validacija podataka
    if (!username || !first_name || !last_name || !email) {
      console.log('API profil: Greška validacije - nedostaju obavezna polja');
      return NextResponse.json(
        { error: 'Sva polja su obavezna' },
        { status: 400 }
      );
    }

    // Validacija email formata
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('API profil: Greška validacije - neispravan email format');
      return NextResponse.json(
        { error: 'Neispravan format email adrese' },
        { status: 400 }
      );
    }

    // Validacija lozinke
    if (password && `${password}`.length < 6) {
      console.log('API profil: Greška validacije - lozinka prekratka');
      return NextResponse.json(
        { error: 'Lozinka mora imati najmanje 6 karaktera' },
        { status: 400 }
      );
    }

    // Stvarna logika za ažuriranje u bazi
    try {
      console.log('API profil: Pokušavam povezivanje sa bazom');
      
      const dbHost = process.env.DB_HOST;
      const dbPort = process.env.DB_PORT;
      const dbUser = process.env.DB_USER;
      const dbPassword = process.env.DB_PASSWORD;
      const dbName = process.env.DB_NAME;
      
      console.log('API profil: Environment varijable:', {
        hasDbHost: !!dbHost,
        hasDbPort: !!dbPort,
        hasDbUser: !!dbUser,
        hasDbPassword: !!dbPassword,
        hasDbName: !!dbName
      });

      if (!dbHost || !dbPort || !dbUser || !dbPassword || !dbName) {
        console.log('API profil: Nedostaju environment varijable');
        return NextResponse.json(
          { error: 'Database varijable nisu podešene u .env.local' },
          { status: 500 }
        );
      }

      const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?sslmode=require`;
      console.log('API profil: Connection string kreiran');

      console.log('API profil: Kreiram database pool');
      const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
      });
      
      console.log('API profil: Kreiram SQL query');
      let query = `
        UPDATE public.users 
        SET first_name = $1, last_name = $2, email = $3, username = $4
      `;
      const params: (string | number)[] = [first_name, last_name, email, username];
      
      if (password) {
        console.log('API profil: Hashujem lozinku');
        const hashedPassword = await bcrypt.hash(String(password), 12);
        query += `, password_hash = $5`;
        params.push(hashedPassword);
      }

      // Ako je prosleđen current_username koristi njega za WHERE; inače koristimo novi username (nije preporučeno)
      const whereTarget = current_username || username;
      query += ` WHERE username = $${params.length + 1}`;
      params.push(whereTarget);
      
      console.log('API profil: Izvršavam query:', query);
      console.log('API profil: Parametri:', params);
      
      const result = await pool.query(query, params);
      console.log('API profil: Query rezultat:', result.rowCount, 'redova ažurirano');
      
      if (result.rowCount === 0) {
        console.log('API profil: Korisnik nije pronađen');
        await pool.end();
        return NextResponse.json(
          { error: 'Korisnik nije pronađen' },
          { status: 404 }
        );
      }
      
      await pool.end();
      console.log('API profil: Profil uspešno ažuriran u bazi:', { username, first_name, last_name, email });

    } catch (dbError) {
      console.error('API profil: Greška pri ažuriranju u bazi:', dbError);
      return NextResponse.json(
        { error: 'Greška pri ažuriranju u bazi podataka: ' + (dbError as Error).message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Profil uspešno ažuriran' },
      { status: 200 }
    );

  } catch (error) {
    console.error('API profil: Greška pri ažuriranju profila:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju profila: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
