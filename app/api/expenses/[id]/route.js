import { NextResponse } from "next/server";
import { jsonError, validationError } from "@/lib/api-response";
import { getCurrentSessionFromRequest } from "@/lib/auth/server";
import { deleteExpense, updateExpense } from "@/lib/expense-service";
import { expenseMutationSchema } from "@/lib/validations/expense";

export async function PUT(req, context) {
  const session = await getCurrentSessionFromRequest(req)

  if (!session) {
    return jsonError("Authentication required.", 401)
  }

  try {
    const { id } = await context.params
    const payload = expenseMutationSchema.parse(await req.json())
    const expense = await updateExpense(session.user.id, id, payload)

    if (!expense) {
      return jsonError("Expense not found.", 404)
    }

    return NextResponse.json({ expense })
  } catch (error) {
    return validationError(error)
  }
}

export async function DELETE(req, context) {
  const session = await getCurrentSessionFromRequest(req)

  if (!session) {
    return jsonError("Authentication required.", 401)
  }

  const { id } = await context.params
  const deleted = await deleteExpense(session.user.id, id)

  if (!deleted) {
    return jsonError("Expense not found.", 404)
  }

  return NextResponse.json({ ok: true })
}