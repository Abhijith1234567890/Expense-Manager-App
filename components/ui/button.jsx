import { clsx } from "clsx";

const variantClasses = {
  danger: "border-coral bg-coral text-white hover:bg-[#bf4937]",
  ghost: "border-transparent bg-transparent text-ink hover:bg-mint",
  primary: "border-forest bg-forest text-white hover:bg-[#15543e]",
  secondary: "border-line bg-white text-ink hover:bg-mint",
};

const sizeClasses = {
  icon: "h-9 w-9 p-0",
  md: "h-10 px-4",
  sm: "h-9 px-3 text-sm",
};

export function Button({
  children,
  className,
  disabled,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <button
      className={clsx(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-55",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
