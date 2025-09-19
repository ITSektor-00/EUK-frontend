import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting mapa - čuva broj zahteva po IP adresi
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting konfiguracija
const RATE_LIMIT_WINDOW = 60000; // 1 minut
const MAX_REQUESTS_PER_WINDOW = 1000; // povećano na 1000 zahteva u minutu

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

export function middleware(request: NextRequest) {
  // Dodaj CORS headere za sve zahteve
  const response = NextResponse.next()

  // CORS headeri
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Max-Age', '86400')

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  // Proveri da li je API zahtev
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Dodaj dodatne header-e za API zahteve
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Rate limiting za API zahteve - može se isključiti kroz environment varijablu
    if (process.env.NODE_ENV === 'production' && process.env.DISABLE_RATE_LIMIT !== 'true') {
      const clientIP = getClientIP(request);
      
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
      
      // Dodaj rate limit header-e
      const userData = rateLimitMap.get(clientIP);
      if (userData) {
        response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
        response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS_PER_WINDOW - userData.count).toString());
        response.headers.set('X-RateLimit-Reset', userData.resetTime.toString());
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
