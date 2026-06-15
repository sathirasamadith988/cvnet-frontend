import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("cvnet_token")?.value;
  const { pathname } = request.nextUrl;

  console.log("==================================================");
  console.log("🛡️  PROXY INTERCEPTED URL PATH:", pathname);
  console.log("🍪 AUTH COOKIE FOUND?:", token ? "YES (Token is present)" : "NO COOKIE FOUND");

  // 1. 🔥 ISOLATED PORTAL BYPASS (The Judge Board) 🔥
  // If the URL starts with /board/, we completely skip the login check.
  // Anyone can open the page, and the backend PIN system will handle the security.
  if (pathname.startsWith("/board/")) {
    console.log("⚖️  JUDGE BOARD ACCESS: Bypassing login. Backend PIN will secure this.");
    console.log("==================================================");
    return NextResponse.next();
  }

  // 2. DEFINE EXPLICIT PUBLIC ENTRIES
  const publicRoutes = ["/login", "/signup", "/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  console.log("🔒 ROUTE ACCESS TYPE:", isPublicRoute ? "PUBLIC" : "PROTECTED RESOURCE");

  // 3. ENFORCE AUTHENTICATION BLOCK (Preventing unauthorized access)
  if (!isPublicRoute && !token) {
    console.log("🚨 ACCESS DENIED: Redirecting unauthorized request to /login");
    console.log("==================================================");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. ENFORCE SESSION LOCK (Preventing logged-in users from seeing auth pages)
  if (isPublicRoute && token) {
    console.log("🔄 SESSION LOCK: Authenticated user attempting to access public route. Routing to /dashboard");
    console.log("==================================================");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  console.log("✅ ACCESS GRANTED: Compiling page components...");
  console.log("==================================================");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (Internal API routes)
     * - _next/static (static framework files)
     * - _next/image (image optimization utilities)
     * - favicon.ico, logo.jpeg (root assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};