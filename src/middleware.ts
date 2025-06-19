import { auth } from "@/auth";
export { auth as middlewares } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login?login=unauthorized", request.url));
  }

  if (session?.user && pathname === "/login") {
    const role = session.user.role;

    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard?islogin=true", request.url));
    } else if (role === "DOSEN") {
      return NextResponse.redirect(new URL("/dosen", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const role = session.user.role;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/not-admin", request.url));
  }

  if (pathname.startsWith("/dosen") && role !== "DOSEN") {
    return NextResponse.redirect(new URL("/not-dosen", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dosen/:path*", "/not-admin", "/not-dosen"],
};
