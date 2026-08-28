import { cache } from "react";
import {
  fetchDashboardOverview,
  fetchToday,
  fetchUpcoming,
  fetchRevenueSeries,
  fetchTopServices,
  fetchChannelMix,
  fetchBookings,
  fetchCustomers,
  fetchEmployees,
  fetchServices,
  fetchPackages,
  fetchOffers,
  fetchPayments,
  fetchOutstanding,
  fetchPayouts,
  fetchMethodMix,
  fetchSettings,
  fetchCustomerById,
  fetchEmployeeById,
  fetchSessions,
  type BookingData,
  type CustomerData,
  type EmployeeData,
  type ServiceData,
  type PackageData,
  type OfferData,
  type PaymentData,
  type PayoutData,
  type SessionRecordData,
  type ClinicData,
} from "./api";

// These adapters bridge the API responses to the shapes the UI components expect.
// This allows us to keep the existing UI while data comes from the real backend.
// Wrapped in React cache() so duplicate calls within the same request pass
// (e.g. layout + page both calling getCustomers) only hit the API once.

export const getOverview = cache(async () => {
  try {
    return await fetchDashboardOverview(30);
  } catch {
    return null;
  }
});

export const getTodaySnapshot = cache(async () => {
  try {
    return await fetchToday();
  } catch {
    return null;
  }
});

export const getUpcomingBookings = cache(async (limit = 6) => {
  try {
    const data = await fetchUpcoming(limit);
    return data.items;
  } catch {
    return [];
  }
});

export const getRevenueSeries = cache(async (days = 30) => {
  try {
    return await fetchRevenueSeries(days);
  } catch {
    return { items: [] };
  }
});

export const getTopServices = cache(async (days = 30, limit = 5) => {
  try {
    return await fetchTopServices(days, limit);
  } catch {
    return { items: [] };
  }
});

export const getChannelMix = cache(async (days = 30) => {
  try {
    return await fetchChannelMix(days);
  } catch {
    return { items: [] };
  }
});

export const getBookings = cache(async (params: Record<string, string | number | undefined> = {}) => {
  try {
    return await fetchBookings(params);
  } catch {
    return { items: [] as BookingData[], total: 0, page: 1, pageSize: 50 };
  }
});

export const getCustomers = cache(async (params: Record<string, string | undefined> = {}) => {
  try {
    return await fetchCustomers(params);
  } catch {
    return { items: [] as CustomerData[], total: 0, page: 1, pageSize: 50 };
  }
});

export const getEmployees = cache(async (role?: string) => {
  try {
    return await fetchEmployees(role);
  } catch {
    return { items: [] as EmployeeData[] };
  }
});

export const getServices = cache(async (category?: string) => {
  try {
    return await fetchServices(category);
  } catch {
    return { items: [] as ServiceData[] };
  }
});

export const getPackages = cache(async () => {
  try {
    return await fetchPackages();
  } catch {
    return { items: [] as PackageData[] };
  }
});

export const getOffers = cache(async () => {
  try {
    return await fetchOffers();
  } catch {
    return { items: [] as OfferData[] };
  }
});

export const getPayments = cache(async (params: Record<string, string | number | undefined> = {}) => {
  try {
    return await fetchPayments(params);
  } catch {
    return { items: [] as PaymentData[], total: 0, totalAmount: 0, totalFees: 0, page: 1, pageSize: 50 };
  }
});

export const getOutstanding = cache(async () => {
  try {
    return await fetchOutstanding();
  } catch {
    return { items: [] };
  }
});

export const getPayouts = cache(async () => {
  try {
    return await fetchPayouts();
  } catch {
    return { items: [] as PayoutData[] };
  }
});

export const getMethodMix = cache(async (days = 30) => {
  try {
    return await fetchMethodMix(days);
  } catch {
    return { items: [] };
  }
});

export const getClinicSettings = cache(async () => {
  try {
    return await fetchSettings();
  } catch {
    return null;
  }
});

export const getCustomerDetail = cache(async (id: string) => {
  try {
    return await fetchCustomerById(id);
  } catch {
    return null;
  }
});

export const getEmployeeDetail = cache(async (id: string) => {
  try {
    return await fetchEmployeeById(id);
  } catch {
    return null;
  }
});

export const getSessions = cache(async (params: Record<string, string | undefined> = {}) => {
  try {
    return await fetchSessions(params);
  } catch {
    return { items: [] as SessionRecordData[], total: 0, page: 1, pageSize: 50 };
  }
});

export type {
  BookingData,
  CustomerData,
  EmployeeData,
  ServiceData,
  PackageData,
  OfferData,
  PaymentData,
  PayoutData,
  ClinicData,
};
