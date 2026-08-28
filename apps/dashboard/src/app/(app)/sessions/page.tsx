import { getSessions, getCustomers, getEmployees, getServices } from "@/lib/data";
import { SessionsManager } from "@/components/sessions/SessionsManager";

export default async function SessionsPage() {
  const [sessionsData, customersData, employeesData, servicesData] = await Promise.all([
    getSessions(),
    getCustomers(),
    getEmployees(),
    getServices(),
  ]);

  return (
    <SessionsManager
      sessions={sessionsData.items}
      customers={customersData.items}
      employees={employeesData.items}
      services={servicesData.items}
    />
  );
}
