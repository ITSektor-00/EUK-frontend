import { NextRequest, NextResponse } from 'next/server';

const SPRING_BASE_URL = process.env.SPRING_BASE_URL || 'http://localhost:8080';

// Rate limiting mapa - čuva broj zahteva po IP adresi
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting konfiguracija
const RATE_LIMIT_WINDOW = 60000; // 1 minut
const MAX_REQUESTS_PER_WINDOW = 30; // maksimalno 30 zahteva u minutu

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userData = rateLimitMap.get(ip);
  
  if (!userData) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (now > userData.resetTime) {
    // Resetuj rate limit za novi prozor
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (userData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  userData.count++;
  return false;
}

function getClientIP(request: NextRequest): string {
  // Pokušaj da dobiješ realnu IP adresu
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  // Fallback na localhost za development
  return '127.0.0.1';
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Proveri rate limiting
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { 
          error: 'Previše zahteva. Molimo sačekajte pre slanja novog zahteva.',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString()
          }
        }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';
    
    const response = await fetch(`${SPRING_BASE_URL}/api/euk/ugrozena-lica?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Posebno rukovanje za 429 greške
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        return NextResponse.json(
          { 
            error: 'Backend server je preopterećen. Molimo sačekajte pre ponovnog pokušaja.',
            retryAfter: parseInt(retryAfter),
            suggestion: 'Pokušajte ponovo za nekoliko minuta'
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter
            }
          }
        );
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ugrozena lica:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju ugroženih lica' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${SPRING_BASE_URL}/api/euk/ugrozena-lica`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Greška pri kreiranju ugroženog lica' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating ugrozeno lice:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju ugroženog lica' },
      { status: 500 }
    );
  }
}
