import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(request) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, secureCookie: request.nextUrl.protocol === "https:" });
  if (token?.id) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/admin/")) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
