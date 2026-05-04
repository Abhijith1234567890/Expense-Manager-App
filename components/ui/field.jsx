import { clsx } from "clsx";

const controlClassName =
  "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-forest focus:ring-2 focus:ring-mint";

  export function Field({ children, error, label }) {
    return (
      <label className="grid gap-1.5 text-sm font-medium text-ink">
        <span>{label}</span>
        {children}
        {error ? <span className="text-xs font-medium text-coral">{error}</span> : null}
      </label>
    )
  }

  export function TextInput({className, ...props}) {
    return <input className={clsx(controlClassName, className)} {...props}/>
  }

  export function SelectInput({className, ...props}) {
    return <select className={clsx(controlClassName, className)} {...props}/>
  }

  export function TextareaInput({className, ...props}) {
    return (
      <textarea className={clsx("min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-forest focus:ring-2 focus:ring-mint", className)} {...props} />
    )
  }
