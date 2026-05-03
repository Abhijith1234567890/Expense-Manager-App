import { createSchema, isPlainObject, issue } from "./core";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Housing",
  "Utilities",
  "Shopping",
  "Health",
  "Education",
  "Entertainment",
  "Subscriptions",
  "Other"
]

function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime())
}

function validateExpenseMutation(input) {
  const issues = []
  const data = {}

  if (!isPlainObject(input)) {
    return {
      data,
      issues: [issue([], "Invalid request payload.")]
    }
  }

  const title = typeof input.title === "string" ? input.title.trim() : ""

  if (title.length < 2) {
    issues.push(issue("title", "Title must be at most 120 characters."))
  }

  if (title.length > 120) {
    issues.push(issue("title", "Title must be at most 120 characters."));
  }
  data.title = title;

  const amount = input.amount
  if (typeof amount !== "number") {
    issues.push(issue("amount", "Amount is required."));
  } else if (!Number.isFinite(amount)) {
    issues.push(issue("amount", "Amount must be a valid number."));
  } else if (amount <= 0) {
    issues.push(issue("amount", "Amount must be greater than zero."));
  } else if (amount > 10000000) {
    issues.push(issue("amount", "Amount is too large."));
  } else if (Math.abs(amount * 100 - Math.round(amount * 100)) >= 1e-6) {
    issues.push(issue("amount", "Use no more than 2 decimals."));
  }
  data.amount = amount;

  if (!EXPENSE_CATEGORIES.includes(input.category)) {
    issues.push(issue("category", "Choose a valid category."));
  }
  data.category = input.category;

  const date = input.date instanceof Date ? input.date : new Date(input.date);
  if (!isValidDate(date)) {
    issues.push(issue("date", "Enter a valid date."));
  }
  data.date = date;

  if (input.notes === undefined) {
    data.notes = undefined;
  } else if (typeof input.notes !== "string") {
    issues.push(issue("notes", "Notes must be text."));
  } else {
    const notes = input.notes.trim();
    if (notes.length > 500) {
      issues.push(issue("notes", "Notes must be at most 500 characters."));
    }
    data.notes = notes;
  }

  return { data, issues };
}

function parsePage(value, field, fallback, min, max, issues) {
  if (value === undefined) {
    return fallback
  }

  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    issues.push(issue(field, field === "page" ? "Page must be 1 or greater." : "Page size must be between 5 and 50."));
    return fallback;
  }

  return numberValue
}

function validateExpenseFilters(input) {
  const source = isPlainObject(input) ? input : {}
  const issues = []
  const data = {
    page: parsePage(source.page, "page", 1, 1, Number.MAX_SAFE_INTEGER, issues),
    pageSize: parsePage(source.pageSize, "pageSize", 10, 5, 50, issues)
  };

  if (source.search !== undefined) {
    if (typeof source.search !== "string") {
      issues.push(issue("search", "Search must be text."))
    } else {
      const search = source.search.trim()
      if (search.length > 120) {
        issues.push(issue("search", "Search must be at most 120 characters."))
      }
      data.search = search
    }
  }

  if (source.category !== undefined) {
    if (!EXPENSE_CATEGORIES.includes(source.category)) {
      issues.push(issue("category", "Choose a valid category."));
    }
    data.category = source.category;
  }

  if (source.month !== undefined) {
    if (typeof source.month !== "string" || !/^\d{4}-\d{2}$/.test(source.month)) {
      issues.push(issue("month", "Month must use YYYY-MM format."));
    }
    data.month = source.month;
  }

  return { data, issues };
}

export const expenseMutationSchema = createSchema(validateExpenseMutation)
export const expenseFiltersSchema = createSchema(validateExpenseFilters)