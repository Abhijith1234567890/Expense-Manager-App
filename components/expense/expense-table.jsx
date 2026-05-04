"use client";
import { Pencil, ReceiptText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/money";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

function formatDate(date) {
  return dateFormatter.format(new Date(date));
}

export function ExpenseTable({
  deletingId,
  expenses,
  isLoading,
  onDelete,
  onEdit,
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-12" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="grid min-h-72 place-items-center rounded-lg border border-line bg-white p-8 text-center shadow-soft">
        <div className="grid justify-items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-mint text-forest">
            <ReceiptText size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-ink">No expenses found</h2>
            <p className="mt-1 text-sm text-muted">
              Add an expense or adjust the filters.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <thead className="bg-paper text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {expenses.map((expense) => (
              <tr className="transition hover:bg-paper" key={expense.id}>
                <td className="max-w-[280px] px-4 py-3">
                  <p className="truncate font-medium text-ink">
                    {expense.title}
                  </p>
                  {expense.notes ? (
                    <p className="mt-1 truncate text-xs text-muted">
                      {expense.notes}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-md bg-mint px-2 py-1 text-xs font-semibold text-forest">
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      aria-label={`Edit ${expense.title}`}
                      onClick={() => onEdit(expense)}
                      size="icon"
                      title="Edit"
                      variant="secondary"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      aria-label={`Delete ${expense.title}`}
                      disabled={deletingId === expense.id}
                      onClick={() => onDelete(expense)}
                      size="icon"
                      title="Delete"
                      variant="danger"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid divide-y divide-line md:hidden">
        {expenses.map((expense) => (
          <article className="grid gap-3 p-4" key={expense.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-ink">
                  {expense.title}
                </h2>
                <p className="text-sm text-muted">{formatDate(expense.date)}</p>
              </div>
              <p className="shrink-0 font-semibold text-ink">
                {formatCurrency(expense.amount)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex rounded-md bg-mint px-2 py-1 text-xs font-semibold text-forest">
                {expense.category}
              </span>
              <div className="flex gap-2">
                <Button
                  aria-label={`Edit ${expense.title}`}
                  onClick={() => onEdit(expense)}
                  size="icon"
                  title="Edit"
                  variant="secondary"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  aria-label={`Delete ${expense.title}`}
                  disabled={deletingId === expense.id}
                  onClick={() => onDelete(expense)}
                  size="icon"
                  title="Delete"
                  variant="danger"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
