import { redirect } from "next/navigation";
import { SWRConfig } from "swr";
import { ExpenseDashboard } from "@/components/expense/expense-dashboard";
import { getCurrentSession } from "@/lib/auth/server";
import { buildExpensesApiPath } from "@/lib/expense-query";
import { getExpenseList } from "@/lib/expense-service";
import { expenseFiltersSchema } from "@/lib/validators/expense";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const filters = expenseFiltersSchema.parse({});
  const initialData = await getExpenseList(session.user.id, filters);
  const fallbackKey = buildExpensesApiPath(filters);

  return (
    <SWRConfig value={{ fallback: { [fallbackKey]: initialData } }}>
      <ExpenseDashboard
        subtitle="Track totals, filter spend, and keep records current."
        title="Dashboard"
      />
    </SWRConfig>
  );
}
