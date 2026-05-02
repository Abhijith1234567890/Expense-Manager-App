import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth/constants";
import { verifySessionToken } from "./lib/auth/jwt";

const protectedPrefixes = ["/dashboard", "/expenses", "/insights"]
const authRoutes = ["/login", "/register"]

async function hashValidSession(req) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return false
  }

  try {
    return Boolean(await verifySessionToken(token))
  }
  catch {
    return false
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = authRoutes.includes(pathname)

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  const isAunthenticated = await hashValidSession(req)
  if (isProtectedRoute && !isAunthenticated) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isAunthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  return NextResponse.next()
}

export const cofig = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
}