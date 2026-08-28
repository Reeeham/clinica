import {
  customerSourceLabel,
  formatMoney,
  formatDate,
  formatPhone,
  formatRelativeDay,
  type CustomerSource,
} from "@clinica/core";
import { UserSearch } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { TableWrap, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { TabLinks } from "@/components/ui/Tabs";
import { L } from "@/lib/i18n";
import { getTranslator } from "@/lib/locale";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { getCustomers } from "@/lib/data";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, t } = await getTranslator();
  const params = await searchParams;

  const statusParam = typeof params.status === "string" ? params.status : "all";
  const searchParam = typeof params.search === "string" ? params.search : undefined;
  const sourceParam = typeof params.source === "string" ? params.source : undefined;

  const apiParams: Record<string, string | undefined> = { pageSize: "100" };
  if (searchParam) apiParams.search = searchParam;
  if (sourceParam) apiParams.source = sourceParam;
  if (statusParam === "active") apiParams.status = "active";
  else if (statusParam === "lapsed") { apiParams.status = "all"; apiParams.filter = "lapsed"; }
  else if (statusParam === "new") { apiParams.status = "all"; apiParams.filter = "new"; }
  else apiParams.status = "all";

  const customersData = await getCustomers(apiParams);
  const rows = customersData.items.map((c) => ({
    customer: c,
    visits: 0,
    lastVisit: null as string | null,
    nextVisit: null as string | null,
    lifetimeValue: 0,
    activePackages: 0,
  }));

  const statusTabs = [
    { href: buildFilter(params, { status: "all" }), label: t("common.all"), active: statusParam === "all", count: customersData.total },
    { href: buildFilter(params, { status: "active" }), label: t("customers.filter.active"), active: statusParam === "active" },
    { href: buildFilter(params, { status: "new" }), label: t("customers.filter.new"), active: statusParam === "new" },
    { href: buildFilter(params, { status: "lapsed" }), label: t("customers.filter.lapsed"), active: statusParam === "lapsed" },
  ];

  const sources: CustomerSource[] = ["app", "walk_in", "instagram", "referral", "phone"];

  return (
    <>
      <PageHeader
        title={t("customers.title")}
        subtitle={t("customers.subtitle")}
        actions={
          <Link href="/customers?new=1" className={buttonClass({ variant: "primary", size: "md" })}>
            {t("action.newClient")}
          </Link>
        }
      />

      <div className="mb-4">
        <TabLinks items={statusTabs} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={buildFilter(params, { source: undefined })}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            !sourceParam ? "bg-brand-soft text-brand-ink" : "text-ink-3 hover:bg-ink/[0.04]",
          )}
        >
          {t("common.all")}
        </Link>
        {sources.map((source) => (
          <Link
            key={source}
            href={buildFilter(params, { source })}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              sourceParam === source
                ? "bg-brand-soft text-brand-ink"
                : "text-ink-3 hover:bg-ink/[0.04]",
            )}
          >
            {L(customerSourceLabel[source], locale)}
          </Link>
        ))}
      </div>

      <Card flush>
        {rows.length === 0 ? (
          <EmptyState
            icon={<UserSearch className="h-5 w-5" />}
            title={t("customers.empty")}
            hint={t("customers.emptyHint")}
          />
        ) : (
          <TableWrap>
            <THead>
              <TH>{t("common.client")}</TH>
              <TH className="hidden sm:table-cell">{t("common.phone")}</TH>
              <TH className="hidden md:table-cell">{t("customers.col.visits")}</TH>
              <TH className="hidden lg:table-cell">{t("customers.col.lastVisit")}</TH>
              <TH className="hidden lg:table-cell">{t("customers.col.nextVisit")}</TH>
              <TH align="end" className="hidden md:table-cell">{t("customers.col.value")}</TH>
              <TH className="hidden xl:table-cell">{t("customers.col.packages")}</TH>
            </THead>
            <TBody>
              {rows.map((row) => {
                const customer = row.customer;
                return (
                  <TR key={customer.id} interactive>
                    <TD>
                      <Link
                        href={`/customers/${customer.id}`}
                        className="flex items-center gap-2.5 rounded-md py-0.5 transition-colors hover:text-brand"
                      >
                        <Avatar initials={customer.initials} color={customer.color} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[0.8125rem] font-medium text-ink">
                            {locale === "ar" ? customer.nameAr : customer.nameEn}
                          </p>
                          <p className="text-2xs text-ink-4">
                            {t("customers.since")} {formatDate(customer.createdAt, locale)}
                          </p>
                        </div>
                      </Link>
                    </TD>
                    <TD className="hidden sm:table-cell">
                      <span className="text-xs tabular-nums text-ink-3">
                        {formatPhone(customer.phone)}
                      </span>
                    </TD>
                    <TD className="hidden md:table-cell">
                      <span className="text-[0.8125rem] tabular-nums text-ink-2">{row.visits}</span>
                    </TD>
                    <TD className="hidden lg:table-cell">
                      {row.lastVisit ? (
                        <span className="text-xs text-ink-3">
                          {formatRelativeDay(row.lastVisit.slice(0, 10), locale)}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-4">{t("common.never")}</span>
                      )}
                    </TD>
                    <TD className="hidden lg:table-cell">
                      {row.nextVisit ? (
                        <span className="text-xs font-medium text-brand">
                          {formatRelativeDay(row.nextVisit.slice(0, 10), locale)}
                        </span>
                      ) : !customer.active ? (
                        <Badge tone="warn" size="sm">
                          {t("customers.lapsedBadge")}
                        </Badge>
                      ) : null}
                    </TD>
                    <TD align="end" className="hidden md:table-cell">
                      <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                        {formatMoney(row.lifetimeValue, { locale, compact: true })}
                      </span>
                    </TD>
                    <TD className="hidden xl:table-cell">
                      {row.activePackages > 0 ? (
                        <Badge tone="success" size="sm">
                          {row.activePackages}
                        </Badge>
                      ) : (
                        <span className="text-xs text-ink-4">{t("common.none")}</span>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </TableWrap>
        )}
      </Card>

      {rows.length > 0 ? (
        <p className="mt-3 text-xs text-ink-4">
          {t("common.showing")} {rows.length} {t("common.results")}
        </p>
      ) : null}

      <CustomerFormModal />
    </>
  );
}

function buildFilter(
  params: Record<string, string | string[] | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const merged: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") merged[key] = value;
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete merged[key];
    else merged[key] = value;
  }
  const search = new URLSearchParams(merged);
  return `/customers?${search.toString()}`;
}
