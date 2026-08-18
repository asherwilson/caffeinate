"use client";

import Image from "next/image";
import { useCart } from "./cart-store";
import { useCatalog } from "./catalog-store";
import { useToast } from "./toast-store";
import { useAppliedDiscount } from "./use-applied-discount";

export function CartView() {
  const { items, removeItem, updateQuantity } = useCart();
  const { availabilityFor, findProductById, loading } = useCatalog();
  const { pushToast } = useToast();
  const availableItems = items.flatMap((item) => {
    const product = findProductById(item.catalogItemId);
    return product ? [{ ...item, product }] : [];
  });
  const subtotal = availableItems.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );
  // Priced by the server against these exact items, never computed here.
  const discount = useAppliedDiscount(availableItems);
  const inventoryBlocked = availableItems.some((item) => {
    const availability = availabilityFor(item.catalogItemId);
    return (
      availability?.available === false ||
      (availability?.tracked === true &&
        availability.availableQuantity !== null &&
        item.quantity > availability.availableQuantity)
    );
  });

  if (loading) {
    return (
      <section className="empty-state">
        <p>STATUS / VERIFYING_CART</p>
        <h2>CHECKING LIVE CATALOG.</h2>
      </section>
    );
  }

  if (availableItems.length === 0) {
    return (
      <section className="empty-state">
        <p>STATUS / EMPTY</p>
        <h2>PROCESS QUEUE EMPTY.</h2>
        <p>NO COFFEE HAS BEEN ADDED. YOUR CART WILL PERSIST ON THIS DEVICE.</p>
        <a className="cursor-pointer" href="/coffee">
          BROWSE COFFEE
        </a>
      </section>
    );
  }

  return (
    <div className="cart-layout">
      <section className="cart-items" aria-label="Cart items">
        {availableItems.map(({ product, quantity }) => {
          const availability = availabilityFor(product.catalogItemId);
          const maximum = availability?.tracked
            ? Math.max(0, availability.availableQuantity ?? 0)
            : 12;
          const unavailable = availability?.available === false;
          return (
            <article className="cart-item" key={product.catalogItemId}>
              <a
                className="cart-item-image cursor-pointer"
                href={`/coffee/${product.slug}`}
              >
                <Image alt="" fill sizes="120px" src={product.image} />
              </a>
              <div className="cart-item-information">
                <p>COFFEE / {product.roast}</p>
                <h2>
                  <a
                    className="cursor-pointer"
                    href={`/coffee/${product.slug}`}
                  >
                    {product.name}
                  </a>
                </h2>
                <p>340G / WHOLE BEAN</p>
                <p>${(product.priceCents / 100).toFixed(2)} CAD / UNIT</p>
                <p>STATUS / {unavailable ? "SOLD OUT" : "STOCK VERIFIED"}</p>
              </div>
              <div className="cart-item-controls">
                <p>QUANTITY / {String(quantity).padStart(2, "0")}</p>
                <div>
                  <button
                    aria-label={`Decrease ${product.name} quantity`}
                    className="cursor-pointer"
                    onClick={() => {
                      updateQuantity(product.catalogItemId, quantity - 1);
                      pushToast({
                        code: "CART−1",
                        message:
                          quantity === 1
                            ? `${product.name} REMOVED FROM QUEUE.`
                            : `${product.name} QUANTITY DECREASED.`,
                        tone: "info",
                      });
                    }}
                    type="button"
                  >
                    −
                  </button>
                  <button
                    aria-label={`Increase ${product.name} quantity`}
                    className="cursor-pointer"
                    disabled={unavailable || quantity >= Math.min(12, maximum)}
                    onClick={() => {
                      updateQuantity(product.catalogItemId, quantity + 1);
                      pushToast({
                        code: "CART+1",
                        message: `${product.name} QUANTITY INCREASED.`,
                        tone: "success",
                      });
                    }}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    removeItem(product.catalogItemId);
                    pushToast({
                      code: "CART−",
                      message: `${product.name} REMOVED FROM PROCESS QUEUE.`,
                      tone: "warning",
                    });
                  }}
                  type="button"
                >
                  REMOVE
                </button>
              </div>
              <p className="cart-line-total">
                ${((product.priceCents * quantity) / 100).toFixed(2)} CAD
              </p>
            </article>
          );
        })}
      </section>

      <aside className="cart-summary">
        <p>% compile_order</p>
        <dl>
          <div>
            <dt>ITEMS</dt>
            <dd>
              {availableItems.reduce((total, item) => total + item.quantity, 0)}
            </dd>
          </div>
          <div>
            <dt>SUBTOTAL</dt>
            <dd>${(subtotal / 100).toFixed(2)} CAD</dd>
          </div>
          {/* 🔑 The proof that a partner link worked. A toast on arrival is
              easily missed or dismissed; the number changing in the basket is
              what somebody actually checks before trusting a code. */}
          {discount ? (
            <div>
              <dt>DISCOUNT / {discount.code}</dt>
              <dd>-${(discount.amountCents / 100).toFixed(2)} CAD</dd>
            </div>
          ) : null}
          <div>
            <dt>SHIPPING</dt>
            <dd>CALCULATED NEXT</dd>
          </div>
          <div>
            <dt>TAX</dt>
            <dd>CALCULATED NEXT</dd>
          </div>
        </dl>
        <div className="cart-total">
          <span>ESTIMATED TOTAL</span>
          <strong>
            ${((subtotal - (discount?.amountCents ?? 0)) / 100).toFixed(2)} CAD
          </strong>
        </div>
        {inventoryBlocked ? (
          <p className="cart-summary-note">
            CHECKOUT BLOCKED / ADJUST ITEMS TO CURRENT STOCK.
          </p>
        ) : (
          <a className="cart-checkout cursor-pointer" href="/checkout">
            CONTINUE TO CHECKOUT
          </a>
        )}
        <p className="cart-summary-note">
          PRICES AND AVAILABILITY ARE VERIFIED AGAIN BEFORE PAYMENT.
        </p>
      </aside>
    </div>
  );
}
