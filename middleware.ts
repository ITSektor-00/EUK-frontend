import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);

    // Proveri admin rute
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Proveri user rute
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (payload.role !== "USER" && payload.role !== "KORISNIK") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    // Redirekcija sa home page na osnovu role
    if (req.nextUrl.pathname === "/") {
      if (payload.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      } else if (payload.role === "USER" || payload.role === "KORISNIK") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

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