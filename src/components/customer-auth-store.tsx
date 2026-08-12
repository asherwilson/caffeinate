"use client";

import type {
  QuickCustomerOrderDetail,
  QuickOrder,
} from "@quickengine/quick/browser";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { migrateBrowserValue } from "@/lib/browser-storage";
import { quickDashClient, quickDashConfigured } from "@/lib/quickdash";

type CustomerSession = { email: string; provider: "email" };
type CustomerAuthContextValue = {
  configured: boolean;
  getOrder: (id: string) => Promise<QuickCustomerOrderDetail>;
  listOrders: () => Promise<QuickOrder[]>;
  loading: boolean;
  requestSignInLink: (email: string) => Promise<void>;
  session: CustomerSession | null;
  signOut: () => Promise<void>;
  verifySignInLink: (token: string) => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(
  null,
);
const tokenStorageKey = "caffeinate-quickdash-customer-session";
const legacyTokenStorageKey = "caffeinated-quickdash-customer-session";

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(quickDashConfigured);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(tokenStorageKey);
    setSession(null);
  }, []);

  useEffect(() => {
    if (!quickDashConfigured) return;
    const token = migrateBrowserValue(tokenStorageKey, legacyTokenStorageKey);
    if (!token) {
      setLoading(false);
      return;
    }

    quickDashClient(token)
      .customer.me()
      .then(({ data }) => setSession({ email: data.email, provider: "email" }))
      .catch(clearSession)
      .finally(() => setLoading(false));
  }, [clearSession]);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      configured: quickDashConfigured,
      // 🔴 The only call that carries payment state. An order stays `placed`
      // after a refund, because a refund is not a cancellation, so the money's
      // real status lives on `payment.status` and appears nowhere in the list.
      getOrder: async (id) => {
        const token = window.localStorage.getItem(tokenStorageKey);
        if (!token) throw new Error("Customer sign-in is required.");
        const { data } = await quickDashClient(token).customer.getOrder(id);
        return data;
      },
      listOrders: async () => {
        const token = window.localStorage.getItem(tokenStorageKey);
        if (!token) throw new Error("Customer sign-in is required.");
        const { data } = await quickDashClient(token).customer.listOrders({
          limit: 50,
          direction: "desc",
        });
        return data.items;
      },
      loading,
      requestSignInLink: async (email) => {
        await quickDashClient().customer.requestSignInLink(
          email.trim().toLowerCase(),
          `${window.location.origin}/auth/verify`,
        );
      },
      session,
      signOut: async () => {
        const token = window.localStorage.getItem(tokenStorageKey);
        try {
          if (token) await quickDashClient(token).customer.signOut();
        } finally {
          clearSession();
        }
      },
      verifySignInLink: async (token) => {
        const verified =
          await quickDashClient().customer.verifySignInLink(token);
        window.localStorage.setItem(tokenStorageKey, verified.data.token);
        const profile = await quickDashClient(
          verified.data.token,
        ).customer.me();
        setSession({ email: profile.data.email, provider: "email" });
      },
    }),
    [clearSession, loading, session],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used inside CustomerAuthProvider");
  }
  return context;
}
