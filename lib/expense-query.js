export function buildExpensesApiAuth(filters = {}) {
  const params = new URLSearchParams()
  params.set("page", String(filters.page ?? 1))
  params.set("pageSize", String(filters.pageSize ?? 10))

  if (filters.search) {
    params.set("search", filters.search)
  }

  if (filters.category) {
    params.set("category", filters.category);
  }
  
  if (filters.month) {
    params.set("month", filters.month)
  }

  return `/api/expenses?${params.toString()}`
}