import "server-only"

import { getExpensesCollection } from "./data-store"
import { centsToAmount } from "./money"

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
  year: "numeric"
})

const categoryBenchmarks = {
  Education: "Separate coursework, books, and tools so long-term growth expenses stay easy to defend.",
  Entertainment: "Check whether entertainment peaks follow planned events or scattered impulse purchases.",
  Food: "Track groceries and dining separately when food spend rises faster than other daily categories.",
  Health: "Keep health expenses visible across months so preventive care and emergencies do not blur together.",
  Housing: "Keep recurring rent or mortgage commitments predictable before increasing lifestyle spend.",
  Other: "Review uncategorized items often so repeated costs can graduate into clearer categories.",
  Shopping: "Look for clustered purchases before the next planned restock or seasonal refresh.",
  Subscriptions: "Review subscriptions quarterly and cancel duplicate tools before annual renewals land.",
  Travel: "Group trips by month so transport, lodging, and meal costs stay visible as one decision.",
  Utilities: "Watch utility movement month to month because small recurring increases compound quickly."
};

function toMonthKey(date) {
  return new Date(date).toISOString().slice(0, 7)
}

function formatMonth(monthKey) {
  return monthFormatter.format(new Date(`${monthKey}-01T00:00:00.000Z`))
}

function toMoney(amountCents) {
  return {
    amount: centsToAmount(amountCents),
    amountCents
  }
}

function getSignal(share) {
  if (share >= 40) {
    return "watch"
  }

  if (share >= 25) {
    return "optimize"
  }

  return "steady"
}

function buildCategoryInsights(expenses, totalCents) {
  const totals = new Map();

  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amountCents);
  }

  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([category, amountCents]) => {
      const share = totalCents > 0 ? Math.round((amountCents / totalCents) * 100) : 0;

      return {
        ...toMoney(amountCents),
        benchmark: categoryBenchmarks[category] ?? categoryBenchmarks.Other,
        category,
        share,
        signal: getSignal(share)
      };
    });
}

function buildTrend(expenses) {
  const monthlyTotals = new Map();

  for (const expense of expenses) {
    const monthKey = toMonthKey(expense.date);
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) ?? 0) + expense.amountCents);
  }

  const months = [...monthlyTotals.entries()].sort(([left], [right]) => left.localeCompare(right));
  const latest = months.at(-1);

  if (!latest) {
    return null;
  }

  const previous = months.at(-2);
  const deltaCents = latest[1] - (previous?.[1] ?? 0);

  return {
    ...toMoney(latest[1]),
    deltaAmount: centsToAmount(deltaCents),
    direction: deltaCents > 0 ? "up" : deltaCents < 0 ? "down" : "flat",
    monthLabel: formatMonth(latest[0]),
    previousMonthLabel: previous ? formatMonth(previous[0]) : null
  };
}

export async function getBudgetInsights(userId) {
  const expensesCollection = await getExpensesCollection();
  const expenses = await expensesCollection.find({ userId }).toArray();
  const totalCents = expenses.reduce((total, expense) => total + expense.amountCents, 0);
  const averageCents = expenses.length ? Math.round(totalCents / expenses.length) : 0;
  const categoryInsights = buildCategoryInsights(expenses, totalCents);
  const largestExpense = [...expenses].sort((left, right) => right.amountCents - left.amountCents)[0] ?? null;

  return {
    categoryInsights,
    largestExpense: largestExpense
      ? {
        ...toMoney(largestExpense.amountCents),
        category: largestExpense.category,
        date: largestExpense.date,
        title: largestExpense.title
      }
      : null,
    overview: {
      averageAmount: centsToAmount(averageCents),
      averageCents,
      count: expenses.length,
      topCategory: categoryInsights[0]?.category ?? "None",
      totalAmount: centsToAmount(totalCents),
      totalCents
    },
    trend: buildTrend(expenses)
  };
}
