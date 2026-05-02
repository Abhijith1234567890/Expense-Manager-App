import "server-only"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME } from "./constants"
import { verifySessionToken } from "./jwt"
import { getSafeUserById } from "../user-service"

async function hydrateUserFromToken(token) {
  if (!token) {
    return null
  }

  try {
    const payload = await verifySessionToken(token)
    if (!payload) {
      return null
    }

    const user = await getSafeUserById(payload.id)

    if (!user) {
      return null
    }

    return { user }
  }
  catch {
    return null
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies()
  return hydrateUserFromToken(cookieStore.get(AUTH_COOKIE_NAME)?.value)
}

export function getCurrentSessionFromRequest(req) {
  return hydrateUserFromToken(req.cookies.get(AUTH_COOKIE_NAME)?.value)
}