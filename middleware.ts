import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

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

// Role-based access control
async function checkRoleAccess(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return false;
  }

  try {
    // Dekodiraj JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    const userRole = (payload.role as string)?.toUpperCase();
    const pathname = request.nextUrl.pathname;
    
    // Admin rute - samo admin može da pristupi
    if (pathname.startsWith('/admin')) {
      return userRole === 'ADMIN';
    }
    
    // EUK rute - samo korisnici mogu da pristupe
    if (pathname.startsWith('/euk')) {
      return userRole === 'KORISNIK' || userRole === 'USER';
    }
    
    // Dashboard rute - svi mogu da pristupe
    if (pathname === '/dashboard' || pathname === '/admin/dashboard') {
      return true;
    }
    
    return true; // Default - dozvoli pristup
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

// Role-based routing - preusmerava korisnike na odgovarajuće rute
async function handleRoleBasedRouting(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  console.log('Middleware - handleRoleBasedRouting:', {
    pathname: request.nextUrl.pathname,
    hasToken: !!token,
    tokenLength: token?.length || 0,
    cookies: request.cookies.getAll().map(c => c.name)
  });
  
  if (!token) {
    return null; // Nema token-a, ne preusmeravaj
  }

  try {
    // Dekodiraj JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    console.log('Middleware - JWT verification:', {
      hasJwtSecret: !!process.env.JWT_SECRET,
      secretLength: secret.length,
      tokenLength: token.length
    });
    
    const { payload } = await jwtVerify(token, secret);
    console.log('Middleware - JWT payload:', { role: payload.role, sub: payload.sub });
    
    const userRole = (payload.role as string)?.toUpperCase();
    const pathname = request.nextUrl.pathname;
    
    // Ako je korisnik na home page-u, preusmeri na odgovarajući dashboard
    if (pathname === '/') {
      console.log('Middleware - redirecting from home page:', { userRole, pathname });
      if (userRole === 'ADMIN') {
        console.log('Middleware - redirecting admin to /admin');
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (userRole === 'KORISNIK' || userRole === 'USER') {
        console.log('Middleware - redirecting user to /dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    
    // Ako je admin na dashboard-u, preusmeri na admin panel
    if (pathname === '/dashboard' && userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Ako je obični korisnik na admin panelu, preusmeri na dashboard
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return null; // Nema potrebe za preusmeravanje
  } catch (error) {
    console.error('Error in role-based routing:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

export async function middleware(request: NextRequest) {
  console.log('=== MIDDLEWARE START ===');
  console.log('Middleware called for:', request.nextUrl.pathname);
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
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

  // Role-based routing - preusmerava korisnike na odgovarajuće rute
  const routingResponse = await handleRoleBasedRouting(request);
  if (routingResponse) {
    return routingResponse;
  }

  // Role-based access control za zaštićene rute
  const protectedRoutes = ['/admin', '/euk', '/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    const hasAccess = await checkRoleAccess(request);
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
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

  console.log('=== MIDDLEWARE END ===');
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
