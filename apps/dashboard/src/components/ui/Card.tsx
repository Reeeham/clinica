import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  as: Tag = "section",
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
  flush?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-line bg-surface shadow-card",
        flush ? "" : "overflow-hidden",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  hint,
  action,
  className,
  dense = false,
}: {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-line",
        dense ? "px-4 py-3" : "px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-[0.9375rem] font-semibold leading-tight tracking-[-0.01em]">
          {title}
        </h2>
        {hint ? <p className="mt-1 text-[0.8125rem] leading-snug text-ink-3">{hint}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}

export function CardBody({
  children,
  className,
  dense = false,
}: {
  children: ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return <div className={cn(dense ? "p-4" : "p-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <footer
      className={cn(
        "flex items-center justify-between gap-3 border-t border-line bg-raised px-5 py-3 text-[0.8125rem] text-ink-3",
        className,
      )}
    >
      {children}
    </footer>
  );
}
