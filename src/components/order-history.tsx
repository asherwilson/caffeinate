"use client";

import type { QuickOrder } from "@quickengine/quick/browser";
import { useEffect, useState } from "react";
import { useCustomerAuth } from "./customer-auth-store";
import { useToast } from "./toast-store";

const money = (cents: number) => (cents / 100).toFixed(2);

export function OrderHistory() {
  const {
    listOrders,
    loading: authLoading,
    openPortal,
    session,
  } = useCustomerAuth();
  const { pushToast } = useToast();
  const [orders, setOrders] = useState<QuickOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

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
        <button
          className="secondary-cta cursor-pointer"
          onClick={async () => {
            try {
              await openPortal();
            } catch (error) {
              pushToast({
                code: "PORTAL",
                message:
                  error instanceof Error
                    ? error.message.toUpperCase()
                    : "CUSTOMER PORTAL UNAVAILABLE.",
                tone: "warning",
              });
            }
          }}
          type="button"
        >
          OPEN CUSTOMER PORTAL
        </button>
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
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
