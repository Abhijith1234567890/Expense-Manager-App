import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  ListChecks,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getCurrentSession } from "@/lib/auth/server";
import { getBudgetInsights } from "@/lib/insights";
import { formatCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Insights",
};

const signalStyles = {
  optimize: "bg-[#fff7e6] text-gold",
  steady: "bg-mint text-forest",
  watch: "bg-[#eef7fc] text-ocean",
};

const directionCopy = {
  down: "Down from the previous recorded month",
  flat: "Flat against the previous recorded month",
  up: "Up from the previous recorded month",
};

function formatDate(date) {
  return new Intl.DateTimeFormat("en-Us", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export default async function InsightsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const insights = await getBudgetInsights(session.user.id);
  const hasExpenses = insights.overview.count > 0;
  const TrendIcon =
    insights.trend?.direction === "down" ? TrendingDown : TrendingUp;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Insights</h1>
          <p className="mt-1 text-sm text-muted">
            Personal spending signals from your recorded expenses.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-forest bg-forest px-4 text-sm font-medium text-white transition hover:bg-[#15543e]"
          href="/expenses"
          prefetch
        >
          <ReceiptText size={18} />
          Expenses
        </Link>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-line bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">Total tracked</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {formatCurrency(insights.overview.totalAmount)}
          </p>
        </article>
        <article className="rounded-lg border border-line bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">Average expense</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {formatCurrency(insights.overview.averageAmount)}
          </p>
        </article>
        <article className="rounded-lg border border-line bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">Top category</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-ink">
            <CircleDollarSign className="text-forest" size={24} />
            {insights.overview.topCategory}
          </p>
        </article>
      </section>

      {hasExpenses ? (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Monthly Trend
                </h2>
                <p className="text-sm text-muted">
                  {insights.trend.monthLabel}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-md bg-mint text-forest">
                <TrendIcon size={20} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-ink">
              {formatCurrency(insights.trend.amount)}
            </p>
            <p className="mt-2 text-sm text-muted">
              {insights.trend.previousMonthLabel
                ? `${directionCopy[insights.trend.direction]} by ${formatCurrency(Math.abs(insights.trend.deltaAmount))}.`
                : "First recorded month in this workspace."}
            </p>
          </article>

          <article className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Largest Entry
                </h2>
                <p className="text-sm text-muted">
                  {formatDate(insights.largestExpense.date)}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-md bg-[#fff7e6] text-gold">
                <CalendarClock size={20} />
              </div>
            </div>
            <p className="truncate text-xl font-semibold text-ink">
              {insights.largestExpense.title}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="rounded-md bg-mint px-2 py-1 font-semibold text-forest">
                {insights.largestExpense.category}
              </span>
              <span className="font-semibold text-ink">
                {formatCurrency(insights.largestExpense.amount)}
              </span>
            </div>
          </article>
        </section>
      ) : (
        <section className="grid min-h-72 place-items-center rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <div className="grid justify-items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-mint text-forest">
              <ListChecks size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-ink">No insights yet</h2>
              <p className="mt-1 text-sm text-muted">
                Add expenses to build personal spending signals.
              </p>
            </div>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-medium text-ink transition hover:bg-mint"
              href="/expenses"
              prefetch
            >
              Add Expenses
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {hasExpenses ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {insights.categoryInsights.map((insight) => (
            <article
              className="rounded-lg border border-line bg-white p-4 shadow-soft"
              key={insight.category}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-ink">{insight.category}</h2>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${signalStyles[insight.signal]}`}
                >
                  {insight.signal}
                </span>
              </div>
              <p className="text-2xl font-semibold text-ink">
                {formatCurrency(insight.amount)}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8eee4]">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{ width: `${Math.max(8, insight.share)}%` }}
                />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase text-muted">
                {insight.share}% of tracked spend
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {insight.benchmark}
              </p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
