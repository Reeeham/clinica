import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "soft"
  | "ghost"
  | "danger"
  | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-xs hover:bg-brand-hover active:bg-brand-ink disabled:bg-brand/40",
  secondary:
    "bg-surface text-ink border border-line-strong shadow-xs hover:bg-raised hover:border-ink-4/60 active:bg-line/40",
  soft: "bg-brand-soft text-brand-ink hover:bg-brand-line/70 active:bg-brand-line",
  ghost: "text-ink-2 hover:bg-ink/[0.055] hover:text-ink active:bg-ink/[0.08]",
  danger: "bg-danger text-white shadow-xs hover:bg-danger/90 active:bg-danger/95",
  link: "text-brand underline decoration-brand-line underline-offset-4 hover:decoration-brand",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "h-7 gap-1.5 px-2.5 text-xs rounded-md",
  sm: "h-8.5 gap-1.5 px-3 text-[0.8125rem] rounded-md",
  md: "h-10 gap-2 px-3.5 text-sm rounded-lg",
  lg: "h-11 gap-2 px-5 text-[0.9375rem] rounded-lg",
};

const ICON_SIZES: Record<ButtonSize, string> = {
  xs: "h-7 w-7 rounded-md",
  sm: "h-8.5 w-8.5 rounded-md",
  md: "h-10 w-10 rounded-lg",
  lg: "h-11 w-11 rounded-lg",
};

export function buttonClass({
  variant = "secondary",
  size = "md",
  icon = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: boolean;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap font-medium",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150",
    "disabled:pointer-events-none disabled:opacity-55",
    variant === "link" ? "" : "active:translate-y-[0.5px]",
    icon ? ICON_SIZES[size] : SIZES[size],
    VARIANTS[variant],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, icon, className })}
      {...props}
    />
  );
}
