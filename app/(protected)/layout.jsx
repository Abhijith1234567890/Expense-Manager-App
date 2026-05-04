import { redirect } from "next/navigation";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { getCurrentSession } from "@/lib/auth/server";

export default async function ProtectedLayout({ children }) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return <ProtectedShell user={session.user}>{children}</ProtectedShell>;
}
