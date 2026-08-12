"use client";

import { type FormEvent, useState } from "react";
import { useCustomerAuth } from "./customer-auth-store";
import { useToast } from "./toast-store";

export function AccountAccess() {
  const { configured, loading, requestSignInLink, session, signOut } =
    useCustomerAuth();
  const { pushToast } = useToast();
  const [pendingEmail, setPendingEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <section className="magic-link-state">
        <p>% auth session --verify</p>
        <h2>CHECKING SIGNAL.</h2>
        <p>QUICKDASH IS VALIDATING THIS CUSTOMER SESSION.</p>
        <p className="powered-by-quickdash">Powered by QuickDash</p>
      </section>
    );
  }

  if (session) {
    return (
      <section className="customer-session">
        <div className="customer-session-heading">
          <p>% session current</p>
          <h2>YOU&apos;RE IN.</h2>
        </div>
        <dl>
          <div>
            <dt>EMAIL</dt>
            <dd>{session.email}</dd>
          </div>
          <div>
            <dt>PROVIDER</dt>
            <dd>EMAIL LINK</dd>
          </div>
          <div>
            <dt>MODE</dt>
            <dd>QUICKDASH CUSTOMER</dd>
          </div>
        </dl>
        <div className="customer-session-actions">
          <a className="cursor-pointer" href="/checkout">
            CONTINUE TO CHECKOUT
          </a>
          <a className="secondary-cta cursor-pointer" href="/account/orders">
            VIEW ORDERS
          </a>
          <a className="secondary-cta cursor-pointer" href="/account/messages">
            MESSAGES
          </a>
          <button
            className="secondary-cta cursor-pointer"
            onClick={async () => {
              await signOut();
              pushToast({
                code: "SESSION",
                message: "CUSTOMER SESSION CLOSED.",
                tone: "info",
              });
            }}
            type="button"
          >
            SIGN OUT
          </button>
        </div>
        <p className="powered-by-quickdash">Powered by QuickDash</p>
      </section>
    );
  }

  if (pendingEmail) {
    return (
      <section className="magic-link-state">
        <p>% auth magic-link --sent</p>
        <h2>CHECK YOUR EMAIL.</h2>
        <p>
          QUICKDASH SENT A ONE-TIME SIGN-IN LINK TO{" "}
          <strong>{pendingEmail}</strong>.
        </p>
        <div className="customer-session-actions">
          <button
            className="secondary-cta cursor-pointer"
            onClick={() => setPendingEmail("")}
            type="button"
          >
            USE A DIFFERENT EMAIL
          </button>
        </div>
        <p className="powered-by-quickdash">Powered by QuickDash</p>
      </section>
    );
  }

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email !== "string" || !email) return;

    setSubmitting(true);
    try {
      await requestSignInLink(email);
      setPendingEmail(email);
      pushToast({
        code: "MAGIC_LINK",
        message: "SIGN-IN LINK REQUESTED.",
        tone: "success",
      });
    } catch (error) {
      pushToast({
        code: "AUTH_ERROR",
        message:
          error instanceof Error ? error.message : "SIGN-IN LINK FAILED.",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="passwordless-access">
      <form className="auth-form" onSubmit={submitEmail}>
        <p>% auth request --method=email</p>
        <label htmlFor="account-email">EMAIL</label>
        <input
          autoComplete="email"
          disabled={!configured || submitting}
          id="account-email"
          name="email"
          placeholder="YOU@EXAMPLE.COM"
          required
          type="email"
        />
        <button
          className="cursor-pointer"
          disabled={!configured || submitting}
          type="submit"
        >
          {submitting ? "REQUESTING LINK..." : "EMAIL ME A SIGN-IN LINK"}
        </button>
      </form>
      <div className="auth-divider">
        <span>OR</span>
      </div>
      <div className="oauth-access">
        <button className="secondary-cta cursor-pointer" disabled type="button">
          CONTINUE WITH GOOGLE / SOON
        </button>
        <p>
          NEW HERE? VERIFYING YOUR EMAIL CREATES YOUR CUSTOMER ACCOUNT
          AUTOMATICALLY. GUEST CHECKOUT REMAINS AVAILABLE.
        </p>
        {!configured && (
          <p className="local-auth-warning">
            QUICKDASH CONNECTION REQUIRED / ADD THE LOCAL PUBLIC CONFIGURATION
          </p>
        )}
      </div>
      <p className="powered-by-quickdash">Powered by QuickDash</p>
    </div>
  );
}
