import { NextResponse } from "next/server";
import { isValidationError } from "./validations/core";

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function serverError(error) {
  console.error(error)
  return jsonError("Something went wrong. Please try again.", 500)
}

export function validationError(error) {
  if (isValidationError(error)) {
    return jsonError(error.issues[0]?.message ?? "Invalid request payload.", 422)
  }

  if (error instanceof SyntaxError) {
    return jsonError("Invalid request payload.", 422)
  }

  return serverError(error)
}
