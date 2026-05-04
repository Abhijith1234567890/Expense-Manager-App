"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPage } from "@/store/expense-slice";
import { useAppDispatch } from "@/store/hooks";

export function Pagination({ page, totalItems, totalPages }) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Page <span className="font-semibold text-ink">{page}</span> of{" "}
        <span className="font-semibold text-ink">{totalPages}</span> -{" "}
        <span className="font-semibold text-ink">{totalItems}</span> expenses
      </p>
      <div className="flex gap-2">
        <Button
          disabled={page <= 1}
          onClick={() => dispatch(setPage(page - 1))}
          variant="secondary"
        >
          <ChevronLeft size={17} />
          Previous
        </Button>
        <Button
          disabled={page >= totalPages}
          onClick={() => dispatch(setPage(page + 1))}
          variant="secondary"
        >
          Next
          <ChevronRight size={17} />
        </Button>
      </div>
    </div>
  );
}
