"use client";

import { useEffect, useState } from "react";
import {
  type CustomerReferral,
  useCustomerAuth,
} from "@/components/customer-auth-store";

/**
 * A customer's own referral code, and what it has earned them.
 *
 * 🔴 The earnings figure comes from QuickDash and is never computed here. It is
 * money somebody is owed: a number this page worked out for itself could
 * disagree with what actually gets paid, and the customer would believe the one
 * on screen.
 *
 * ⚠️ A code is created on request, not automatically. Issuing one to everybody
 * who signs in fills the table with codes nobody asked for and makes the
 * referral report meaningless.
 */
export function ReferralPanel() {
  const { createReferral, getReferral, session } = useCustomerAuth();
  const [referral, setReferral] = useState<CustomerReferral | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getReferral()
      .then((value) => {
        if (!cancelled) setReferral(value);
      })
      .catch(() => {
        if (!cancelled) setReferral(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [getReferral, session]);

  if (!session) return null;
  if (loading) return <p className="referral-status">LOADING REFERRAL…</p>;

  const create = async () => {
    setCreating(true);
    try {
      const code = await createReferral();
      setReferral({ code, totalReferrals: 0, totalEarnedCents: 0 });
    } catch {
      // Nothing to say beyond try again: the reason is the server's and telling
      // a customer "409" helps nobody.
    } finally {
      setCreating(false);
    }
  };

  if (!referral) {
    return (
      <section className="referral-panel" aria-label="Referrals">
        <p className="build-label">{"// REFER_A_FRIEND"}</p>
        <p>SHARE A CODE. EARN ON WHAT THEY ORDER.</p>
        <button
          className="cursor-pointer"
          disabled={creating}
          onClick={create}
          type="button"
        >
          {creating ? "CREATING…" : "CREATE MY CODE"}
        </button>
      </section>
    );
  }

  const share =
    typeof window === "undefined"
      ? referral.code
      : `${window.location.origin}/?ref=${encodeURIComponent(referral.code)}`;

  return (
    <section className="referral-panel" aria-label="Referrals">
      <p className="build-label">{"// REFER_A_FRIEND"}</p>
      <p>CODE / {referral.code}</p>
      <p>REFERRALS / {referral.totalReferrals}</p>
      {/* Their money, formatted the way every other total on the site is. */}
      <p>EARNED / ${(referral.totalEarnedCents / 100).toFixed(2)}</p>
      <button
        className="cursor-pointer"
        onClick={() => {
          void navigator.clipboard?.writeText(share);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        type="button"
      >
        {copied ? "COPIED" : "COPY LINK"}
      </button>
    </section>
  );
}
