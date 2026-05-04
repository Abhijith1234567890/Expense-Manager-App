"use client";
import { Plus, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { CategoryBreakdown } from "@/components/expense/category-breakdown";
import { ExpenseFilters } from "@/components/expense/expense-filters";
import { ExpenseForm } from "@/components/expense/expense-form";
import { ExpenseTable } from "@/components/expense/expense-table";
import { Pagination } from "@/components/expense/pagination";
import { Button } from "@/components/ui/button";
import { buildExpensesApiPath } from "@/lib/expense-query";
import { fetcher } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/money";
import { setExpenseSnapshot, setPage } from "@/store/expense-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentPageTotalCents,
  selectExpenseFilters,
  selectExpenseSummary,
} from "@/store/selectors";

async function parseMutationResponse(res) {
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(payload?.error ?? "Unable to save expense.");
  }
}

export function ExpenseDashboard({ subtitle, title }) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectExpenseFilters);
  const summary = useAppSelector(selectExpenseSummary);
  const currentPageTotalCents = useAppSelector(selectCurrentPageTotalCents);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [mutationError, setMutationError] = useState("");
  const apiPath = useMemo(
    () =>
      buildExpensesApiPath({
        category: filters.category || undefined,
        month: filters.month || undefined,
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
      }),
    [
      filters.category,
      filters.month,
      filters.page,
      filters.pageSize,
      filters.search,
    ],
  );
  const { data, error, isLoading, mutate } = useSWR(apiPath, fetcher, {
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data) {
      dispatch(
        setExpenseSnapshot({
          expenses: data.expenses,
          summary: data.summary,
        }),
      );
      if (filters.page > data.pagination.totalPages) {
        dispatch(setPage(data.pagination.totalPages));
      }
    }
  }, [data, dispatch, filters.page]);

  async function handleSubmit(input) {
    setIsSubmitting(true);
    setMutationError("");
    try {
      const response = await fetch(
        editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses",
        {
          body: JSON.stringify(input),
          headers: {
            "Content-Type": "application/json",
          },
          method: editingExpense ? "PUT" : "POST",
        },
      );
      await parseMutationResponse(response);
      setEditingExpense(null);
      if (!editingExpense) {
        dispatch(setPage(1));
      }
      await mutate();
      return true;
    } catch (caughtError) {
      setMutationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save expense.",
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(expense) {
    const confirmed = window.confirm(`Delete "${expense.title}"?`);
    if (!confirmed) {
      return;
    }
    setDeletingId(expense.id);
    setMutationError("");
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });
      await parseMutationResponse(response);
      if (editingExpense?.id === expense.id) {
        setEditingExpense(null);
      }
      await mutate();
    } catch (caughtError) {
      setMutationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete expense.",
      );
    } finally {
      setDeletingId(null);
    }
  }
  const expenses = data?.expenses ?? [];
  const pagination = data?.pagination ?? {
    page: filters.page,
    pageSize: filters.pageSize,
    totalItems: 0,
    totalPages: 1,
  };
  const liveSummary = data?.summary ?? summary;
  
  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <Button onClick={() => setEditingExpense(null)}>
          <Plus size={18} />
          New Expense
        </Button>
      </div>

      {mutationError || error ? (
        <div className="rounded-lg border border-coral/30 bg-[#fff4f1] px-4 py-3 text-sm font-medium text-coral">
          {mutationError || error?.message || "Unable to load expenses."}
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">Total expenses</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {formatCurrency(liveSummary.totalAmount)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">Current page</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {formatCurrency(currentPageTotalCents / 100)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">Expense count</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-ink">
            <WalletCards className="text-forest" size={24} />
            {liveSummary.count}
          </p>
        </div>
      </section>

      <ExpenseFilters filters={filters} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <ExpenseTable
            deletingId={deletingId}
            expenses={expenses}
            isLoading={isLoading && !data}
            onDelete={handleDelete}
            onEdit={setEditingExpense}
          />
          <Pagination
            page={pagination.page}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
          />
        </div>
        <aside className="grid content-start gap-5">
          <ExpenseForm
            expense={editingExpense}
            isSubmitting={isSubmitting}
            onCancel={() => setEditingExpense(null)}
            onSubmit={handleSubmit}
          />
          <CategoryBreakdown summary={liveSummary} />
        </aside>
      </div>
    </div>
  );
}
