import "server-only"

import { randomUUID } from "crypto"

import { getUsersCollection } from "@/lib/data-store"

function serializeUser(user) {
  return {
    email: user.email,
    id: user.id,
    name: user.name
  }
}

export async function getUserByEmail(email) {
  const users = await getUsersCollection()
  return users.findOne({ email })
}

export async function getSafeUserById(id) {
  const users = await getUsersCollection()
  const user = await users.findOne({ id })

  return user ? serializeUser(user) : null
}

export async function createUser({ email, name, passwordHash }) {
  const users = await getUsersCollection()
  const now = new Date()
  const user = {
    createdAt: now,
    email,
    id: randomUUID(),
    name,
    passwordHash,
    updatedAt: now
  }

  try {
    await users.insertOne(user)
    return serializeUser(user)
  } catch (error) {
    if (error?.code === 11000) {
      return null
    }

    throw error
  }
}