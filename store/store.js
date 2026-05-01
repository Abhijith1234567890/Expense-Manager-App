import { configureStore } from "@reduxjs/toolkit";
import expenseReducer from "@/store/expense-slice";

export const makeStore = () => configureStore({
  reducer: {
    expenses: expenseReducer
  }
})