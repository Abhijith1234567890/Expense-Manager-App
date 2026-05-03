import { NextResponse } from "next/server";
import { isValidationError } from "./validators/core";

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function validationError(error) {
  if (isValidationError(error)) {
    return jsonError(error.issues[0]?.message ?? "Invalid request payload.", 422)
  }

  return jsonError("Invalid request payload.", 422)
}