"use client";

import { useState } from "react";
import type { DirectionalNavigation } from "./directional-navigation";

const methods = [
  {
    dose: "20G",
    grind: "MEDIUM-FINE",
    id: "pour-over",
    label: "POUR OVER",
    ratio: "1:16",
    temperature: "94°C",
    time: "03:00",
    water: "320G",
  },
  {
    dose: "17G",
    grind: "FINE",
    id: "aeropress",
    label: "AEROPRESS",
    ratio: "1:14.7",
    temperature: "88°C",
    time: "01:45",
    water: "250G",
  },
  {
    dose: "30G",
    grind: "COARSE",
    id: "french-press",
    label: "FRENCH PRESS",
    ratio: "1:16.7",
    temperature: "96°C",
    time: "04:00",
    water: "500G",
  },
  {
    dose: "18G",
    grind: "FINE",
    id: "espresso",
    label: "ESPRESSO",
    ratio: "1:2",
    temperature: "93°C",
    time: "00:30",
    water: "36G",
  },
] as const;

type BrewProtocolProps = Pick<DirectionalNavigation, "targetProps">;

export function BrewProtocol({ targetProps }: BrewProtocolProps) {
  const [activeMethod, setActiveMethod] = useState(0);
  const method = methods[activeMethod];

  return (
    <section className="brew-protocol" aria-labelledby="brew-title">
      <div className="brew-interface">
        <div className="brew-introduction">
          <p className="brew-label" {...targetProps(59)}>
            {"// BREW_PROTOCOL / SELECT_RUNTIME"}
          </p>
          <h2 id="brew-title" {...targetProps(60)}>
            COMPILE
            <br />A BETTER
            <br />
            CUP.
          </h2>
          <p className="brew-copy" {...targetProps(61)}>
            PICK A RUNTIME.
            <br />
            WE&apos;LL HANDLE THE PARAMETERS.
          </p>

          <fieldset className="brew-methods">
            <legend className="visually-hidden">Brewing method</legend>
            {methods.map((item, index) => (
              <button
                className="brew-method cursor-pointer"
                data-active={activeMethod === index ? "true" : undefined}
                key={item.id}
                onClick={() => setActiveMethod(index)}
                type="button"
                {...targetProps(62 + index)}
              >
                {item.label}
              </button>
            ))}
          </fieldset>
        </div>

        <div className="brew-output" aria-live="polite">
          <p className="brew-output-label" {...targetProps(66)}>
            % brew --method={method.id}
          </p>
          <dl {...targetProps(67)}>
            <div>
              <dt>INPUT /</dt>
              <dd>{method.dose}</dd>
            </div>
            <div>
              <dt>WATER /</dt>
              <dd>{method.water}</dd>
            </div>
            <div>
              <dt>RATIO /</dt>
              <dd>{method.ratio}</dd>
            </div>
          </dl>
          <dl {...targetProps(68)}>
            <div>
              <dt>GRIND /</dt>
              <dd>{method.grind}</dd>
            </div>
            <div>
              <dt>TEMP /</dt>
              <dd>{method.temperature}</dd>
            </div>
          </dl>
          <p className="brew-execution" {...targetProps(69)}>
            <span>EXECUTION /</span>
            <strong>{method.time}</strong>
          </p>
        </div>
      </div>

      <a
        className="brew-action cursor-pointer"
        href="/coffee"
        {...targetProps(70)}
      >
        OPEN FULL PROTOCOL
      </a>
    </section>
  );
}
