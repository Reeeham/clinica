import { apiFetch, apiPost, apiPut, apiPatch, apiDelete } from "./api-client";
import { getToken } from "./auth-actions";

async function authHeaders(): Promise<{ token?: string }> {
  const token = await getToken();
  return token ? { token } : {};
}

// Types matching the API DTOs
export interface ClinicData {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  aboutEn: string;
  aboutAr: string;
  cityEn: string;
  cityAr: string;
  areaEn: string;
  areaAr: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  palette: string[];
  specialties: string[];
  plan: string;
  hours: { day: number; open: string | null; close: string | null }[];
  rooms: { id: string; nameEn: string; nameAr: string; supports: string[] }[];
}

export interface EmployeeData {
  id: string;
  nameEn: string;
  nameAr: string;
  role: string;
  titleEn: string;
  titleAr: string;
  phone: string;
  email: string;
  status: string;
  salary: number;
  commissionRate: number;
  specialties: string[];
  color: string;
  initials: string;
  rating: number;
  canLogin: boolean;
  hiredAt: string;
}

export interface CustomerData {
  id: string;
  nameEn: string;
  nameAr: string;
  phone: string;
  email: string | null;
  gender: string;
  birthDate: string | null;
  skinType: string | null;
  allergies: string[];
  conditions: string[];
  notes: string | null;
  tags: string[];
  source: string;
  marketingOptIn: boolean;
  active: boolean;
  createdAt: string;
  color: string;
  initials: string;
}

export interface BookingData {
  id: string;
  ref: string;
  customerId: string;
  employeeId: string;
  roomId: string;
  serviceId: string;
  entitlementId: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  channel: string;
  price: number;
  notes: string | null;
  sessionNumber: number | null;
  sessionTotal: number | null;
  createdAt: string;
}

export interface ServiceData {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
  descriptionEn: string;
  descriptionAr: string;
  durationMin: number;
  price: number;
  recommendedSessions: number;
  device: string | null;
  requiresDoctor: boolean;
  published: boolean;
  demand30d: number;
}

export interface PackageData {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  listPrice: number;
  validityDays: number;
  published: boolean;
  featured: boolean;
  soldCount: number;
  items: { serviceId: string; sessions: number }[];
}

export interface OfferData {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  kind: string;
  value: number;
  code: string;
  scopeKind: string;
  scopeIds: string[];
  startsAt: string;
  endsAt: string;
  usageLimit: number | null;
  usedCount: number;
  published: boolean;
}

export interface PaymentData {
  id: string;
  ref: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: string;
  status: string;
  platformFee: number;
  netToClinic: number;
  paidAt: string;
  gatewayRef: string | null;
  payoutId: string | null;
}

export interface PayoutData {
  id: string;
  periodStart: string;
  periodEnd: string;
  gross: number;
  fees: number;
  net: number;
  status: string;
  expectedAt: string;
}

// API functions
export async function fetchDashboardOverview(days = 30) {
  const auth = await authHeaders();
  return apiFetch<{ revenue: { value: number; previous: number; delta: number }; sessions: { value: number; previous: number; delta: number }; newCustomers: { value: number }; appShare: { value: number }; platformFees: number; noShowRate: { value: number }; averageTicket: { value: number } }>(`/dashboard/overview?days=${days}`, auth);
}

export async function fetchToday() {
  const auth = await authHeaders();
  return apiFetch<{ total: number; completed: number; remaining: number; inProgress: number; awaitingConfirmation: number; expectedRevenue: number; collected: number }>(`/dashboard/today`, auth);
}

export async function fetchUpcoming(limit = 6) {
  const auth = await authHeaders();
  return apiFetch<{ items: Array<Record<string, unknown>> }>(`/dashboard/upcoming?limit=${limit}`, auth);
}

export async function fetchRevenueSeries(days = 30) {
  const auth = await authHeaders();
  return apiFetch<{ items: Array<{ date: string; value: number; secondary: number }> }>(`/dashboard/revenue-series?days=${days}`, auth);
}

