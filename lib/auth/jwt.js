import { jwtVerify, SignJWT } from "jose";

function getJWTSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 5) {
    throw new Error("JWT SECRET must be at least 5 characters long.")
  }

  return new TextEncoder().encode(secret)
}

export async function signSessionToken(user) {
  return new SignJWT({
    email: user.email,
    name: user.name
  }).setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJWTSecret());
}

export async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, getJWTSecret())
  if (!payload.sub || !payload.email || !payload.name) {
    return null
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name
  }
}
