"use client";
import { Plus, WalletCards, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const SPOTLIGHT_TRANSITION =
  "top 360ms cubic-bezier(0.22, 1, 0.36, 1), left 360ms cubic-bezier(0.22, 1, 0.36, 1), width 360ms cubic-bezier(0.22, 1, 0.36, 1), transform 360ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 360ms ease";

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

export function ExpenseDashboard({ subtitle, title }) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectExpenseFilters);
  const summary = useAppSelector(selectExpenseSummary);
  const currentPageTotalCents = useAppSelector(selectCurrentPageTotalCents);
  const formPanelRef = useRef(null);
  const formSlotRef = useRef(null);
  const resultsRef = useRef(null);
  const spotlightTimerRef = useRef(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isFormSpotlighted, setIsFormSpotlighted] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [spotlightStyle, setSpotlightStyle] = useState(null);
  const [slotHeight, setSlotHeight] = useState(null);
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

  const scrollResultsIntoView = useCallback(() => {
    if (!isMobileViewport()) {
      return;
    }

    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }, []);

  const clearSpotlight = useCallback(() => {
    window.clearTimeout(spotlightTimerRef.current);
    setIsFormSpotlighted(false);
    setSlotHeight(null);
    setSpotlightStyle(null);
  }, []);

  const closeExpenseSpotlight = useCallback(() => {
    if (!isFormSpotlighted) {
      clearSpotlight();
      return;
    }

    const slot = formSlotRef.current;

    if (!slot) {
      clearSpotlight();
      return;
    }

    const rect = slot.getBoundingClientRect();
    window.clearTimeout(spotlightTimerRef.current);
    setSpotlightStyle({
      left: `${rect.left}px`,
      position: "fixed",
      top: `${rect.top}px`,
      transform: "translate(0, 0) scale(1)",
      transition: SPOTLIGHT_TRANSITION,
      width: `${rect.width}px`,
      zIndex: 50,
    });
    spotlightTimerRef.current = window.setTimeout(clearSpotlight, 380);
  }, [clearSpotlight, isFormSpotlighted]);

  const openExpenseSpotlight = useCallback(() => {
    const panel = formPanelRef.current;

    if (!panel) {
      return;
    }

    const rect = panel.getBoundingClientRect();
    window.clearTimeout(spotlightTimerRef.current);
    setSlotHeight(rect.height);
    setIsFormSpotlighted(true);
    setSpotlightStyle({
      left: `${rect.left}px`,
      position: "fixed",
      top: `${rect.top}px`,
      transform: "translate(0, 0) scale(1)",
      transition: SPOTLIGHT_TRANSITION,
      width: `${rect.width}px`,
      zIndex: 50,
    });

    window.requestAnimationFrame(() => {
      setSpotlightStyle({
        left: "50%",
        position: "fixed",
        top: "50%",
        transform: "translate(-50%, -50%) scale(1.02)",
        transition: SPOTLIGHT_TRANSITION,
        width: "min(calc(100vw - 2rem), 28rem)",
        zIndex: 50,
      });
    });
  }, []);

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

  useEffect(() => {
    return () => window.clearTimeout(spotlightTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isFormSpotlighted) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeExpenseSpotlight();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeExpenseSpotlight, isFormSpotlighted]);

  function handleNewExpense() {
    setEditingExpense(null);
    setMutationError("");

    window.requestAnimationFrame(() => {
      if (isMobileViewport()) {
        clearSpotlight();
        formSlotRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      openExpenseSpotlight();
    });
  }

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
      closeExpenseSpotlight();
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

  function handleEditExpense(expense) {
    closeExpenseSpotlight();
    setEditingExpense(expense);

    if (isMobileViewport()) {
      window.requestAnimationFrame(() => {
        formSlotRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
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
      {isFormSpotlighted ? (
        <button
          aria-label="Close expense form focus"
          className="fixed inset-0 z-40 hidden bg-ink/25 backdrop-blur-sm md:block"
          onClick={closeExpenseSpotlight}
          type="button"
        />
      ) : null}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <Button onClick={handleNewExpense}>
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

      <ExpenseFilters
        filters={filters}
        onFilterChange={scrollResultsIntoView}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid scroll-mt-32 gap-4 md:scroll-mt-20" ref={resultsRef}>
          <ExpenseTable
            deletingId={deletingId}
            expenses={expenses}
            isLoading={isLoading && !data}
            onDelete={handleDelete}
            onEdit={handleEditExpense}
          />
          <Pagination
            page={pagination.page}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
          />
        </div>
        <aside className="grid content-start gap-5">
          <div
            id="expense-form"
            ref={formSlotRef}
            style={slotHeight ? { minHeight: `${slotHeight}px` } : undefined}
          >
            <div
              className={
                isFormSpotlighted
                  ? "relative max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl shadow-[0_28px_90px_rgba(22,32,25,0.28)] ring-2 ring-forest/25"
                  : "relative"
              }
              ref={formPanelRef}
              style={spotlightStyle ?? undefined}
            >
              {isFormSpotlighted ? (
                <Button
                  aria-label="Close expense form focus"
                  className="absolute right-3 top-3 z-10"
                  onClick={closeExpenseSpotlight}
                  size="icon"
                  title="Close"
                  variant="ghost"
                >
                  <X size={18} />
                </Button>
              ) : null}
              <ExpenseForm
                expense={editingExpense}
                isSubmitting={isSubmitting}
                onCancel={() => setEditingExpense(null)}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
          <CategoryBreakdown summary={liveSummary} />
        </aside>
      </div>
    </div>
  );
}
