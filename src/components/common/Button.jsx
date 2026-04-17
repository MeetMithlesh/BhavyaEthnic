import clsx from "clsx";

export default function Button({ children, variant = "primary", className = "", type = "button", ...props }) {
  const variants = {
    primary: "bg-terracotta text-white hover:bg-rosewood",
    secondary: "bg-white text-ink ring-1 ring-clay/30 hover:bg-blush",
    ghost: "text-ink hover:bg-blush",
    dark: "bg-ink text-white hover:bg-rosewood",
  };

  return (
    <button
      type={type}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
