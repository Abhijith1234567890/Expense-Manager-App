import { redirect } from "next/navigation";
import { SWRConfig } from "swr";
import { ExpenseDashboard } from "@/components/expense/expense-dashboard";
import { getCurrentSession } from "@/lib/auth/server";
import { buildExpensesApiPath } from "@/lib/expense-query";
import { getExpenseList } from "@/lib/expense-service";
import { expenseFiltersSchema } from "@/lib/validations/expense";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Expenses",
};

export default async function ExpensesPage() {
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
        subtitle="Search, edit, and audit individual expense records."
        title="Expenses"
      />
    </SWRConfig>
  );
}
