import Link from "next/link";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";

export function PersonCell({
  name,
  subtitle,
  initials,
  color,
  href,
  badge,
  size = "sm",
}: {
  name: string;
  subtitle?: string;
  initials: string;
  color: string;
  href?: string;
  badge?: React.ReactNode;
  size?: "xs" | "sm" | "md";
}) {
  const body = (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar initials={initials} color={color} size={size} />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "truncate font-medium text-ink",
              size === "md" ? "text-sm" : "text-[0.8125rem]",
            )}
          >
            {name}
          </span>
          {badge}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-xs tabular-nums text-ink-3">{subtitle}</span>
        ) : null}
      </span>
    </span>
  );

  if (!href) return body;

  return (
    <Link
      href={href}
      className="group/person -mx-1 inline-flex min-w-0 rounded-md px-1 py-0.5 transition-colors hover:bg-brand-softer"
    >
      {body}
    </Link>
  );
}
