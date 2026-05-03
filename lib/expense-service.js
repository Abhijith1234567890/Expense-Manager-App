import "server-only"

import { randomUUID } from "crypto"

import { getExpensesCollection } from "./data-store"
import { amountToCents, centsToAmount } from "./money"
import { ReturnDocument } from "mongodb"

const newestFirst = { date: -1, createdAt: -1 }

function serializeExpense(expense) {
  return {
    id: expense.id,
    title: expense.title,
    amount: centsToAmount(expense.amountCents),
    amountCents: expense.amountCents,
    category: expense.category,
    date: new Date(expense.date).toISOString(),
    notes: expense.notes,
    createdAt: new Date(expense.createdAt).toISOString(),
    updatedAt: new Date(expense.updatedAt).toISOString()
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildExpenseQuery(userId, { category, month, search }) {
  const query = { userId }

  if (search) {
    query.title = {
      $options: "i",
      $regex: escapeRegex(search)
    }
  }

  if (category) {
    query.category = category
  }

  if (month) {
    const [year, monthIndex] = month.split("-").map(Number)
    query.date = {
      $gte: new Date(Date.UTC(year, monthIndex - 1, 1)),
      $lt: new Date(Date.UTC(year, monthIndex, 1))
    }
  }

  return query
}

function buildExpenseData(input) {
  return {
    amountCents: amountToCents(input.amount),
    category: input.category,
    date: input.date,
    notes: input.notes || null,
    title: input.title
  };
}

export async function getExpenseList(userId, filters) {
  const { page, pageSize } = filters;
  const expenses = await getExpensesCollection();
  const query = buildExpenseQuery(userId, filters);

  const [{ categoryTotals, count, items, summary }] = await expenses
    .aggregate([
      { $match: query },
      {
        $facet: {
          categoryTotals: [
            { $group: { _id: "$category", amountCents: { $sum: "$amountCents" } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, amountCents: 1, category: "$_id" } }
          ],
          count: [{ $count: "totalItems" }],
          items: [
            { $sort: newestFirst },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize }
          ],
          summary: [{ $group: { _id: null, totalCents: { $sum: "$amountCents" } } }]
        }
      }
    ])
    .toArray();

  const totalItems = count[0]?.totalItems ?? 0;
  const totalCents = summary[0]?.totalCents ?? 0;

  return {
    expenses: items.map(serializeExpense),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize))
    },
    summary: {
      count: totalItems,
      totalAmount: centsToAmount(totalCents),
      totalCents,
      categoryTotals: categoryTotals.map(({ amountCents, category }) => ({
        amount: centsToAmount(amountCents),
        amountCents,
        category
      }))
    }
  };
}

export async function createExpense(userId, input) {
  const expenses = await getExpensesCollection()
  const now = new Date()
  const expense = {
    ...buildExpenseData(input),
    createdAt: now,
    id: randomUUID(),
    updatedAt: now,
    userId
  }

  await expenses.insertOne(expense)
  return serializeExpense(expense)
}

export async function updateExpense(userId, expenseId, input) {
  const expenses = await getExpensesCollection()
  const result = await expenses.findOneAndUpdate(
    { id: expenseId, userId },
    { $set: { ...buildExpenseData(input), updatedAt: new Date() } },
    { ReturnDocument: "after" }
  )

  const expense = result?.value ?? result
  return expense ? serializeExpense(expense) : null
}

export async function deleteExpense(userId, expenseId) {
  const expenses = await getExpensesCollection()
  const result = await expenses.deleteOne({ id: expenseId, userId })

  return result.deleteCount > 0
}