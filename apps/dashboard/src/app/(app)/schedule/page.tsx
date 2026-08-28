import { getBookings, getEmployees, getClinicSettings } from "@/lib/data";
import { ScheduleView } from "./ScheduleView";
import { todayISO } from "@clinica/core";
import { getTranslator } from "@/lib/locale";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, t } = await getTranslator();
  const params = await searchParams;

  const date = typeof params.date === "string" ? params.date : todayISO();
  const mode = typeof params.mode === "string" ? params.mode : "room";
  const view = typeof params.view === "string" ? params.view : "day";

  const [bookingsData, employeesData, clinic] = await Promise.all([
    getBookings({ date, pageSize: 100 }),
    getEmployees(),
    getClinicSettings(),
  ]);

  const rooms = clinic?.rooms ?? [];
  const employees = employeesData.items.filter(
    (e) => e.role !== "receptionist" && e.status === "active",
  );

  return (
    <ScheduleView
      locale={locale}
      date={date}
      mode={mode}
      view={view}
      bookings={bookingsData.items}
      rooms={rooms}
      employees={employees}
      clinicHours={clinic?.hours ?? []}
    />
  );
}
