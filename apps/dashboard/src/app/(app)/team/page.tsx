import {
  employeeRoleLabel,
  employeeStatusLabel,
  formatMoney,
  formatPercent,
  type EmployeeRole,
} from "@clinica/core";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { TableWrap, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Dot } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { buttonClass } from "@/components/ui/Button";
import { L } from "@/lib/i18n";
import { getTranslator } from "@/lib/locale";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { getEmployees } from "@/lib/data";
import { EmployeeFormModal } from "@/components/team/EmployeeFormModal";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, t } = await getTranslator();
  const params = await searchParams;

  const roleParam = typeof params.role === "string" ? params.role : undefined;

  const employeesData = await getEmployees();
  let rows = employeesData.items;
  if (roleParam) {
    rows = rows.filter((e) => e.role === roleParam);
  }

  const roles: EmployeeRole[] = ["owner", "manager", "doctor", "therapist", "receptionist"];

  return (
    <>
      <PageHeader
        title={t("team.title")}
        subtitle={t("team.subtitle")}
        actions={
          <Link href="/team?new=1" className={buttonClass({ variant: "primary", size: "md" })}>
            {t("action.newStaff")}
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/team"
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            !roleParam ? "bg-brand-soft text-brand-ink" : "text-ink-3 hover:bg-ink/[0.04]",
          )}
        >
          {t("common.all")}
        </Link>
        {roles.map((role) => (
          <Link
            key={role}
            href={`/team?role=${role}`}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              roleParam === role
                ? "bg-brand-soft text-brand-ink"
                : "text-ink-3 hover:bg-ink/[0.04]",
            )}
          >
            {L(employeeRoleLabel[role], locale)}
          </Link>
        ))}
      </div>

      <Card flush>
        {rows.length === 0 ? (
          <EmptyState icon={<Users className="h-5 w-5" />} title={t("team.empty")} />
        ) : (
          <TableWrap>
            <THead>
              <TH>{t("common.staff")}</TH>
              <TH className="hidden sm:table-cell">{t("team.col.role")}</TH>
              <TH align="end" className="hidden md:table-cell">{t("team.col.sessions")}</TH>
              <TH align="end" className="hidden lg:table-cell">{t("team.col.revenue")}</TH>
              <TH align="end" className="hidden lg:table-cell">{t("team.col.commission")}</TH>
              <TH className="hidden xl:table-cell">{t("team.col.utilisation")}</TH>
              <TH align="end" className="hidden md:table-cell">{t("team.col.upcoming")}</TH>
            </THead>
            <TBody>
              {rows.map((employee) => (
                <TR key={employee.id} interactive>
                  <TD>
                    <Link
                      href={`/team/${employee.id}`}
                      className="flex items-center gap-2.5 rounded-md py-0.5 transition-colors hover:text-brand"
                    >
                      <Avatar initials={employee.initials} color={employee.color} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-[0.8125rem] font-medium text-ink">
                          {locale === "ar" ? employee.nameAr : employee.nameEn}
                        </p>
                        <p className="truncate text-2xs text-ink-4">
                          {locale === "ar" ? employee.titleAr : employee.titleEn}
                        </p>
                      </div>
                    </Link>
                  </TD>
                  <TD className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Dot
                        tone={
                          employee.status === "active"
                            ? "success"
                            : employee.status === "on_leave"
                              ? "warn"
                              : "muted"
                        }
                      />
                      <span className="text-xs text-ink-2">
                        {L(employeeRoleLabel[employee.role as EmployeeRole], locale)}
                      </span>
                    </div>
                  </TD>
                  <TD align="end" className="hidden md:table-cell">
                    <span className="text-[0.8125rem] tabular-nums text-ink-2">—</span>
                  </TD>
                  <TD align="end" className="hidden lg:table-cell">
                    <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">—</span>
                  </TD>
                  <TD align="end" className="hidden lg:table-cell">
                    <span className="text-[0.8125rem] tabular-nums text-ink-3">—</span>
                  </TD>
                  <TD className="hidden xl:table-cell">
                    <span className="text-2xs text-ink-3">—</span>
                  </TD>
                  <TD align="end" className="hidden md:table-cell">
                    <span className="text-xs text-ink-4">—</span>
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableWrap>
        )}
      </Card>

      <EmployeeFormModal />
    </>
  );
}
