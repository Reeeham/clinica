"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TOKEN_COOKIE = "clinica_token";

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

export async function setToken(token: string) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearToken() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100/api"}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Login failed" }));
      return { error: data.error ?? "Login failed" };
    }

    const data = await res.json();
    await setToken(data.token);
  } catch {
    return { error: "Unable to connect to the server" };
  }

  redirect("/");
}

export async function logoutAction() {
  await clearToken();
  redirect("/login");
}

export async function demoLoginAction() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100/api"}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "owner@nour-aesthetics.com", password: "demo1234" }),
      },
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Demo login failed" }));
      return { error: data.error ?? "Demo login failed" };
    }

    const data = await res.json();
    await setToken(data.token);
  } catch {
    return { error: "Unable to connect to the server" };
  }

  redirect("/");
}
