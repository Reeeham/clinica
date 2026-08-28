"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { searchCustomersAction } from "@/lib/mutations";
import type { CustomerData } from "@/lib/api";

export function CustomerCombobox({
  value,
  onChange,
  initialCustomers,
}: {
  value: string;
  onChange: (id: string) => void;
  initialCustomers: CustomerData[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerData[]>(initialCustomers);
  const [loading, setLoading] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const selected = results.find(c => c.id === value) ?? initialCustomers.find(c => c.id === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Debounced search
  const runSearch = useCallback(async (q: string) => {
    setLoading(true);
    const res = await searchCustomersAction(q);
    if (res.ok) setResults(res.items);
    setLoading(false);
  }, []);

  const onQueryChange = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 300);
  };

  const pick = (customer: CustomerData) => {
    onChange(customer.id);
    setOpen(false);
    setQuery("");
  };

  const clear = () => {
    onChange("");
    setQuery("");
    setResults(initialCustomers);
  };

  return (
    <div ref={wrap} className="relative">
      {selected && !open ? (
        <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-line-strong bg-surface px-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar initials={selected.initials} color={selected.color} size="xs" />
            <span className="truncate text-sm text-ink">{selected.nameEn}</span>
            <span className="truncate text-xs text-ink-4">{selected.phone}</span>
          </div>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded p-0.5 text-ink-4 hover:bg-ink/[0.06] hover:text-ink-2"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
          <input
            type="text"
            value={query}
            onChange={e => { onQueryChange(e.target.value); setOpen(true); }}
            onFocus={() => { setOpen(true); if (results.length === 0) runSearch(""); }}
            placeholder="Search clients by name or phone…"
            className="h-10 w-full rounded-lg border border-line-strong bg-surface ps-9 pe-3 text-sm text-ink shadow-xs transition-colors hover:border-ink-4/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </div>
      )}

      {open ? (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-surface shadow-pop">
          {loading ? (
            <div className="px-3 py-4 text-center text-xs text-ink-4">Searching…</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-ink-4">
              {query ? "No clients found" : "Type to search clients"}
            </div>
          ) : (
            <ul className="py-1">
              {results.map(c => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => pick(c)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-start transition-colors hover:bg-brand-softer",
                      c.id === value && "bg-brand-soft",
                    )}
                  >
                    <Avatar initials={c.initials} color={c.color} size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{c.nameEn}</p>
                      <p className="truncate text-xs text-ink-4">{c.phone}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
