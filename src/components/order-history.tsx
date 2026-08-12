"use client";

import type {
  QuickCustomerOrderDetail,
  QuickOrder,
} from "@quickengine/quick/browser";
import { useEffect, useState } from "react";
import { useCustomerAuth } from "./customer-auth-store";

const money = (cents: number) => (cents / 100).toFixed(2);

/**
 * Read a cents field the published types do not declare.
 *
 * `QuickOrder` in `@quickengine/quick@0.1.0` types `subtotalCents` and
 * `totalCents` but not `discountCents`, `shippingCents` or `taxCents`, so those
 * arrive through its index signature as `unknown` even though the API returns
 * them. Same lag as `providerAccountId` in checkout, handled the same way:
 * refine at runtime rather than assert, and simply omit a line we cannot read.
 */
const cents = (value: unknown): number | null =>
  typeof value === "number" ? value : null;

/**
 * One order, opened.
 *
 * 🔴 The only place a customer learns they were refunded. An order stays
 * `placed` after a refund, because a refund is not a cancellation, so the money
 * lives on `payment.status` and never appears in the log above. Before this,
 * a fully refunded order read `PLACED` and said nothing about the money coming
 * back.
 */
function OrderDetail({ id }: { id: string }) {
  const { getOrder } = useCustomerAuth();
  const [detail, setDetail] = useState<QuickCustomerOrderDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    getOrder(id)
      .then((data) => live && setDetail(data))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [getOrder, id]);

  if (failed) {
    return (
      <div className="order-detail">
        <p>STATUS / DETAIL_UNAVAILABLE</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="order-detail">
        <p>STATUS / READING_ORDER</p>
      </div>
    );
  }

  const refunded = detail.payment?.status === "refunded";

  return (
    <div className="order-detail">
      {refunded ? (
        <p className="order-detail-refund">
          REFUNDED / ${money(detail.payment?.amountCents ?? 0)}{" "}
          {detail.payment?.currency} RETURNED TO YOUR ORIGINAL PAYMENT METHOD.
        </p>
      ) : null}

      <ul className="order-detail-lines">
        {detail.lineItems.map((line) => (
          <li key={line.id}>
            <span>
              {line.quantity}× {line.name}
            </span>
            <span>${money(line.lineTotalCents)}</span>
          </li>
        ))}
      </ul>

      <dl className="order-detail-totals">
        <div>
          <dt>SUBTOTAL</dt>
          <dd>${money(detail.subtotalCents)}</dd>
        </div>
        {(cents(detail.discountCents) ?? 0) > 0 ? (
          <div>
            <dt>DISCOUNT</dt>
            <dd>-${money(cents(detail.discountCents) ?? 0)}</dd>
          </div>
        ) : null}
        {cents(detail.shippingCents) !== null ? (
          <div>
            <dt>SHIPPING</dt>
            <dd>${money(cents(detail.shippingCents) ?? 0)}</dd>
          </div>
        ) : null}
        {(cents(detail.taxCents) ?? 0) > 0 ? (
          <div>
            <dt>TAX</dt>
            <dd>${money(cents(detail.taxCents) ?? 0)}</dd>
          </div>
        ) : null}
        <div>
          <dt>TOTAL</dt>
          <dd>
            ${money(detail.totalCents)} {detail.currency}
          </dd>
        </div>
        {detail.payment ? (
          <div>
            <dt>PAYMENT</dt>
            <dd>
              {detail.payment.provider.toUpperCase()} /{" "}
              {detail.payment.status.toUpperCase()}
            </dd>
          </div>
        ) : null}
      </dl>

      {detail.shipments.length > 0 ? (
        <ul className="order-detail-shipments">
          {detail.shipments.map((shipment) => (
            <li key={shipment.id}>
              {shipment.status.toUpperCase()}
              {shipment.trackingNumber
                ? ` / ${shipment.carrier ?? ""} ${shipment.trackingNumber}`.toUpperCase()
                : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function OrderHistory() {
  const { listOrders, loading: authLoading, session } = useCustomerAuth();
  const [orders, setOrders] = useState<QuickOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setLoading(false);
      return;
    }
    listOrders()
      .then((items) => setOrders(items))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [authLoading, listOrders, session]);

  if (authLoading || loading) {
    return (
      <section className="empty-state">
        <p>STATUS / QUERYING</p>
        <h2>LOADING ORDER LOG.</h2>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="empty-state">
        <p>% query orders --customer=current</p>
        <h2>AUTHENTICATION REQUIRED.</h2>
        <p>SIGN IN TO RETRIEVE YOUR QUICKDASH ORDER AND SHIPMENT HISTORY.</p>
        <a className="cursor-pointer" href="/account">
          SIGN IN
        </a>
      </section>
    );
  }

  if (failed) {
    return (
      <section className="empty-state">
        <p>STATUS / QUERY_FAILED</p>
        <h2>ORDER LOG UNAVAILABLE.</h2>
        <p>THE SESSION IS VALID, BUT QUICKDASH COULD NOT RETURN ORDERS.</p>
        <button
          className="cursor-pointer"
          onClick={() => location.reload()}
          type="button"
        >
          RETRY
        </button>
      </section>
    );
  }

  return (
    <section className="order-history">
      <div className="order-history-heading">
        <p>% query orders --customer=current</p>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>STATUS / EMPTY</p>
          <h2>NO ORDERS YET.</h2>
          <p>YOUR FIRST COMPLETED COFFEE ORDER WILL APPEAR HERE.</p>
          <a className="cursor-pointer" href="/coffee">
            BROWSE COFFEE
          </a>
        </div>
      ) : (
        <ol className="order-log">
          {orders.map((order) => (
            <li key={order.id}>
              <button
                className="order-log-row cursor-pointer"
                onClick={() =>
                  setOpen((current) => (current === order.id ? null : order.id))
                }
                type="button"
              >
                <div>
                  <p>{order.number}</p>
                  <h2>{order.status.toUpperCase()}</h2>
                </div>
                <div>
                  <p>{new Date(order.createdAt).toLocaleDateString("en-CA")}</p>
                  <strong>
                    ${money(order.totalCents)} {order.currency}
                  </strong>
                </div>
              </button>
              {open === order.id ? <OrderDetail id={order.id} /> : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
