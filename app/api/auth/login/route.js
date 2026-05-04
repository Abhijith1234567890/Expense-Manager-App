import { NextResponse } from "next/server";
import { getSessionCookieOptions, AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { signSessionToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { jsonError, validationError } from "@/lib/api-response";
import { getUserByEmail } from "@/lib/user-service";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req) {
  try {
    const payload = loginSchema.parse(await req.json())
    const email = payload.email.toLowerCase()
    const user = await getUserByEmail(email)

    if (!user) {
      return jsonError("Email or password is incorrect.", 401)
    }

    const isValidPassword = await verifyPassword(payload.password, user.passwordHash)

    if (!isValidPassword) {
      return jsonError("Email or password is incorrect.", 401)
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name
    }

    const token = await signSessionToken(safeUser)
    const response = NextResponse.json({ user: safeUser })
    response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions())

    return response
  }
  catch (error) {
    return validationError(error)
  }
}

