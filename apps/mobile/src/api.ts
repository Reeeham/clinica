import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

function resolveApiBase(): string {
  const explicit = Constants.expoConfig?.extra?.apiUrl;
  if (explicit) return explicit;

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // Auto-detect host from Expo debugger URL (e.g. exp://192.168.x.x:8081)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:5100/api`;
    }
  }

  return "http://localhost:5100/api";
}

const API_BASE = resolveApiBase();

const TOKEN_KEY = "clinica_token";
const CUSTOMER_KEY = "clinica_customer";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(CUSTOMER_KEY);
}

export async function getStoredCustomer(): Promise<StoredCustomer | null> {
  const raw = await SecureStore.getItemAsync(CUSTOMER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setStoredCustomer(customer: StoredCustomer): Promise<void> {
  await SecureStore.setItemAsync(CUSTOMER_KEY, JSON.stringify(customer));
}

export interface StoredCustomer {
  id: string;
  nameEn: string;
  nameAr: string;
  phone: string;
  email: string | null;
  gender: string;
}

type FetchOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { auth, ...init } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (auth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error ?? `API error: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  auth = false,
): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    auth,
  });
}

export async function apiDelete<T>(path: string, auth = false): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE", auth });
}

// API types
export interface ClinicListItem {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  cityEn: string;
  cityAr: string;
  areaEn: string;
  areaAr: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  palette: string[];
  specialties: string[];
}

export interface ClinicDetail {
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
  lat: number;
  lng: number;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  palette: string[];
  amenitiesEn: string[];
  amenitiesAr: string[];
  specialties: string[];
  hours: { day: number; open: string | null; close: string | null }[];
}

export interface ServiceItem {
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
}

export interface PackageItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  listPrice: number;
  validityDays: number;
  featured: boolean;
  soldCount: number;
}

export interface OfferItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  kind: string;
  value: number;
  code: string;
  endsAt: string;
}

export interface MyBooking {
  id: string;
  ref: string;
  startsAt: string;
  endsAt: string;
  status: string;
  channel: string;
  price: number;
  sessionNumber: number | null;
  sessionTotal: number | null;
  service: { id: string; nameEn: string; nameAr: string; durationMin: number };
  employee: { id: string; nameEn: string; nameAr: string; color: string; initials: string };
}

export interface EmployeeItem {
  id: string;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  role: string;
  specialties: string[];
  color: string;
  initials: string;
  rating: number;
}

export interface ReviewItem {
  id: string;
  rating: number;
  bodyEn: string;
  bodyAr: string;
  replyEn: string | null;
  replyAr: string | null;
  createdAt: string;
}

// API functions
export const DEFAULT_CLINIC_ID = "a1b2c3d4-0000-0000-0000-000000000001";

export const api = {
  // Public clinic endpoints
  listClinics: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch<{ items: ClinicListItem[]; total: number }>(
      `/public/clinics?${query}`,
    );
  },

  getClinic: (slug: string) =>
    apiFetch<{ clinic: ClinicDetail; services: ServiceItem[]; packages: PackageItem[]; offers: OfferItem[]; reviews: ReviewItem[] }>(
      `/public/clinics/${slug}`,
    ),

  getServices: (slug: string, category?: string) => {
    const query = category ? `?category=${category}` : "";
    return apiFetch<{ items: ServiceItem[] }>(`/public/clinics/${slug}/services${query}`);
  },

  getPackages: (slug: string) =>
    apiFetch<{ items: PackageItem[] }>(`/public/clinics/${slug}/packages`),

  getOffers: (slug: string) =>
    apiFetch<{ items: OfferItem[] }>(`/public/clinics/${slug}/offers`),

  getEmployees: (slug: string, category?: string) => {
    const query = category ? `?category=${category}` : "";
    return apiFetch<{ items: EmployeeItem[] }>(`/public/clinics/${slug}/employees${query}`);
  },

  getReviews: (slug: string) =>
    apiFetch<{ items: ReviewItem[]; total: number }>(`/public/clinics/${slug}/reviews`),

  // Customer auth
  register: (body: { clinicId: string; nameEn: string; nameAr?: string; phone: string; email?: string; gender?: string; marketingOptIn: boolean }) =>
    apiPost<{ token: string; customer: StoredCustomer }>("/public/customerauth/register", body),

  login: (body: { clinicId: string; phone: string }) =>
    apiPost<{ token: string; customer: StoredCustomer }>("/public/customerauth/login", body),

  getMe: () =>
    apiFetch<{
      customer: StoredCustomer & { birthDate: string | null; skinType: string | null; allergies: string[]; conditions: string[]; tags: string[]; marketingOptIn: boolean };
      bookings: Array<{ id: string; ref: string; startsAt: string; endsAt: string; status: string; channel: string; price: number }>;
      entitlements: Array<{ id: string; packageId: string; status: string; purchasedAt: string; expiresAt: string }>;
    }>("/public/customerauth/me", { auth: true }),

  // Customer bookings
  myBookings: (page = 1) =>
    apiFetch<{ items: MyBooking[]; total: number }>(`/public/bookings?page=${page}`, { auth: true }),

  createBooking: (body: { serviceId: string; employeeId: string; startsAt: string; notes?: string }) =>
    apiPost<{ id: string; ref: string; startsAt: string; endsAt: string; status: string; price: number }>(
      "/public/bookings", body, true,
    ),

  cancelBooking: (id: string) =>
    apiDelete(`/public/bookings/${id}`, true),
};
