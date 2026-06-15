import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("cvnet_token")?.value;
  const role = request.cookies.get("cvnet_role")?.value; // 'company', 'candidate', or 'admin'
  const { pathname } = request.nextUrl;

  console.log("==================================================");
  console.log(`🛡️ PROXY INTERCEPT: ${pathname} | ROLE: ${role || "NONE"}`);

  // 1. 🔥 ISOLATED PORTAL BYPASS (The Judge Board)
  if (pathname.startsWith("/board/")) {
    return NextResponse.next();
  }

  const publicRoutes = ["/login", "/signup", "/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // 2. ENFORCE AUTHENTICATION (Must be logged in)
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. SESSION LOCK (Keep logged-in users away from /login)
  if (isPublicRoute && token && role) {
    if (role === "admin") return NextResponse.redirect(new URL("/admin/users", request.url));
    if (role === "company") return NextResponse.redirect(new URL("/recruiter/dashboard", request.url));
    return NextResponse.redirect(new URL("/applications", request.url));
  }

  // 4. 🚨 STRICT ROLE-BASED ACCESS CONTROL (RBAC) 🚨
  if (!isPublicRoute && token && role) {
    
    // RULE A: Companies are ONLY allowed in /recruiter/
    if (role === "company" && !pathname.startsWith("/recruiter")) {
      console.log("🚨 INTRUSION BLOCKED: Company user strayed out of bounds.");
      return NextResponse.redirect(new URL("/recruiter/dashboard", request.url));
    }

    // RULE B: Admins are ONLY allowed in /admin/
    if (role === "admin" && !pathname.startsWith("/admin")) {
      console.log("🚨 INTRUSION BLOCKED: Admin user strayed out of bounds.");
      return NextResponse.redirect(new URL("/admin/users", request.url));
    }

    // RULE C: Candidates are NOT allowed in /admin/ or /recruiter/
    if (role === "candidate" && (pathname.startsWith("/admin") || pathname.startsWith("/recruiter"))) {
      console.log("🚨 INTRUSION BLOCKED: Candidate attempted to access privileged area.");
      return NextResponse.redirect(new URL("/applications", request.url));
    }
  }

  // 5. CORRUPT SESSION CATCH
  if (!isPublicRoute && token && !role) {
    console.log("⚠️ CORRUPT SESSION: Token exists but no role cookie. Forcing re-login.");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};