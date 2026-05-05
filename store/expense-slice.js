import { createSlice } from "@reduxjs/toolkit";

const emptySummary = {
  categoryTotals: [],
  count: 0,
  totalAmount: 0,
  totalCents: 0
}

const initialState = {
  filters: {
    category: "",
    month: "",
    page: 1,
    pageSize: 10,
    search: ""
  },
  currentPageTotalCents: 0,
  expenses: [],
  summary: emptySummary
}

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    setCategoryFilter(state, action) {
      state.filters.category = action.payload
      state.filters.page = 1
    },
    setExpenseSnapshot(state, action) {
      state.expenses = action.payload.expenses
      state.summary = action.payload.summary
      state.currentPageTotalCents = action.payload.expenses.reduce((total, expense) => total + expense.amountCents, 0)
    },
    setMonthFilter(state, action) {
      state.filters.month = action.payload
      state.filters.page = 1
    },
    setPage(state, action) {
      state.filters.page = action.payload
    },
    setPageSize(state, action) {
      state.filters.pageSize = action.payload
      state.filters.page = 1
    },
    setSearchFilter(state, action) {
      state.filters.search = action.payload
      state.filters.page = 1
    }
  }
})

export const { resetFilters, setCategoryFilter, setExpenseSnapshot, setMonthFilter, setPage, setPageSize, setSearchFilter} = expenseSlice.actions
export default expenseSlice.reducer
