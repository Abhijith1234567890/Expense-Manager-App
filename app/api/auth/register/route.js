import { NextResponse } from "next/server";
import { getSessionCookieOptions, AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { signSessionToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { jsonError, validationError } from "@/lib/api-response";
import { createUser, getUserByEmail } from "@/lib/user-service";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req) {
  try {
    const payload = registerSchema.parse(await req.json())
    const email = payload.email.toLowerCase()
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return jsonError("An account already exists for this email.", 409)
    }

    const passwordHash = await hashPassword(payload.password)
    const user = await createUser({
      email,
      name: payload.name,
      passwordHash
    })

    if (!user) {
      return jsonError("An account already exists for this email.", 409)
    }

    const token = await signSessionToken(user)
    const response = NextResponse.json({ user }, { status: 201 })
    response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions())

    return response
  } catch (error) {
    return validationError(error)
  }
}