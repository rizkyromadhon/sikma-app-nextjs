// File: src/middleware.ts

import NextAuth from "next-auth";
import authConfig from "@/auth.config"; // <-- PENTING: Impor dari auth.config.ts
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/"];
const authRoutes = ["/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  console.log("[DEBUG] req.auth:", req.auth);
  console.log("[MIDDLEWARE DEBUG] Pathname:", nextUrl.pathname);
  console.log("[MIDDLEWARE DEBUG] Is logged in:", isLoggedIn);

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDosenRoute = nextUrl.pathname.startsWith("/dosen");

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === "ADMIN") return Response.redirect(new URL("/admin/dashboard", nextUrl));
      if (role === "DOSEN") return Response.redirect(new URL("/dosen/dashboard", nextUrl));
      return Response.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login?error=unauthorized", nextUrl));
  }

  if (isAdminRoute && role !== "ADMIN") {
    return Response.redirect(new URL("/not-admin", nextUrl));
  }

  if (isDosenRoute && role !== "DOSEN") {
    return Response.redirect(new URL("/not-dosen", nextUrl));
  }

  return NextResponse.next();
});

// Konfigurasi matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
