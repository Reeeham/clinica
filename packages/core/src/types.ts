/**
 * Clinica domain model.
 *
 * Money is always stored as an integer number of piastres (1 EGP = 100 piastres)
 * so that percentage maths (the 2% platform fee) never drifts.
 */

export type Locale = "en" | "ar";

export interface Localized {
  en: string;
  ar: string;
}

/** Integer piastres. Use `egp(1500)` to build one. */
export type Piastres = number;

export type ISODate = string;

/* ------------------------------------------------------------------ tenants */

export type ServiceCategory =
  | "laser"
  | "skin"
  | "injectables"
  | "body"
  | "hair"
  | "nails"
  | "consultation";

export interface OpeningHours {
  /** 0 = Sunday */
  day: number;
  open: string | null;
  close: string | null;
}

export interface Clinic {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  about: Localized;
  city: Localized;
  area: Localized;
  address: Localized;
  lat: number;
  lng: number;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  /** Tailwind-friendly gradient pair used instead of stock photography. */
  palette: [string, string];
  hours: OpeningHours[];
  amenities: Localized[];
  specialties: ServiceCategory[];
  plan: "starter" | "growth" | "enterprise";
}

export interface Room {
  id: string;
  clinicId: string;
  name: Localized;
  supports: ServiceCategory[];
}

/* ---------------------------------------------------------------- employees */

export type EmployeeRole =
  | "owner"
  | "manager"
  | "receptionist"
  | "doctor"
  | "therapist";

export type EmployeeStatus = "active" | "on_leave" | "inactive";

export interface Shift {
  /** 0 = Sunday */
  day: number;
  from: string;
  to: string;
}

export interface Employee {
  id: string;
  clinicId: string;
  name: Localized;
  role: EmployeeRole;
  title: Localized;
  phone: string;
  email: string;
  status: EmployeeStatus;
  hiredAt: ISODate;
  /** Monthly base salary. */
  salary: Piastres;
  /** Share of every service they perform, 0–1. */
  commissionRate: number;
  specialties: ServiceCategory[];
  color: string;
  initials: string;
  rating: number;
  shifts: Shift[];
  canLogin: boolean;
}

/* ------------------------------------------------------------------ catalog */

export interface Service {
  id: string;
  clinicId: string;
  name: Localized;
  category: ServiceCategory;
  description: Localized;
  durationMin: number;
  price: Piastres;
  /** Typical number of sessions for a full course — shown in the mobile app. */
  recommendedSessions: number;
  device: string | null;
  requiresDoctor: boolean;
  aftercare: Localized;
  published: boolean;
  /** Bookings in the last 30 days — drives "popular" sorting. */
  demand30d: number;
}

export interface PackageItem {
  serviceId: string;
  sessions: number;
}

export interface Package {
  id: string;
  clinicId: string;
  name: Localized;
  description: Localized;
  items: PackageItem[];
  price: Piastres;
  /** Sum of à-la-carte prices, used to display savings. */
  listPrice: Piastres;
  validityDays: number;
  published: boolean;
  featured: boolean;
  soldCount: number;
}

export type OfferKind = "percent" | "amount" | "free_session";

export interface Offer {
  id: string;
  clinicId: string;
  title: Localized;
  description: Localized;
  kind: OfferKind;
  /** Percent (0–100) for `percent`, piastres for `amount`, sessions for `free_session`. */
  value: number;
  code: string;
  scope: { kind: "all" } | { kind: "services"; ids: string[] } | { kind: "packages"; ids: string[] };
  startsAt: ISODate;
  endsAt: ISODate;
  usageLimit: number | null;
  usedCount: number;
  published: boolean;
}

/* ---------------------------------------------------------------- customers */

export type SkinType = "I" | "II" | "III" | "IV" | "V" | "VI";
export type CustomerSource = "app" | "walk_in" | "instagram" | "referral" | "phone";

