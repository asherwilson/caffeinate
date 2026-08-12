"use client";

import { useState } from "react";

const roasts = ["ROTATING", "HOUSE", "DARK", "LIGHT"] as const;
const intervals = ["2 WEEKS", "3 WEEKS", "4 WEEKS"] as const;
const quantities = ["1 BAG", "2 BAGS", "3 BAGS"] as const;

export function BackgroundProcess() {
  const [roast, setRoast] = useState(0);
  const [interval, setInterval] = useState(1);
  const [quantity, setQuantity] = useState(0);
  const cyclePrice = 24 * (quantity + 1);

  return (
    <section className="background-process" aria-labelledby="process-title">
      <div className="process-interface">
        <div className="process-configuration">
          <p className="process-label">
            {"// BACKGROUND_PROCESS / RECURRING_DELIVERY"}
          </p>
          <h2 id="process-title">
            NEVER RUN
            <br />
            OUT AGAIN.
          </h2>
          <p className="process-copy">
            COFFEE ARRIVES BEFORE
            <br />
            YOUR SUPPLY REACHES ZERO.
          </p>

          <fieldset className="process-options">
            <legend>ROAST /</legend>
            {roasts.map((option, index) => (
              <button
                className="process-option cursor-pointer"
                data-active={roast === index ? "true" : undefined}
                key={option}
                onClick={() => setRoast(index)}
                type="button"
              >
                {option}
              </button>
            ))}
          </fieldset>

          <fieldset className="process-options">
            <legend>INTERVAL /</legend>
            {intervals.map((option, index) => (
              <button
                className="process-option cursor-pointer"
                data-active={interval === index ? "true" : undefined}
                key={option}
                onClick={() => setInterval(index)}
                type="button"
              >
                {option}
              </button>
            ))}
          </fieldset>

          <fieldset className="process-options">
            <legend>QUANTITY /</legend>
            {quantities.map((option, index) => (
              <button
                className="process-option cursor-pointer"
                data-active={quantity === index ? "true" : undefined}
                key={option}
                onClick={() => setQuantity(index)}
                type="button"
              >
                {option}
              </button>
            ))}
          </fieldset>
        </div>

        <div className="process-output">
          <p>% subscribe --coffee</p>
          <dl>
            <div>
              <dt>ROAST /</dt>
              <dd>{roasts[roast]}</dd>
            </div>
            <div>
              <dt>INTERVAL /</dt>
              <dd>{intervals[interval]}</dd>
            </div>
            <div>
              <dt>QUANTITY /</dt>
              <dd>{quantities[quantity]}</dd>
            </div>
            <div>
              <dt>CYCLE /</dt>
              <dd>${cyclePrice} CAD</dd>
            </div>
            <div>
              <dt>SHIPPING /</dt>
              <dd>CALCULATED AT CHECKOUT</dd>
            </div>
          </dl>
          <p>STATUS / READY</p>
        </div>
      </div>

      <button className="process-action cursor-pointer" type="button">
        START PROCESS
      </button>
    </section>
  );
}
