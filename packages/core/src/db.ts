import type {
  Booking,
  BookingStatus,
  Clinic,
  Customer,
  Employee,
  Entitlement,
  ISODate,
  Offer,
  Order,
  Package,
  Payment,
  Payout,
  Piastres,
  Review,
  Service,
  SessionRecord,
} from "./types";
import { ACTIVE_CLINIC_ID, activeClinic, clinics, rooms } from "./data/clinics";
import { offers, packages, services } from "./data/catalog";
import { employees, providers } from "./data/staff";
import {
  allPackages,
  allServices,
  bookings,
  customers,
  entitlements,
  orders,
  payments,
  payouts,
  reviews,
  sessionRecords,
} from "./data/generate";
import { addDays, diffDays, isSameDay, parseISO, toISODate, today, todayISO } from "./time";

export {
  ACTIVE_CLINIC_ID,
  activeClinic,
  allPackages,
  allServices,
  bookings,
  clinics,
  customers,
  employees,
  entitlements,
  offers,
  orders,
  packages,
  payments,
  payouts,
  providers,
  reviews,
  rooms,
  services,
  sessionRecords,
};

/* ------------------------------------------------------------------ indexes */

const customerIndex = new Map(customers.map((c) => [c.id, c]));
const employeeIndex = new Map(employees.map((e) => [e.id, e]));
const serviceIndex = new Map(allServices.map((s) => [s.id, s]));
const packageIndex = new Map(allPackages.map((p) => [p.id, p]));
const roomIndex = new Map(rooms.map((r) => [r.id, r]));
const bookingIndex = new Map(bookings.map((b) => [b.id, b]));
const orderIndex = new Map(orders.map((o) => [o.id, o]));
const entitlementIndex = new Map(entitlements.map((e) => [e.id, e]));
const clinicIndex = new Map(clinics.map((c) => [c.id, c]));

export const getCustomer = (id: string): Customer | undefined => customerIndex.get(id);
export const getEmployee = (id: string): Employee | undefined => employeeIndex.get(id);
export const getService = (id: string): Service | undefined => serviceIndex.get(id);
export const getPackage = (id: string): Package | undefined => packageIndex.get(id);
export const getRoom = (id: string) => roomIndex.get(id);
export const getBooking = (id: string): Booking | undefined => bookingIndex.get(id);
export const getOrder = (id: string): Order | undefined => orderIndex.get(id);
export const getEntitlement = (id: string): Entitlement | undefined => entitlementIndex.get(id);
export const getClinic = (id: string): Clinic | undefined => clinicIndex.get(id);
export const getClinicBySlug = (slug: string): Clinic | undefined =>
  clinics.find((c) => c.slug === slug);

/* ----------------------------------------------------------------- bookings */

export const ACTIVE_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "checked_in",
  "in_progress",
];

export interface BookingQuery {
  date?: ISODate;
  from?: ISODate;
  to?: ISODate;
  status?: BookingStatus[];
  employeeId?: string;
  customerId?: string;
  roomId?: string;
  channel?: string[];
  search?: string;
}

