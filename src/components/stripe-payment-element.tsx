"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { type FormEvent, useMemo, useState } from "react";

type StripePaymentElementProps = {
  amountLabel: string;
  clientSecret: string;
  onConfirmed: () => void;
  providerAccountId: string;
};

type ConfirmationFormProps = Pick<
  StripePaymentElementProps,
  "amountLabel" | "onConfirmed"
>;

function ConfirmationForm({ amountLabel, onConfirmed }: ConfirmationFormProps) {
  const elements = useElements();
  const stripe = useStripe();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

    setError(null);
    setSubmitting(true);
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/checkout/complete`,
      },
    });

    if (result.error) {
      setError(
        result.error.message ??
          "Stripe could not confirm this card. Check the details and try again.",
      );
      setSubmitting(false);
      return;
    }

    if (
      result.paymentIntent?.status === "succeeded" ||
      result.paymentIntent?.status === "processing"
    ) {
      onConfirmed();
      return;
    }

    setError("Payment needs another action before it can be confirmed.");
    setSubmitting(false);
  };

  return (
    <form className="stripe-payment-form" onSubmit={confirm}>
      <PaymentElement options={{ layout: "tabs" }} />
      {error ? (
        <p aria-live="polite" className="stripe-payment-error" role="alert">
          {error.toUpperCase()}
        </p>
      ) : null}
      <div className="checkout-actions">
        <button
          className="cursor-pointer"
          disabled={!stripe || !elements || submitting}
          type="submit"
        >
          {submitting ? "CONFIRMING PAYMENT..." : `PAY ${amountLabel}`}
        </button>
      </div>
    </form>
  );
}

export function StripePaymentElement({
  amountLabel,
  clientSecret,
  onConfirmed,
  providerAccountId,
}: StripePaymentElementProps) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripe = useMemo(
    () =>
      publishableKey
        ? loadStripe(publishableKey, { stripeAccount: providerAccountId })
        : null,
    [providerAccountId, publishableKey],
  );

  if (!stripe) {
    return (
      <p aria-live="polite" className="stripe-payment-error" role="alert">
        STRIPE CHECKOUT IS NOT CONFIGURED FOR THIS STOREFRONT.
      </p>
    );
  }

  return (
    <div className="stripe-payment-shell">
      <Elements
        options={{
          clientSecret,
          appearance: {
            theme: "flat",
            variables: {
              borderRadius: "0px",
              colorBackground: "#f1eee8",
              colorDanger: "#8b1e1e",
              colorPrimary: "#24211e",
              colorText: "#1c1a18",
              fontFamily: '"JetBrains Mono", monospace',
              spacingGridRow: "16px",
            },
          },
        }}
        stripe={stripe}
      >
        <ConfirmationForm amountLabel={amountLabel} onConfirmed={onConfirmed} />
      </Elements>
    </div>
  );
}
