import { cn } from "@/lib/cn";

const SIZES = {
  xs: "h-6 w-6 text-[0.625rem]",
  sm: "h-8 w-8 text-[0.6875rem]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({
  initials,
  color,
  size = "md",
  className,
  ring = false,
}: {
  initials: string;
  color: string;
  size?: keyof typeof SIZES;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase tracking-wide text-white",
        SIZES[size],
        ring && "ring-2 ring-surface",
        className,
      )}
      style={{
        background: `linear-gradient(140deg, ${color} 0%, ${shade(color, -18)} 100%)`,
      }}
    >
      {initials}
    </span>
  );
}

/** Darkens/lightens a hex colour so avatars get a subtle gradient. */
function shade(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const num = parseInt(value.length === 3 ? value.replace(/./g, "$&$&") : value, 16);
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  const r = clamp(((num >> 16) & 255) + amount);
  const g = clamp(((num >> 8) & 255) + amount);
  const b = clamp((num & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function AvatarStack({
  people,
  max = 4,
}: {
  people: { initials: string; color: string }[];
  max?: number;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((person, index) => (
        <span key={index} className={index === 0 ? "" : "-ms-2"}>
          <Avatar initials={person.initials} color={person.color} size="sm" ring />
        </span>
      ))}
      {rest > 0 ? (
        <span className="-ms-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-line text-[0.6875rem] font-semibold text-ink-2 ring-2 ring-surface">
          +{rest}
        </span>
      ) : null}
    </div>
  );
}
