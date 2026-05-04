"use client";
import { formatCurrency } from "@/lib/money";

export function CategoryBreakedown({ summary }) {
  const maxCents = Math.max(
    ...summary.categoryTotals.map((item) => item.amountCents),
    1,
  );

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink">Category Breakdown</h2>
        <p className="text-sm text-muted">{summary.count} matching expenses</p>
      </div>

      <div className="grid gap-3">
        {summary.categoryTotals.length ? (
          summary.categoryTotals.map((item) => (
            <div className="grid gap-1.5" key={item.category}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-ink">{item.category}</span>
                <span className="text-muted">
                  {formatCurrency(item.amount)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e8eee4]">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{
                    width: `${Math.max(8, (item.amountCents / maxCents) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No category totals yet.</p>
        )}
      </div>
    </section>
  );
}
