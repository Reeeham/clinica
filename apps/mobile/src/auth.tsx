import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  getToken,
  setToken,
  clearToken,
  getStoredCustomer,
  setStoredCustomer,
  type StoredCustomer,
} from "./api";

interface AuthState {
  customer: StoredCustomer | null;
  loading: boolean;
  signIn: (token: string, customer: StoredCustomer) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<StoredCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const stored = await getStoredCustomer();
      if (token && stored) setCustomer(stored);
      setLoading(false);
    })();
  }, []);

  const signIn = async (token: string, c: StoredCustomer) => {
    await setToken(token);
    await setStoredCustomer(c);
    setCustomer(c);
  };

  const signOut = async () => {
    await clearToken();
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ customer, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
