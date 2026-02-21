import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const user = request.cookies.get("user")?.value;

  // If not logged in → redirect to login
  if (!token || !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let parsedUser;
  try {
    parsedUser = JSON.parse(decodeURIComponent(user));
  } catch (error) {
    console.error("Middleware JSON parse error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = parsedUser.role;
  const pathname = request.nextUrl.pathname;



  // Admin protection
  if (pathname.startsWith("/admin") && role !== "admin") {

    return NextResponse.redirect(new URL("/", request.url));
  }

  // Cafe/Owner protection
  if (pathname.startsWith("/cafedashboard") && role !== "owner") {

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cafedashboard/:path*"],
};
