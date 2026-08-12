"use client";

import { useId, useMemo, useState } from "react";
import { useCatalog } from "./catalog-store";

type Result = {
  detail: string;
  href: string;
  kind: string;
  label: string;
};

/**
 * The pages worth reaching by name.
 *
 * `terms` carries the words people actually type when they are looking for it,
 * which are rarely the words in its title. Nobody searches for "DEAD LINK", and
 * somebody looking for a refund types "refund" rather than "recovery mode".
 */
const pages: (Result & { keywords: string })[] = [
  {
    detail: "THE FULL STACK",
    href: "/coffee",
    keywords: "shop beans buy roast catalog bag whole ground",
    kind: "PAGE",
    label: "COFFEE",
  },
  {
    detail: "COFFEE ON A SCHEDULE",
    href: "/subscribe",
    keywords:
      "subscription recurring monthly weekly plan auto ship repeat standing order",
    kind: "PAGE",
    label: "SUBSCRIBE",
  },
  {
    detail: "WHO IS ROASTING THIS",
    href: "/about",
    keywords: "story who us company team",
    kind: "PAGE",
    label: "ABOUT",
  },
  {
    detail: "COMMON QUESTIONS",
    href: "/faq",
    keywords: "help questions answers support",
    kind: "PAGE",
    label: "FAQ",
  },
  {
    detail: "SEND A SIGNAL",
    href: "/contact",
    keywords: "email support help message reach talk",
    kind: "PAGE",
    label: "CONTACT",
  },
  {
    detail: "RATES AND COVERAGE",
    href: "/shipping",
    keywords: "delivery post tracking rates canada how long",
    kind: "PAGE",
    label: "SHIPPING",
  },
  {
    detail: "REFUNDS AND DAMAGE",
    href: "/returns",
    keywords: "refund return damaged broken wrong exchange money back",
    kind: "PAGE",
    label: "RETURNS",
  },
  {
    detail: "WHAT WE STORE",
    href: "/privacy",
    keywords: "data gdpr personal information delete cookies",
    kind: "PAGE",
    label: "PRIVACY",
  },
  {
    detail: "CONDITIONS OF SALE",
    href: "/terms",
    keywords: "terms conditions legal agreement service liability",
    kind: "PAGE",
    label: "TERMS",
  },
  {
    detail: "YOUR ORDERS AND MESSAGES",
    href: "/account",
    keywords: "sign in login account profile orders history",
    kind: "PAGE",
    label: "ACCOUNT",
  },
];

/**
 * Search across the catalog and the site.
 *
 * 🔴 Filters as you type rather than on submit. The form still submits, because
 * a search box that swallows Enter is broken for anyone who expects it, but the
 * answer is already on screen by the time they press it.
 *
 * Matching is a plain substring test over a joined haystack. The catalog is a
 * few dozen items and the page list is fixed, so anything cleverer would cost
 * more to maintain than it could possibly return.
 */
export function SiteSearch() {
  const [query, setQuery] = useState("");
  const { loading, products } = useCatalog();
  const inputId = useId();

  const results = useMemo<Result[]>(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const matches = (haystack: string) =>
      haystack.toLowerCase().includes(needle);

    const productResults = products
      .filter((product) =>
        matches(`${product.name} ${product.roast} ${product.description}`),
      )
      .map((product) => ({
        detail: `${product.roast} / $${(product.priceCents / 100).toFixed(2)} CAD`,
        href: `/coffee/${product.slug}`,
        kind: "COFFEE",
        label: product.name,
      }));

    const pageResults = pages
      .filter((page) =>
        matches(`${page.label} ${page.detail} ${page.keywords}`),
      )
      .map(({ keywords: _keywords, ...page }) => page);

    return [...productResults, ...pageResults];
  }, [products, query]);

  const searched = query.trim().length > 0;

  return (
    <>
      <search>
        <form
          className="search-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="visually-hidden" htmlFor={inputId}>
            Search coffee and pages
          </label>
          <input
            autoComplete="off"
            className="cursor-text"
            id={inputId}
            name="query"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="TYPE A QUERY"
            type="search"
            value={query}
          />
          <button className="cursor-pointer" type="submit">
            RUN
          </button>
        </form>
      </search>

      <div aria-live="polite" className="search-results">
        {searched ? (
          <p className="search-count">
            {`// ${String(results.length).padStart(2, "0")} RESULT${
              results.length === 1 ? "" : "S"
            }${loading ? " / CATALOG_LOADING" : ""}`}
          </p>
        ) : null}

        {results.map((result) => (
          <a
            className="search-result cursor-pointer"
            href={result.href}
            key={`${result.kind}-${result.href}`}
          >
            <span className="search-result-kind">{result.kind}</span>
            <span className="search-result-label">{result.label}</span>
            <span className="search-result-detail">{result.detail}</span>
          </a>
        ))}

        {searched && results.length === 0 && !loading ? (
          <p className="search-empty">
            NOTHING MATCHED THAT. TRY A ROAST, A METHOD, OR A PAGE NAME.
          </p>
        ) : null}
      </div>
    </>
  );
}