export function listBookings(query: BookingQuery = {}): Booking[] {
  const term = query.search?.trim().toLowerCase();
  return bookings.filter((booking) => {
    if (query.date && !isSameDay(booking.startsAt, query.date)) return false;
    if (query.from && booking.startsAt.slice(0, 10) < query.from) return false;
    if (query.to && booking.startsAt.slice(0, 10) > query.to) return false;
    if (query.status && !query.status.includes(booking.status)) return false;
    if (query.employeeId && booking.employeeId !== query.employeeId) return false;
    if (query.customerId && booking.customerId !== query.customerId) return false;
    if (query.roomId && booking.roomId !== query.roomId) return false;
    if (query.channel && !query.channel.includes(booking.channel)) return false;
    if (term) {
      const customer = customerIndex.get(booking.customerId);
      const service = serviceIndex.get(booking.serviceId);
      const haystack = [
        booking.ref,
        customer?.name.en,
        customer?.name.ar,
        customer?.phone,
        service?.name.en,
        service?.name.ar,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

export function bookingsForDay(date: ISODate = todayISO()): Booking[] {
  return listBookings({ date });
}

/** The next appointment that has not started yet. */
export function upcomingBookings(limit = 5): Booking[] {
  const now = new Date();
  const stamp = `${toISODate(now)}T${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
  return bookings
    .filter((b) => b.startsAt >= stamp && ACTIVE_STATUSES.includes(b.status))
    .slice(0, limit);
}

/* ---------------------------------------------------------------- customers */

export interface CustomerQuery {
  search?: string;
  tag?: string;
  source?: string;
  status?: "active" | "lapsed" | "new" | "all";
}

export interface CustomerSummary {
  customer: Customer;
  visits: number;
  lastVisit: ISODate | null;
  nextVisit: ISODate | null;
  lifetimeValue: Piastres;
  outstanding: Piastres;
  activePackages: number;
  noShows: number;
}

const bookingsByCustomer = new Map<string, Booking[]>();
for (const booking of bookings) {
  const bucket = bookingsByCustomer.get(booking.customerId) ?? [];
  bucket.push(booking);
  bookingsByCustomer.set(booking.customerId, bucket);
}

const paymentsByCustomer = new Map<string, Payment[]>();
for (const payment of payments) {
  const bucket = paymentsByCustomer.get(payment.customerId) ?? [];
  bucket.push(payment);
  paymentsByCustomer.set(payment.customerId, bucket);
}

const ordersByCustomer = new Map<string, Order[]>();
for (const order of orders) {
  const bucket = ordersByCustomer.get(order.customerId) ?? [];
  bucket.push(order);
  ordersByCustomer.set(order.customerId, bucket);
}

const sessionsByCustomer = new Map<string, SessionRecord[]>();
for (const record of sessionRecords) {
  const bucket = sessionsByCustomer.get(record.customerId) ?? [];
  bucket.push(record);
  sessionsByCustomer.set(record.customerId, bucket);
}

export function customerBookings(customerId: string): Booking[] {
  return (bookingsByCustomer.get(customerId) ?? []).slice().reverse();
}

export function customerSessions(customerId: string): SessionRecord[] {
  return (sessionsByCustomer.get(customerId) ?? [])
    .slice()
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt));
}

export function customerOrders(customerId: string): Order[] {
  return ordersByCustomer.get(customerId) ?? [];
}

export function customerPayments(customerId: string): Payment[] {
  return paymentsByCustomer.get(customerId) ?? [];
}

export function customerEntitlements(customerId: string): Entitlement[] {
  return entitlements.filter((e) => e.customerId === customerId);
}

export function orderTotals(order: Order) {
  const subtotal = order.lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
  const total = subtotal - order.discount;
  const paid = payments
    .filter((p) => p.orderId === order.id && p.status === "succeeded")
    .reduce((a, p) => a + p.amount, 0);
  return { subtotal, discount: order.discount, total, paid, balance: total - paid };
}

export function customerSummary(customerId: string): CustomerSummary {
  const customer = customerIndex.get(customerId)!;
  const list = bookingsByCustomer.get(customerId) ?? [];
  const completed = list.filter((b) => b.status === "completed");
  const upcoming = list
    .filter((b) => ACTIVE_STATUSES.includes(b.status) && b.startsAt.slice(0, 10) >= todayISO())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const lifetimeValue = (paymentsByCustomer.get(customerId) ?? [])
    .filter((p) => p.status === "succeeded")
    .reduce((a, p) => a + p.amount, 0);

  const outstanding = (ordersByCustomer.get(customerId) ?? [])
    .map(orderTotals)
    .reduce((a, t) => a + Math.max(0, t.balance), 0);

  return {
    customer,
    visits: completed.length,
    lastVisit: completed.length ? completed[completed.length - 1].startsAt : null,
    nextVisit: upcoming.length ? upcoming[0].startsAt : null,
    lifetimeValue,
    outstanding,
    activePackages: customerEntitlements(customerId).filter((e) => e.status === "active").length,
    noShows: list.filter((b) => b.status === "no_show").length,
  };
}

export function listCustomers(query: CustomerQuery = {}): CustomerSummary[] {
  const term = query.search?.trim().toLowerCase();
  const result = customers
    .filter((customer) => {
      if (term) {
        const haystack = `${customer.name.en} ${customer.name.ar} ${customer.phone} ${customer.email ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (query.tag && !customer.tags.includes(query.tag)) return false;
      if (query.source && customer.source !== query.source) return false;
      return true;
    })
    .map((customer) => customerSummary(customer.id));

  if (!query.status || query.status === "all") return sortCustomers(result);
  return sortCustomers(
    result.filter((row) => {
      const daysSinceJoin = -diffDays(row.customer.createdAt, todayISO());
      if (query.status === "new") return daysSinceJoin <= 30;
      const lapsed = !row.lastVisit || -diffDays(row.lastVisit.slice(0, 10), todayISO()) > 90;
      return query.status === "lapsed" ? lapsed : !lapsed;
    }),
  );
}

function sortCustomers(rows: CustomerSummary[]): CustomerSummary[] {
  return rows.sort((a, b) => {
    const aKey = a.nextVisit ?? a.lastVisit ?? a.customer.createdAt;
    const bKey = b.nextVisit ?? b.lastVisit ?? b.customer.createdAt;
    return bKey.localeCompare(aKey);
  });
}

export function entitlementProgress(entitlement: Entitlement) {
  const total = entitlement.balance.reduce((a, b) => a + b.total, 0);
  const used = entitlement.balance.reduce((a, b) => a + b.used, 0);
  return { total, used, remaining: total - used, ratio: total ? used / total : 0 };
}

/* ---------------------------------------------------------------- employees */

export interface EmployeeSummary {
  employee: Employee;
  sessions30d: number;
  revenue30d: Piastres;
  commission30d: Piastres;
  utilisation: number;
  upcoming: number;
  rebookRate: number;
}

export function employeeSummary(employeeId: string): EmployeeSummary {
  const employee = employeeIndex.get(employeeId)!;
  const from = toISODate(addDays(today(), -30));
  const window = bookings.filter(
    (b) => b.employeeId === employeeId && b.startsAt.slice(0, 10) >= from,
  );
  const completed = window.filter((b) => b.status === "completed");

  const revenue30d = completed.reduce((total, booking) => {
    if (booking.entitlementId) {
      // Package sessions are recognised at their list price for staff performance.
      return total + (serviceIndex.get(booking.serviceId)?.price ?? 0);
    }
    return total + booking.price;
  }, 0);

  const scheduledMinutes = window
    .filter((b) => b.status !== "cancelled")
    .reduce((total, b) => {
      const service = serviceIndex.get(b.serviceId);
      return total + (service?.durationMin ?? 0);
    }, 0);
  const capacityMinutes = employee.shifts.reduce((total, shift) => {
    const [fh, fm] = shift.from.split(":").map(Number);
    const [th, tm] = shift.to.split(":").map(Number);
    return total + (th * 60 + tm - (fh * 60 + fm));
  }, 0) * 4.3;

  const withFollowUp = completed.filter((booking) => {
    const later = (bookingsByCustomer.get(booking.customerId) ?? []).some(
      (b) => b.startsAt > booking.startsAt && b.status !== "cancelled",
    );
    return later;
  });

  return {
    employee,
    sessions30d: completed.length,
    revenue30d,
    commission30d: Math.round(revenue30d * employee.commissionRate),
    utilisation: capacityMinutes ? Math.min(1, scheduledMinutes / capacityMinutes) : 0,
    upcoming: bookings.filter(
      (b) =>
        b.employeeId === employeeId &&
        ACTIVE_STATUSES.includes(b.status) &&
        b.startsAt.slice(0, 10) >= todayISO(),
    ).length,
    rebookRate: completed.length ? withFollowUp.length / completed.length : 0,
  };
}

export function listEmployeeSummaries(): EmployeeSummary[] {
  return employees.map((e) => employeeSummary(e.id));
}

/* ------------------------------------------------------- orders & payments */

export interface PaymentQuery {
  from?: ISODate;
  to?: ISODate;
  method?: string[];
  search?: string;
}

export function listPayments(query: PaymentQuery = {}): Payment[] {
  const term = query.search?.trim().toLowerCase();
  return payments.filter((payment) => {
    if (query.from && payment.paidAt.slice(0, 10) < query.from) return false;
    if (query.to && payment.paidAt.slice(0, 10) > query.to) return false;
    if (query.method && !query.method.includes(payment.method)) return false;
    if (term) {
      const customer = customerIndex.get(payment.customerId);
      const haystack = `${payment.ref} ${payment.gatewayRef ?? ""} ${customer?.name.en} ${customer?.name.ar} ${customer?.phone}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

export function listOpenOrders(): Order[] {
  return orders.filter((o) => orderTotals(o).balance > 0);
}

/* ---------------------------------------------------------------- analytics */

export interface Metric {
  value: number;
  previous: number;
  delta: number;
}

function metric(value: number, previous: number): Metric {
  return {
    value,
    previous,
    delta: previous === 0 ? (value === 0 ? 0 : 1) : (value - previous) / previous,
  };
}

function revenueBetween(from: ISODate, to: ISODate): Piastres {
  return payments
    .filter((p) => p.status === "succeeded" && p.paidAt.slice(0, 10) >= from && p.paidAt.slice(0, 10) <= to)
    .reduce((a, p) => a + p.amount, 0);
}

function completedBetween(from: ISODate, to: ISODate): number {
  return bookings.filter(
    (b) => b.status === "completed" && b.startsAt.slice(0, 10) >= from && b.startsAt.slice(0, 10) <= to,
  ).length;
}

export interface OverviewMetrics {
  revenue: Metric;
  sessions: Metric;
  newCustomers: Metric;
  appShare: Metric;
  platformFees: Piastres;
  noShowRate: Metric;
  averageTicket: Metric;
}

export function overviewMetrics(days = 30): OverviewMetrics {
  const end = todayISO();
  const start = toISODate(addDays(today(), -(days - 1)));
  const prevEnd = toISODate(addDays(today(), -days));
  const prevStart = toISODate(addDays(today(), -(days * 2 - 1)));

  const revenue = revenueBetween(start, end);
  const prevRevenue = revenueBetween(prevStart, prevEnd);
  const sessions = completedBetween(start, end);
  const prevSessions = completedBetween(prevStart, prevEnd);

  const newCustomers = customers.filter((c) => c.createdAt >= start && c.createdAt <= end).length;
  const prevNewCustomers = customers.filter(
    (c) => c.createdAt >= prevStart && c.createdAt <= prevEnd,
  ).length;

  const window = bookings.filter(
    (b) => b.startsAt.slice(0, 10) >= start && b.startsAt.slice(0, 10) <= end,
  );
  const prevWindow = bookings.filter(
    (b) => b.startsAt.slice(0, 10) >= prevStart && b.startsAt.slice(0, 10) <= prevEnd,
  );
  const share = (list: Booking[]) =>
    list.length ? list.filter((b) => b.channel === "app").length / list.length : 0;
  const noShow = (list: Booking[]) => {
    const finished = list.filter((b) => ["completed", "no_show"].includes(b.status));
    return finished.length ? finished.filter((b) => b.status === "no_show").length / finished.length : 0;
  };

  const fees = payments
    .filter((p) => p.paidAt.slice(0, 10) >= start && p.paidAt.slice(0, 10) <= end)
    .reduce((a, p) => a + p.platformFee, 0);

  return {
    revenue: metric(revenue, prevRevenue),
    sessions: metric(sessions, prevSessions),
    newCustomers: metric(newCustomers, prevNewCustomers),
    appShare: metric(share(window), share(prevWindow)),
    platformFees: fees,
    noShowRate: metric(noShow(window), noShow(prevWindow)),
    averageTicket: metric(sessions ? revenue / sessions : 0, prevSessions ? prevRevenue / prevSessions : 0),
  };
}

export interface SeriesPoint {
  date: ISODate;
  value: number;
  secondary: number;
}

export function revenueSeries(days = 30): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = toISODate(addDays(today(), -i));
    const dayPayments = payments.filter((p) => p.paidAt.slice(0, 10) === date);
    points.push({
      date,
      value: dayPayments.reduce((a, p) => a + p.amount, 0),
      secondary: dayPayments
        .filter((p) => p.method === "app_online")
        .reduce((a, p) => a + p.amount, 0),
    });
  }
  return points;
}

export interface ServicePerformance {
  service: Service;
  sessions: number;
  revenue: Piastres;
}

export function topServices(days = 30, limit = 6): ServicePerformance[] {
  const from = toISODate(addDays(today(), -days));
  const map = new Map<string, ServicePerformance>();
  for (const booking of bookings) {
    if (booking.status !== "completed") continue;
    if (booking.startsAt.slice(0, 10) < from) continue;
    const service = serviceIndex.get(booking.serviceId);
    if (!service) continue;
    const row = map.get(service.id) ?? { service, sessions: 0, revenue: 0 };
    row.sessions += 1;
    row.revenue += booking.entitlementId ? service.price : booking.price;
    map.set(service.id, row);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function channelMix(days = 30): { channel: string; count: number }[] {
  const from = toISODate(addDays(today(), -days));
  const map = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.startsAt.slice(0, 10) < from) continue;
    map.set(booking.channel, (map.get(booking.channel) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count);
}

export function paymentMethodMix(days = 30): { method: string; amount: Piastres }[] {
  const from = toISODate(addDays(today(), -days));
  const map = new Map<string, number>();
  for (const payment of payments) {
    if (payment.paidAt.slice(0, 10) < from) continue;
    map.set(payment.method, (map.get(payment.method) ?? 0) + payment.amount);
  }
  return [...map.entries()]
    .map(([method, amount]) => ({ method, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/** Hour-by-hour load for the current week — feeds the heatmap on the overview. */
export function loadHeatmap(): { day: number; hour: number; count: number }[] {
  const from = toISODate(addDays(today(), -27));
  const grid = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.startsAt.slice(0, 10) < from) continue;
    if (booking.startsAt.slice(0, 10) > todayISO()) continue;
    const date = parseISO(booking.startsAt);
    const key = `${date.getDay()}-${date.getHours()}`;
    grid.set(key, (grid.get(key) ?? 0) + 1);
  }
  const cells: { day: number; hour: number; count: number }[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 11; hour <= 20; hour++) {
      cells.push({ day, hour, count: grid.get(`${day}-${hour}`) ?? 0 });
    }
  }
  return cells;
}

export interface TodaySnapshot {
  total: number;
  completed: number;
  remaining: number;
  inProgress: number;
  awaitingConfirmation: number;
  expectedRevenue: Piastres;
  collected: Piastres;
  occupancy: number;
}

export function todaySnapshot(): TodaySnapshot {
  const list = bookingsForDay();
  const completed = list.filter((b) => b.status === "completed");
  const active = list.filter((b) => ACTIVE_STATUSES.includes(b.status));
  const expected = list
    .filter((b) => b.status !== "cancelled")
    .reduce((total, b) => total + (b.price || serviceIndex.get(b.serviceId)?.price || 0), 0);
  const collected = payments
    .filter((p) => p.paidAt.slice(0, 10) === todayISO())
    .reduce((a, p) => a + p.amount, 0);

  const bookedMinutes = list
    .filter((b) => b.status !== "cancelled")
    .reduce((total, b) => total + (serviceIndex.get(b.serviceId)?.durationMin ?? 0), 0);
  const capacity = rooms.length * 9 * 60;

  return {
    total: list.length,
    completed: completed.length,
    remaining: active.length,
    inProgress: list.filter((b) => b.status === "in_progress").length,
    awaitingConfirmation: list.filter((b) => b.status === "pending").length,
    expectedRevenue: expected,
    collected,
    occupancy: Math.min(1, bookedMinutes / capacity),
  };
}

/** Clients who are due for their next session but have nothing booked. */
export interface FollowUp {
  customer: Customer;
  service: Service;
  dueAt: ISODate;
  overdueDays: number;
}

export function followUps(limit = 8): FollowUp[] {
  const rows: FollowUp[] = [];
  const seen = new Set<string>();
  for (const record of sessionRecords) {
    if (!record.nextDueAt) continue;
    if (record.nextDueAt > todayISO()) continue;
    const key = `${record.customerId}-${record.serviceId}`;
    if (seen.has(key)) continue;
    const hasFuture = (bookingsByCustomer.get(record.customerId) ?? []).some(
      (b) =>
        b.serviceId === record.serviceId &&
        b.startsAt.slice(0, 10) >= todayISO() &&
        ACTIVE_STATUSES.includes(b.status),
    );
    if (hasFuture) continue;
    const customer = customerIndex.get(record.customerId);
    const service = serviceIndex.get(record.serviceId);
    if (!customer || !service) continue;
    seen.add(key);
    rows.push({
      customer,
      service,
      dueAt: record.nextDueAt,
      overdueDays: -diffDays(record.nextDueAt, todayISO()),
    });
  }
  return rows.sort((a, b) => b.overdueDays - a.overdueDays).slice(0, limit);
}

export interface CatalogPerformance {
  package: Package;
  activeEntitlements: number;
  revenue: Piastres;
  sessionsDelivered: number;
}

export function packagePerformance(): CatalogPerformance[] {
  return packages.map((pkg) => {
    const owned = entitlements.filter((e) => e.packageId === pkg.id);
    const delivered = owned.reduce(
      (total, ent) => total + ent.balance.reduce((a, b) => a + b.used, 0),
      0,
    );
    const revenue = orders
      .filter((o) => o.lines.some((l) => l.kind === "package" && l.refId === pkg.id))
      .reduce((total, order) => total + orderTotals(order).paid, 0);
    return {
      package: pkg,
      activeEntitlements: owned.filter((e) => e.status === "active").length,
      revenue,
      sessionsDelivered: delivered,
    };
  });
}

/* ---------------------------------------------------------- global search */

export type SearchHit =
  | { kind: "customer"; id: string; title: string; subtitle: string }
  | { kind: "booking"; id: string; title: string; subtitle: string }
  | { kind: "employee"; id: string; title: string; subtitle: string }
  | { kind: "service"; id: string; title: string; subtitle: string }
  | { kind: "package"; id: string; title: string; subtitle: string };

export function search(term: string, locale: "en" | "ar" = "en"): SearchHit[] {
  const q = term.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];

  for (const customer of customers) {
    if (
      `${customer.name.en} ${customer.name.ar} ${customer.phone}`.toLowerCase().includes(q)
    ) {
      hits.push({
        kind: "customer",
        id: customer.id,
        title: customer.name[locale],
        subtitle: customer.phone,
      });
    }
    if (hits.length > 24) break;
  }
  for (const employee of employees) {
    if (`${employee.name.en} ${employee.name.ar}`.toLowerCase().includes(q)) {
      hits.push({
        kind: "employee",
        id: employee.id,
        title: employee.name[locale],
        subtitle: employee.title[locale],
      });
    }
  }
  for (const service of services) {
    if (`${service.name.en} ${service.name.ar}`.toLowerCase().includes(q)) {
      hits.push({
        kind: "service",
        id: service.id,
        title: service.name[locale],
        subtitle: service.category,
      });
    }
  }
  for (const pkg of packages) {
    if (`${pkg.name.en} ${pkg.name.ar}`.toLowerCase().includes(q)) {
      hits.push({ kind: "package", id: pkg.id, title: pkg.name[locale], subtitle: "package" });
    }
  }
  for (const booking of bookings) {
    if (booking.ref.toLowerCase().includes(q)) {
      const customer = customerIndex.get(booking.customerId);
      hits.push({
        kind: "booking",
        id: booking.id,
        title: booking.ref,
        subtitle: customer?.name[locale] ?? "",
      });
    }
    if (hits.length > 40) break;
  }
  return hits.slice(0, 20);
}

/* ------------------------------------------------- marketplace (mobile app) */

export interface ClinicCard {
  clinic: Clinic;
  startingPrice: Piastres;
  serviceCount: number;
  distanceKm: number;
  nextSlot: string;
}

const HOME_LAT = 30.0444;
const HOME_LNG = 31.2357;

function distance(lat: number, lng: number): number {
  const dLat = (lat - HOME_LAT) * 111;
  const dLng = (lng - HOME_LNG) * 96;
  return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
}

export function clinicCards(): ClinicCard[] {
  return clinics
    .map((clinic) => {
      const own = allServices.filter((s) => s.clinicId === clinic.id && s.published);
      const startingPrice = own.length ? Math.min(...own.map((s) => s.price)) : 0;
      return {
        clinic,
        startingPrice,
        serviceCount: own.length,
        distanceKm: distance(clinic.lat, clinic.lng),
        nextSlot: ["Today 5:30 PM", "Today 7:00 PM", "Tomorrow 12:00 PM", "Tomorrow 3:15 PM"][
          clinic.id.length % 4
        ],
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function clinicServices(clinicId: string): Service[] {
  return allServices.filter((s) => s.clinicId === clinicId && s.published);
}

export function clinicPackages(clinicId: string): Package[] {
  return allPackages.filter((p) => p.clinicId === clinicId && p.published);
}

export function clinicOffers(clinicId: string): Offer[] {
  return offers.filter((o) => o.clinicId === clinicId && o.published);
}

export function clinicReviews(clinicId: string): Review[] {
  return reviews.filter((r) => r.clinicId === clinicId);
}

export function latestPayouts(): Payout[] {
  return payouts;
}
