import { NextResponse } from "next/server";
import { auth } from "@/auth";

const publicRoutes = ["/", "/pusat-bantuan", "/monitoring"];
const authRoutes = ["/login", "/register"];

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const isProfileComplete = req.auth?.user?.isProfileComplete;

  function isPublicRoute(pathname: string) {
    return publicRoutes.includes(pathname) || pathname.startsWith("/detail-presensi/");
  }

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDosenRoute = nextUrl.pathname.startsWith("/dosen");

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === "MAHASISWA") return Response.redirect(new URL("/jadwal-kuliah", nextUrl));
      if (role === "ADMIN") return Response.redirect(new URL("/admin/dashboard", nextUrl));
      if (role === "DOSEN") return Response.redirect(new URL("/dosen/dashboard", nextUrl));
      return Response.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute(nextUrl.pathname)) {
    return Response.redirect(new URL("/login?login=unauthorized", nextUrl));
  }

  if (isAdminRoute && role !== "ADMIN") {
    return Response.redirect(new URL("/not-admin", nextUrl));
  }

  if (isDosenRoute && role !== "DOSEN") {
    return Response.redirect(new URL("/not-dosen", nextUrl));
  }

  if (isLoggedIn && role === "MAHASISWA" && nextUrl.pathname === "/") {
    return Response.redirect(new URL("/jadwal-kuliah", nextUrl));
  }

  if (isLoggedIn && role === "ADMIN" && nextUrl.pathname === "/") {
    return Response.redirect(new URL("/admin/dashboard", nextUrl));
  }

  if (isLoggedIn && role === "DOSEN" && nextUrl.pathname === "/") {
    return Response.redirect(new URL("/dosen/dashboard", nextUrl));
  }

  const mustCompleteProfile =
    isLoggedIn &&
    !isProfileComplete &&
    !nextUrl.pathname.startsWith("/profile") &&
    !nextUrl.pathname.startsWith("/api") &&
    !nextUrl.pathname.startsWith("/logout");

  if (role === "MAHASISWA" && mustCompleteProfile) {
    const url = nextUrl.clone();
    url.pathname = "/profile";
    url.searchParams.set("profile", "lengkapi-profil");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
