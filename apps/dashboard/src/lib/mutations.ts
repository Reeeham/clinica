"use server";

import { revalidatePath } from "next/cache";
import { getToken } from "./auth-actions";
import { apiPost, apiPut, apiPatch, apiDelete, apiFetch } from "./api-client";
import type { CustomerData } from "./api";

async function authToken(): Promise<string | undefined> {
  const token = await getToken();
  return token ?? undefined;
}

// ── Customer search (for combobox in booking form) ──

export async function searchCustomersAction(query: string) {
  const token = await authToken();
  try {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    params.set("pageSize", "10");
    const data = await apiFetch<{ items: CustomerData[]; total: number }>(`/customers?${params}`, { token });
    return { ok: true as const, items: data.items };
  } catch (e: any) {
    return { ok: false as const, error: e.message ?? "Failed to search customers", items: [] as CustomerData[] };
  }
}

// ── Customers ──

export async function createCustomerAction(body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPost(`/customers`, body, token);
    revalidatePath("/customers");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to create customer" };
  }
}

// ── Bookings ──

export async function createBookingAction(body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPost(`/bookings`, body, token);
    revalidatePath("/bookings");
    revalidatePath("/schedule");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to create booking" };
  }
}

// ── Employees ──

export async function createEmployeeAction(body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPost(`/employees`, body, token);
    revalidatePath("/team");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to create staff member" };
  }
}

// ── Services ──

export async function createServiceAction(body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPost(`/catalog/services`, body, token);
    revalidatePath("/catalog");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to create service" };
  }
}

export async function updateServiceAction(id: string, body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPut(`/catalog/services/${id}`, body, token);
    revalidatePath("/catalog");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to update service" };
  }
}

export async function deleteServiceAction(id: string) {
  const token = await authToken();
  try {
    await apiDelete(`/catalog/services/${id}`, token);
    revalidatePath("/catalog");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to delete service" };
  }
}

// ── Packages ──

export async function createPackageAction(body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPost(`/catalog/packages`, body, token);
    revalidatePath("/catalog");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to create package" };
  }
}

export async function updatePackageAction(id: string, body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPut(`/catalog/packages/${id}`, body, token);
    revalidatePath("/catalog");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to update package" };
  }
}

export async function deletePackageAction(id: string) {
  const token = await authToken();
  try {
    await apiDelete(`/catalog/packages/${id}`, token);
    revalidatePath("/catalog");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to delete package" };
  }
}

// ── Offers ──

export async function createOfferAction(body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPost(`/catalog/offers`, body, token);
    revalidatePath("/catalog");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to create offer" };
  }
}

export async function updateOfferAction(id: string, body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPut(`/catalog/offers/${id}`, body, token);
    revalidatePath("/catalog");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to update offer" };
  }
}

export async function deleteOfferAction(id: string) {
  const token = await authToken();
  try {
    await apiDelete(`/catalog/offers/${id}`, token);
    revalidatePath("/catalog");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to delete offer" };
  }
}

// ── Sessions ──

export async function createSessionAction(body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPost(`/sessions`, body, token);
    revalidatePath("/sessions");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to create session" };
  }
}

export async function updateSessionAction(id: string, body: Record<string, unknown>) {
  const token = await authToken();
  try {
    await apiPut(`/sessions/${id}`, body, token);
    revalidatePath("/sessions");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to update session" };
  }
}

export async function deleteSessionAction(id: string) {
  const token = await authToken();
  try {
    await apiDelete(`/sessions/${id}`, token);
    revalidatePath("/sessions");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? "Failed to delete session" };
  }
}
