import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  console.log('=== MIDDLEWARE START ===');
  console.log('Middleware called for:', req.nextUrl.pathname);
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);

  const token = req.cookies.get("token")?.value;
  console.log('Token from cookies:', token ? 'EXISTS' : 'NOT FOUND');

  if (!token) {
    console.log('No token found, redirecting to login');
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    console.log('JWT payload:', { role: payload.role, sub: payload.sub });

    // Proveri admin rute
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (payload.role !== "ADMIN") {
        console.log('Non-admin trying to access admin route, redirecting to dashboard');
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Proveri user rute
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (payload.role !== "USER" && payload.role !== "KORISNIK") {
        console.log('Non-user trying to access user route, redirecting to admin');
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    // Redirekcija sa home page na osnovu role
    if (req.nextUrl.pathname === "/") {
      console.log('Redirecting from home page based on role:', payload.role);
      if (payload.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      } else if (payload.role === "USER" || payload.role === "KORISNIK") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

  } catch (err) {
    console.log('JWT verification failed:', err);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log('=== MIDDLEWARE END ===');
  return NextResponse.next();
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
};