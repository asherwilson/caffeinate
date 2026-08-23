"use client";

import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/components/customer-auth-store";
import { quickDashClient, quickDashConfigured } from "@/lib/quickdash";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  authorName: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
};

/**
 * What other people thought, and a way to say so.
 *
 * 🔴 Reads `/catalog/:id/reviews`, which is PUBLIC — a shopper deciding whether
 * to buy is exactly who reviews are for, and making them sign in first to read
 * one defeats the point.
 *
 * ⚠️ Called through `client.request` rather than a helper, because the browser
 * SDK has not wrapped these routes yet. The API is the contract; the SDK is a
 * convenience over it, and waiting for the convenience would mean shipping a
 * shop with no reviews.
 *
 * ⚠️ Writing one needs a customer session. A review from nobody is not social
 * proof, it is a comment box.
 */
export function ProductReviews({ catalogItemId }: { catalogItemId: string }) {
  const { createReview, session } = useCustomerAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => {
    if (!quickDashConfigured) return;
    quickDashClient()
      .request<{ items: Review[] }>(
        `/catalog/${encodeURIComponent(catalogItemId)}/reviews`,
      )
      .then(({ data }) => setReviews(data.items ?? []))
      // A review list that fails to load must not take the product page with
      // it. No reviews reads as "nobody has written one", which is survivable.
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: reload when the product changes
  useEffect(load, [catalogItemId]);

  const submit = async () => {
    if (!session) return;
    setSubmitting(true);
    setNotice(null);
    try {
      // Through the auth store, which is the only module that knows where the
      // session token lives. See its note on why.
      const data = await createReview({
        catalogItemId,
        rating,
        body: body.trim() || null,
      });
      setBody("");
      /**
       * ⚠️ Says what actually happened. A review that lands in moderation and
       * reports "posted" leaves somebody refreshing for an hour looking for
       * words that are not going to appear.
       */
      setNotice(
        data.status === "published"
          ? "POSTED."
          : "SUBMITTED / AWAITING MODERATION.",
      );
      load();
    } catch {
      setNotice("THAT DID NOT SEND. TRY AGAIN.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="product-reviews-status">LOADING REVIEWS…</p>;

  return (
    <section className="product-reviews" aria-label="Reviews">
      <p className="build-label">{"// REVIEWS"}</p>

      {reviews.length === 0 ? (
        <p className="product-reviews-status">NO REVIEWS YET.</p>
      ) : (
        <ul className="product-reviews-list">
          {reviews.map((review) => (
            <li key={review.id}>
              <p>
                {"★".repeat(Math.max(0, Math.min(5, review.rating)))}
                {"☆".repeat(Math.max(0, 5 - review.rating))}
                {/*
                 * 🔑 Worth marking. "Verified purchase" is the difference
                 * between a review and an opinion, and QuickDash already knows
                 * which this is.
                 */}
                {review.verifiedPurchase ? " / VERIFIED PURCHASE" : ""}
              </p>
              {review.title ? <p>{review.title}</p> : null}
              {review.body ? <p>{review.body}</p> : null}
              <p>{review.authorName ?? "ANONYMOUS"}</p>
            </li>
          ))}
        </ul>
      )}

      {session ? (
        <div className="product-reviews-form">
          <label htmlFor="review-rating">RATING</label>
          <select
            id="review-rating"
            onChange={(event) => setRating(Number(event.target.value))}
            value={rating}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <label htmlFor="review-body">REVIEW</label>
          <textarea
            id="review-body"
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            value={body}
          />
          <button
            className="cursor-pointer"
            disabled={submitting}
            onClick={submit}
            type="button"
          >
            {submitting ? "SENDING…" : "POST REVIEW"}
          </button>
          {notice ? <p>{notice}</p> : null}
        </div>
      ) : (
        <p className="product-reviews-status">SIGN IN TO LEAVE A REVIEW.</p>
      )}
    </section>
  );
}
