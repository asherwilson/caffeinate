"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCustomerAuth } from "./customer-auth-store";

export function AuthVerify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifySignInLink } = useCustomerAuth();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = searchParams.get("token");
    if (!token) {
      setError("THE SIGN-IN LINK IS MISSING ITS TOKEN.");
      return;
    }

    verifySignInLink(token)
      .then(() => router.replace("/account"))
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error
            ? reason.message.toUpperCase()
            : "THIS SIGN-IN LINK COULD NOT BE VERIFIED.",
        );
      });
  }, [router, searchParams, verifySignInLink]);

  return (
    <section className="magic-link-state">
      <p>% auth verify --one-time</p>
      <h2>{error ? "LINK REJECTED." : "VERIFYING SIGNAL."}</h2>
      <p>{error || "QUICKDASH IS OPENING YOUR CUSTOMER SESSION."}</p>
      {error && (
        <a className="secondary-cta cursor-pointer" href="/account">
          REQUEST A NEW LINK
        </a>
      )}
      <p className="powered-by-quickdash">Powered by QuickDash</p>
    </section>
  );
}
