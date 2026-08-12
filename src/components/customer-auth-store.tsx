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

export type CustomerConversation = {
  id: string;
  subject: string;
  status: "open" | "closed";
  lastMessageAt: string;
};

export type CustomerMessage = {
  id: string;
  sender: "customer" | "operator" | "system";
  body: string;
  createdAt: string;
};

/**
 * Read a thread's messages, which the published types do not describe.
 *
 * `getMessage` returns `messages: unknown[]` in `@quickengine/quick@0.1.0`, so
 * the shape has to be recovered here. Same lag as `providerAccountId` and the
 * order money fields: refine at runtime, and drop anything that does not match
 * rather than render a half-read message.
 */
const readMessages = (value: unknown): CustomerMessage[] =>
  Array.isArray(value)
    ? value.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const row = entry as Record<string, unknown>;
        return typeof row.id === "string" && typeof row.body === "string"
          ? [
              {
                id: row.id,
                sender:
                  row.sender === "operator" || row.sender === "system"
                    ? row.sender
                    : "customer",
                body: row.body,
                createdAt:
                  typeof row.createdAt === "string" ? row.createdAt : "",
              },
            ]
          : [];
      })
    : [];

type CustomerAuthContextValue = {
  configured: boolean;
  createMessage: (subject: string, body: string) => Promise<void>;
  getMessage: (id: string) => Promise<CustomerMessage[]>;
  getOrder: (id: string) => Promise<QuickCustomerOrderDetail>;
  listMessages: () => Promise<CustomerConversation[]>;
  listOrders: () => Promise<QuickOrder[]>;
  loading: boolean;
  replyToMessage: (id: string, body: string) => Promise<void>;
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
      createMessage: async (subject, body) => {
        const token = window.localStorage.getItem(tokenStorageKey);
        if (!token) throw new Error("Customer sign-in is required.");
        await quickDashClient(token).customer.createMessage(subject, body);
      },
      getMessage: async (id) => {
        const token = window.localStorage.getItem(tokenStorageKey);
        if (!token) throw new Error("Customer sign-in is required.");
        const { data } = await quickDashClient(token).customer.getMessage(id);
        return readMessages(data.messages);
      },
      // 🔴 The only call that carries payment state. An order stays `placed`
      // after a refund, because a refund is not a cancellation, so the money's
      // real status lives on `payment.status` and appears nowhere in the list.
      getOrder: async (id) => {
        const token = window.localStorage.getItem(tokenStorageKey);
        if (!token) throw new Error("Customer sign-in is required.");
        const { data } = await quickDashClient(token).customer.getOrder(id);
        return data;
      },
      listMessages: async () => {
        const token = window.localStorage.getItem(tokenStorageKey);
        if (!token) throw new Error("Customer sign-in is required.");
        const { data } = await quickDashClient(token).customer.listMessages();
        return data.items.map((item) => ({
          id: item.id,
          subject: item.subject,
          status: item.status,
          lastMessageAt: item.lastMessageAt,
        }));
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
      replyToMessage: async (id, body) => {
        const token = window.localStorage.getItem(tokenStorageKey);
        if (!token) throw new Error("Customer sign-in is required.");
        await quickDashClient(token).customer.replyToMessage(id, body);
      },
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
