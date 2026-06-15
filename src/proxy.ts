import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("cvnet_token")?.value;
  const rawRole = request.cookies.get("cvnet_role")?.value; 
  
  // 🔥 FIX 1: Handle the literal string "undefined" or "null" safely
  let role = rawRole ? rawRole.toLowerCase().trim() : null;
  if (role === "undefined" || role === "null" || role === "") {
    role = null;
  }

  const path = request.nextUrl.pathname.toLowerCase();

  console.log("==================================================");
  console.log(`🛡️ PROXY INTERCEPT: ${path} | ROLE: ${role || "NONE"}`);

  // 1. ISOLATED PORTAL BYPASS (The Judge Board)
  if (path.startsWith("/board/")) {
    return NextResponse.next();
  }

  const publicRoutes = ["/login", "/signup", "/"];
  const isPublicRoute = publicRoutes.includes(path);

  // 2. 🔥 FIX 2: THE KILL SWITCH FOR CORRUPT SESSIONS 🔥
  // We moved this UP. If you have a token but your role is broken ("undefined"), 
  // we delete the bad cookies and force you back to login to start fresh.
  if (!isPublicRoute && token && !role) {
    console.log("⚠️ CORRUPT SESSION DETECTED: Destroying bad cookies and forcing re-login.");
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("cvnet_token");
    response.cookies.delete("cvnet_role");
    return response;
  }

  // 3. ENFORCE AUTHENTICATION (Must be logged in)
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. SESSION LOCK (Keep logged-in users away from /login)
  if (isPublicRoute && token && role) {
    if (role === "admin") return NextResponse.redirect(new URL("/admin/users", request.url));
    if (role === "company" || role === "recruiter") return NextResponse.redirect(new URL("/recruiter/dashboard", request.url));
    return NextResponse.redirect(new URL("/applications", request.url));
  }

  // 5. STRICT "DEFAULT DENY" ROLE-BASED ACCESS CONTROL
  if (!isPublicRoute && token && role) {
    
    // RULE A: Protect Admin Routes
    if (path.startsWith("/admin") && role !== "admin") {
      console.log("🚨 BLOCKED: Non-admin tried to access /admin");
      const fallback = (role === "company" || role === "recruiter") ? "/recruiter/dashboard" : "/applications";
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    // RULE B: Protect Recruiter Routes
    if (path.startsWith("/recruiter") && role !== "company" && role !== "recruiter") {
      console.log("🚨 BLOCKED: Non-company tried to access /recruiter");
      const fallback = role === "admin" ? "/admin/users" : "/applications";
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    // RULE C: Protect Candidate Routes
    if (!path.startsWith("/admin") && !path.startsWith("/recruiter") && role !== "candidate") {
      console.log("🚨 BLOCKED: Admin/Company tried to access Candidate area");
      const fallback = role === "admin" ? "/admin/users" : "/recruiter/dashboard";
      return NextResponse.redirect(new URL(fallback, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};