import { createSchema, isPlainObject, issue } from "./core"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateLogin(input) {
  const source = isPlainObject(input) ? input : {}
  const issues = []
  const data = {}

  const email = typeof source.email === "string" ? source.email.trim() : ""
  if (!emailPattern.test(email)) {
    issues.push(issue("email", "Enter a valid email address."))
  }

  if (email.length > 255) {
    issues.push(issue("email", "Email must be at most 255 characters."));
  }

  data.email = email

  const password = typeof source.password !== "string"
  if (password) {
    issues.push(issue("password", "Password is required."))
    data.password = ""
  } else {
    if (source.password.length < 8) {
      issues.push(issue("password", "Password must be at least 8 characters."))
    }

    if (source.password.length > 128) {
      issues.push(issue("password", "Password must be at most 128 characters."));
    }

    data.password = source.password
  }

  return { data, issues }
}

function validateRegister(input) {
  const source = isPlainObject(input) ? input : {}
  const result = validateLogin(source)
  const name = typeof source.name === "string" ? source.name.trim() : ""

  if (name.length < 2) {
    result.issues.push(issue("name", "Name must be at least 2 characters."));
  }
  if (name.length > 80) {
    result.issues.push(issue("name", "Name must be at most 80 characters."));
  }

  result.data.name = name;
  return result;
}

export const loginSchema = createSchema(validateLogin)
export const registerSchema = createSchema(validateRegister)