export interface Customer {
  id: string;
  clinicId: string;
  name: Localized;
  phone: string;
  email: string | null;
  gender: "female" | "male";
  birthDate: ISODate | null;
  skinType: SkinType | null;
  allergies: string[];
  conditions: string[];
  notes: string | null;
  tags: string[];
  source: CustomerSource;
  createdAt: ISODate;
  color: string;
  initials: string;
  /** Marketing consent — required before WhatsApp campaigns. */
  marketingOptIn: boolean;
}

export type EntitlementStatus = "active" | "completed" | "expired" | "frozen";

/** A package a customer has bought; tracks the remaining session balance. */
export interface Entitlement {
  id: string;
  clinicId: string;
  customerId: string;
  packageId: string;
  purchasedAt: ISODate;
  expiresAt: ISODate;
  status: EntitlementStatus;
  /** Remaining sessions per service. */
  balance: { serviceId: string; total: number; used: number }[];
}

/* ----------------------------------------------------------------- bookings */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "no_show"
  | "cancelled";

export type BookingChannel = "app" | "walk_in" | "phone" | "instagram";

export interface Booking {
  id: string;
  ref: string;
  clinicId: string;
  customerId: string;
  employeeId: string;
  roomId: string;
  serviceId: string;
  /** Set when the session is drawn from a purchased package. */
  entitlementId: string | null;
  startsAt: ISODate;
  endsAt: ISODate;
  status: BookingStatus;
  channel: BookingChannel;
  price: Piastres;
  notes: string | null;
  createdAt: ISODate;
  /** e.g. 3 of 6 in a laser course. */
  sessionNumber: number | null;
  sessionTotal: number | null;
}

/** The clinical record written after a session is performed. */
export interface SessionRecord {
  id: string;
  clinicId: string;
  bookingId: string;
  customerId: string;
  serviceId: string;
  employeeId: string;
  performedAt: ISODate;
  areas: string[];
  /** Free-form device parameters, e.g. { fluence: "14 J/cm²" }. */
  parameters: Record<string, string>;
  outcome: Localized;
  reaction: "none" | "mild_erythema" | "swelling" | "other";
  satisfaction: 1 | 2 | 3 | 4 | 5 | null;
  nextDueAt: ISODate | null;
  notes: string | null;
}

/* ------------------------------------------------------- orders & payments */

export type OrderStatus = "open" | "partially_paid" | "paid" | "refunded" | "void";

export type OrderLineKind = "service" | "package" | "product";

export interface OrderLine {
  id: string;
  kind: OrderLineKind;
  refId: string;
  name: Localized;
  qty: number;
  unitPrice: Piastres;
}

export interface Order {
  id: string;
  ref: string;
  clinicId: string;
  customerId: string;
  bookingId: string | null;
  lines: OrderLine[];
  discount: Piastres;
  offerCode: string | null;
  status: OrderStatus;
  createdAt: ISODate;
  createdBy: string;
}

export type PaymentMethod = "cash" | "card" | "instapay" | "wallet" | "app_online";
export type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  ref: string;
  clinicId: string;
  orderId: string;
  customerId: string;
  amount: Piastres;
  method: PaymentMethod;
  status: PaymentStatus;
  /** Clinica's cut. Only charged on payments collected through the mobile app. */
  platformFee: Piastres;
  netToClinic: Piastres;
  paidAt: ISODate;
  /** Gateway / receipt reference. */
  gatewayRef: string | null;
  payoutId: string | null;
}

export interface Payout {
  id: string;
  clinicId: string;
  periodStart: ISODate;
  periodEnd: ISODate;
  gross: Piastres;
  fees: Piastres;
  net: Piastres;
  status: "scheduled" | "processing" | "paid";
  expectedAt: ISODate;
}

/* ------------------------------------------------------------------ reviews */

export interface Review {
  id: string;
  clinicId: string;
  customerId: string;
  serviceId: string;
  rating: number;
  body: Localized;
  createdAt: ISODate;
  reply: Localized | null;
}
