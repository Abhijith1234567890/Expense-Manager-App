"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Field, TextInput } from "../ui/field";

export function AuthForm({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";
  const title = isRegister ? "Create your account" : "Welcome back";
  const actionLabel = isRegister ? "Register" : "Login";
  const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch(endpoint, {
      body: JSON.stringify({
        ...(isRegister ? { name } : {}),
        email,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.user) {
      setError(payload?.error ?? "Unable to authenticate right now.");
      setIsSubmitting(false);
      return;
    }

    const next = searchParams.get("next");
    router.replace(next?.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-line bg-white shadow-soft md:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-mint p-8 md:flex md:flex-col md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              alt=""
              height={48}
              priority
              src="/brand-mark.svg"
              width={48}
            />
            <div>
              <p className="text-sm font-semibold text-forest">
                Expense Manager
              </p>
              <p className="text-sm text-muted">Private spend tracking</p>
            </div>
          </div>
          <div className="grid gap-5">
            <h1 className="max-w-sm text-3xl font-semibold leading-tight text-ink">
              Keep every expense accountable without losing speed.
            </h1>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-white/70 p-3">
                <p className="font-semibold text-forest">Fixed</p>
                <p className="text-muted">Rent and bills</p>
              </div>
              <div className="rounded-md bg-white/70 p-3">
                <p className="font-semibold text-ocean">Daily</p>
                <p className="text-muted">Meals and rides</p>
              </div>
              <div className="rounded-md bg-white/70 p-3">
                <p className="font-semibold text-gold">Plans</p>
                <p className="text-muted">Trips and goals</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <Image
              alt=""
              height={42}
              priority
              src="/brand-mark.svg"
              width={42}
            />
            <div>
              <p className="font-semibold text-ink">Expense Manager</p>
              <p className="text-sm text-muted">Private spend tracking</p>
            </div>
          </div>
          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm text-muted">
              {isRegister
                ? "Start with a secure workspace."
                : "Continue to your expense dashboard."}
            </p>
          </div>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {isRegister ? (
              <Field label="Name">
                <TextInput
                  autoComplete="name"
                  minLength={2}
                  onChange={(e) => setName(e.target.value)}
                  required
                  value={name}
                />
              </Field>
            ) : null}
            <Field label="Email">
              <TextInput
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                value={email}
              />
            </Field>
            <Field label="Password">
              <TextInput
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                value={password}
              />
            </Field>
            {error ? (
              <div className="rounded-md border border-coral/30 bg-[#fff4f1] px-3 py-2 text-sm font-medium text-coral">
                {error}
              </div>
            ) : null}
            <Button
              className="mt-2 w-full"
              disabled={isSubmitting}
              type="submit"
            >
              {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isSubmitting ? "Working..." : actionLabel}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <Link
              className="font-semibold text-forest underline-offset-4 hover:underline"
              href={isRegister ? "/login" : "/register"}
              prefetch
            >
              {isRegister ? "Login" : "Register"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
