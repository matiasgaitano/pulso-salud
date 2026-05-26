import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/dashboard") && role !== "patient") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/medicos") && role !== "doctor") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/dashboard/:path*", "/medicos/:path*"],
};
