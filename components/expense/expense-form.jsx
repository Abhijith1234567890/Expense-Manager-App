"use client";
import { CalendarDays, CircleDollarSign, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  SelectInput,
  TextareaInput,
  TextInput,
} from "@/components/ui/field";
import {
  EXPENSE_CATEGORIES,
  expenseMutationSchema,
} from "@/lib/validations/expense";
import { parse } from "next/dist/build/swc";

function toDateInputValue(date) {
  if (!date) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.slice(0, 10);
}

function issuesToErrors(issues) {
  return issues.reduce((errors, issue) => {
    const field = issue.path[0];

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}

export function ExpenseForm({ expense, isSubmitting, onCancel, onSubmit }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(toDateInputValue());
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTitle(expense?.title ?? "");
    setAmount(expense ? String(expense.amount) : "");
    setCategory(expense?.category ?? "Food");
    setDate(toDateInputValue(expense?.date));
    setNotes(expense?.notes ?? "");
    setErrors({});
  }, [expense]);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = expenseMutationSchema.safeParse({
      amount: Number(amount),
      category,
      date: new Date(`${date}T00:00:00.000Z`),
      notes,
      title,
    });

    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.errors.issues));
      return;
    }

    setErrors({});

    const saved = await onSubmit(parsed.data);
    if (saved && !expense) {
      setTitle("");
      setAmount("");
      setCategory("Food");
      setDate(toDateInputValue());
      setNotes("");
    }
  }

  return (
    <form
      className="grid gap-4 rounded-lg border border-line bg-white p-4 shadow-soft"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {expense ? "Edit Expense" : "Add Expense"}
          </h2>
          <p className="text-sm text-muted">
            {expense ? expense.title : "Record a new spend item"}
          </p>
        </div>
        {expense ? (
          <Button
            aria-label="Cancel editing"
            onClick={onCancel}
            size="icon"
            title="Cancel editing"
            variant="ghost"
          >
            <X size={18} />
          </Button>
        ) : null}
      </div>
      <Field error={errors.title} label="Title">
        <TextInput
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Client lunch"
          required
          value={title}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.amount} label="Amount">
          <div className="relative">
            <CircleDollarSign
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={16}
            />
            <TextInput
              className="pl-9"
              inputMode="decimal"
              min="0.01"
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              step="0.01"
              type="number"
              value={amount}
            />
          </div>
        </Field>
        <Field error={errors.date} label="Date">
          <div className="relative">
            <CalendarDays
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={16}
            />
            <TextInput
              className="pl-9"
              onChange={(e) => setDate(e.target.value)}
              required
              type="date"
              value={date}
            />
          </div>
        </Field>
      </div>
      <Field error={errors.category} label="Category">
        <SelectInput
          onChange={(e) => setCategory(e.target.value)}
          value={category}
        >
          {EXPENSE_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field error={errors.notes} label="Notes">
        <TextareaInput
          maxLength={500}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional context"
          value={notes}
        />
      </Field>
      <Button disabled={isSubmitting} type="submit">
        <Save size={18} />
        {isSubmitting ? "Saving..." : expense ? "Save Changes" : "Add Expense"}
      </Button>
    </form>
  );
}
