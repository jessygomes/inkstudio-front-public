import Link from "next/link";
import React from "react";

type AppButtonProps = {
  /** "primary" = gradient tertiary | "secondary" = ghost/outline */
  variant?: "primary" | "secondary";
  /** Rend un <Link> si fourni, sinon un <button> */
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function AppButton({
  variant = "primary",
  href,
  onClick,
  disabled = false,
  fullWidth = false,
  icon,
  className = "",
  children,
}: AppButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-2 text-sm font-one transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const primary =
    "bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 hover:-translate-y-0.5";

  const secondary =
    "border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm hover:border-white/25 hover:text-white";

  const variantClass = variant === "primary" ? primary : secondary;
  const widthClass = fullWidth ? "w-full" : "";

  const finalClass = `${base} ${variantClass} ${widthClass} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={finalClass}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={finalClass}>
      {icon}
      {children}
    </button>
  );
}
