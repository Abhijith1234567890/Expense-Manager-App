"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  ReceiptText,
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "../ui/button";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/expenses",
    icon: ReceiptText,
    label: "Expenses",
  },
  {
    href: "/insights",
    icon: Lightbulb,
    label: "Insights",
  },
];

export function ProtectedShell({ children, user }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            className="flex min-w-0 items-center gap-3"
            href="/dashboard"
            prefetch
          >
            <Image
              alt=""
              height={38}
              priority
              src="/brand-mark.svg"
              width={38}
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">Expense Manager</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </Link>
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  className={clsx(
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition",
                    isActive
                      ? "bg-mint text-forest"
                      : "text-muted hover:bg-mint hover:text-ink",
                  )}
                  href={item.href}
                  key={item.href}
                  prefetch
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border border-line bg-paper px-3 py-2 text-sm text-muted sm:flex">
              <BarChart3 size={16} className="text-forest" />
              {user.name}
            </div>
            <Button
              aria-label="Logout"
              onClick={handleLogout}
              size="icon"
              title="Logout"
              variant="secondary"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="grid grid-cols-2 border-t border-line bg-white px-2 py-2 md:hidden"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                className={clsx(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium transition",
                  isActive
                    ? "bg-mint text-forest"
                    : "text-muted hover:bg-mint hover:text-ink",
                )}
                href={item.href}
                key={item.href}
                prefetch
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
