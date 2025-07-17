import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/signup", "/register", "/forgot-password"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Check if user is logged in
  const isLoggedIn = request.cookies.has("auth-token");

  // Allow access to public paths without redirection
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If not logged in and trying to access protected route
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