export async function fetchTopServices(days = 30, limit = 5) {
  const auth = await authHeaders();
  return apiFetch<{ items: Array<{ serviceId: string; nameEn: string; nameAr: string; sessions: number; revenue: number }> }>(`/dashboard/top-services?days=${days}&limit=${limit}`, auth);
}

export async function fetchChannelMix(days = 30) {
  const auth = await authHeaders();
  return apiFetch<{ items: Array<{ channel: string; count: number }> }>(`/dashboard/channel-mix?days=${days}`, auth);
}

export async function fetchBookings(params: Record<string, string | number | undefined> = {}) {
  const auth = await authHeaders();
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) query.set(k, String(v));
  }
  return apiFetch<{ items: BookingData[]; total: number; page: number; pageSize: number }>(`/bookings?${query}`, auth);
}

export async function fetchBookingById(id: string) {
  const auth = await authHeaders();
  return apiFetch<BookingData>(`/bookings/${id}`, auth);
}

export async function createBooking(body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPost<BookingData>(`/bookings`, body, auth.token);
}

export async function updateBookingStatus(id: string, status: string) {
  const auth = await authHeaders();
  return apiPatch<BookingData>(`/bookings/${id}/status`, { status }, auth.token);
}

export async function deleteBooking(id: string) {
  const auth = await authHeaders();
  await apiDelete(`/bookings/${id}`, auth.token);
}

export async function fetchCustomers(params: Record<string, string | undefined> = {}) {
  const auth = await authHeaders();
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) query.set(k, v);
  }
  return apiFetch<{ items: CustomerData[]; total: number; page: number; pageSize: number }>(`/customers?${query}`, auth);
}

export async function fetchCustomerById(id: string) {
  const auth = await authHeaders();
  return apiFetch<{ customer: CustomerData; stats: Record<string, unknown>; bookings: BookingData[]; entitlements: Array<Record<string, unknown>> }>(`/customers/${id}`, auth);
}

export async function createCustomer(body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPost<CustomerData>(`/customers`, body, auth.token);
}

export async function updateCustomer(id: string, body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPut<CustomerData>(`/customers/${id}`, body, auth.token);
}

export async function deactivateCustomer(id: string) {
  const auth = await authHeaders();
  return apiPost(`/customers/${id}/deactivate`, {}, auth.token);
}

export async function activateCustomer(id: string) {
  const auth = await authHeaders();
  return apiPost(`/customers/${id}/activate`, {}, auth.token);
}

export async function fetchEmployees(role?: string) {
  const auth = await authHeaders();
  const query = role ? `?role=${role}` : "";
  return apiFetch<{ items: EmployeeData[] }>(`/employees${query}`, auth);
}

export async function fetchEmployeeById(id: string) {
  const auth = await authHeaders();
  return apiFetch<{ employee: EmployeeData; shifts: Array<{ day: number; from: string; to: string }>; stats: Record<string, unknown> }>(`/employees/${id}`, auth);
}

export async function createEmployee(body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPost<EmployeeData>(`/employees`, body, auth.token);
}

export async function updateEmployee(id: string, body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPut<EmployeeData>(`/employees/${id}`, body, auth.token);
}

export async function deactivateEmployee(id: string) {
  const auth = await authHeaders();
  return apiPost(`/employees/${id}/deactivate`, {}, auth.token);
}

export async function deleteEmployee(id: string) {
  const auth = await authHeaders();
  await apiDelete(`/employees/${id}`, auth.token);
}

export async function fetchServices(category?: string) {
  const auth = await authHeaders();
  const query = category ? `?category=${category}` : "";
  return apiFetch<{ items: ServiceData[] }>(`/catalog/services${query}`, auth);
}

export async function createService(body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPost<ServiceData>(`/catalog/services`, body, auth.token);
}

export async function updateService(id: string, body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPut<ServiceData>(`/catalog/services/${id}`, body, auth.token);
}

export async function deleteService(id: string) {
  const auth = await authHeaders();
  await apiDelete(`/catalog/services/${id}`, auth.token);
}

