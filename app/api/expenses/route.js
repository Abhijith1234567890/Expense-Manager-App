import { NextResponse } from "next/server";
import { jsonError, validationError } from "@/lib/api-response";
import { getCurrentSessionFromRequest } from "@/lib/auth/server";
import { createExpense, getExpenseList } from "@/lib/expense-service";
import { expenseFiltersSchema, expenseMutationSchema } from "@/lib/validations/expense";

export async function GET(req) {
  const session = await getCurrentSessionFromRequest(req)

  if (!session) {
    return jsonError("Authentication required.", 401)
  }

  try {
    const filters = expenseFiltersSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const payload = await getExpenseList(session.user.id, filters)
    return NextResponse.json(payload)
  } catch (error) {
    return validationError(error)
  }
}

export async function POST(req) {
  const session = await getCurrentSessionFromRequest(req)
  if (!session) {
    return jsonError("Authentication required.", 401)
  }

  try {
    const payload = expenseMutationSchema.parse(await req.json())
    const expense = await createExpense(session.user.id, payload)
    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    return validationError(error)
  }
}