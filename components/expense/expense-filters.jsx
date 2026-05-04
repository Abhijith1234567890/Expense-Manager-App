"use client";
import { RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectInput, TextInput } from "@/components/ui/field";
import { EXPENSE_CATEGORIES } from "@/lib/validations/expense";
import {
  resetFilters,
  setCategoryFilter,
  setMonthFilter,
  setPageSize,
  setSearchFilter,
} from "@/store/expense-slice";
import { useAppDispatch } from "@/store/hooks";

export function ExpenseFilters({ filters }) {
  const dispatch = useAppDispatch();
  const [searchDraft, setSearchDraft] = useState(filters.search);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchDraft !== filters.search) {
        dispatch(setSearchFilter(searchDraft));
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [dispatch, filters.search, searchDraft]);

  return (
    <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-soft lg:grid-cols-[minmax(220px,1fr)_180px_170px_150px_auto]">
      <label className="relative block">
        <span className="sr-only">Search expenses</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={16}
        />
        <TextInput
          className="pl-9"
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="Search by title"
          value={searchDraft}
        />
      </label>
      <label>
        <span className="sr-only">Category</span>
        <SelectInput
          onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
          value={filters.category}
        >
          <option value="">All categories</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </SelectInput>
      </label>
      <label>
        <span className="sr-only">Month</span>
        <TextInput
          onChange={(e) => dispatch(setMonthFilter(e.target.value))}
          type="month"
          value={filters.month}
        />
      </label>
      <label>
        <span className="sr-only">Rows per page</span>
        <SelectInput
          onChange={(e) =>
            dispatch(setPageSize(Number(e.target.value)))
          }
          value={filters.pageSize}
        >
          {[10, 20, 30, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize} rows
            </option>
          ))}
        </SelectInput>
      </label>
      <Button onClick={() => dispatch(resetFilters())} variant="secondary">
        <RotateCcw size={17} />
        Reset
      </Button>
    </section>
  );
}