export async function fetchPackages() {
  const auth = await authHeaders();
  return apiFetch<{ items: PackageData[] }>(`/catalog/packages`, auth);
}

export async function createPackage(body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPost<PackageData>(`/catalog/packages`, body, auth.token);
}

export async function updatePackage(id: string, body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPut<PackageData>(`/catalog/packages/${id}`, body, auth.token);
}

export async function deletePackage(id: string) {
  const auth = await authHeaders();
  await apiDelete(`/catalog/packages/${id}`, auth.token);
}

export async function fetchOffers() {
  const auth = await authHeaders();
  return apiFetch<{ items: OfferData[] }>(`/catalog/offers`, auth);
}

export async function createOffer(body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPost<OfferData>(`/catalog/offers`, body, auth.token);
}

export async function updateOffer(id: string, body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPut<OfferData>(`/catalog/offers/${id}`, body, auth.token);
}

export async function deleteOffer(id: string) {
  const auth = await authHeaders();
  await apiDelete(`/catalog/offers/${id}`, auth.token);
}

export interface SessionRecordData {
  id: string;
  bookingId: string;
  customerId: string;
  serviceId: string;
  employeeId: string;
  performedAt: string;
  areas: string[];
  parametersJson: string;
  outcomeEn: string;
  outcomeAr: string;
  reaction: string;
  satisfaction: number | null;
  nextDueAt: string | null;
  notes: string | null;
  createdAt: string;
  customer: { id: string; nameEn: string; nameAr: string; color: string; initials: string };
  employee: { id: string; nameEn: string; nameAr: string; color: string; initials: string };
  service: { id: string; nameEn: string; nameAr: string };
}

export async function fetchSessions(params: Record<string, string | undefined> = {}) {
  const auth = await authHeaders();
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) query.set(k, v);
  }
  return apiFetch<{ items: SessionRecordData[]; total: number; page: number; pageSize: number }>(`/sessions?${query}`, auth);
}

export async function createSession(body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPost<SessionRecordData>(`/sessions`, body, auth.token);
}

export async function updateSession(id: string, body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPut<SessionRecordData>(`/sessions/${id}`, body, auth.token);
}

export async function deleteSession(id: string) {
  const auth = await authHeaders();
  await apiDelete(`/sessions/${id}`, auth.token);
}

export async function fetchPayments(params: Record<string, string | number | undefined> = {}) {
  const auth = await authHeaders();
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) query.set(k, String(v));
  }
  return apiFetch<{ items: PaymentData[]; total: number; totalAmount: number; totalFees: number; page: number; pageSize: number }>(`/billing/payments?${query}`, auth);
}

export async function fetchOutstanding() {
  const auth = await authHeaders();
  return apiFetch<{ items: Array<Record<string, unknown>> }>(`/billing/outstanding`, auth);
}

export async function fetchPayouts() {
  const auth = await authHeaders();
  return apiFetch<{ items: PayoutData[] }>(`/billing/payouts`, auth);
}

export async function fetchMethodMix(days = 30) {
  const auth = await authHeaders();
  return apiFetch<{ items: Array<{ method: string; amount: number }> }>(`/billing/method-mix?days=${days}`, auth);
}

export async function fetchSettings() {
  const auth = await authHeaders();
  return apiFetch<ClinicData>(`/settings`, auth);
}

export async function updateSettingsProfile(body: Record<string, unknown>) {
  const auth = await authHeaders();
  await apiPut(`/settings/profile`, body, auth.token);
}

export async function updateSettingsHours(body: Array<{ day: number; open: string | null; close: string | null }>) {
  const auth = await authHeaders();
  await apiPut(`/settings/hours`, body, auth.token);
}

export async function createRoom(body: Record<string, unknown>) {
  const auth = await authHeaders();
  return apiPost<{ id: string; nameEn: string; nameAr: string; supports: string[] }>(`/settings/rooms`, body, auth.token);
}

export async function deleteRoom(id: string) {
  const auth = await authHeaders();
  await apiDelete(`/settings/rooms/${id}`, auth.token);
}
