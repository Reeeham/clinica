import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("scroll-thin w-full overflow-x-auto", className)}>
      <table className="w-full min-w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-line bg-raised/70">
      <tr>{children}</tr>
    </thead>
  );
}

export function TH({
  children,
  className,
  align = "start",
  ...props
}: Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> & { align?: "start" | "end" | "center" }) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2.5 text-2xs font-semibold uppercase tracking-[0.06em] text-ink-3",
        align === "end" && "text-end",
        align === "center" && "text-center",
        align === "start" && "text-start",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TR({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <tr
      className={cn(
        "group/row",
        interactive && "transition-colors hover:bg-brand-softer/70",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TD({
  children,
  className,
  align = "start",
  ...props
}: Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> & { align?: "start" | "end" | "center" }) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle text-ink-2",
        align === "end" && "text-end",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}
