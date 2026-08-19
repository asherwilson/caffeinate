# Caffeinate

A small, keyboard-first coffee storefront powered by QuickDash.

## Local development

Requires Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Next.js prints the local URL when it starts. Use `pnpm build` for a production check.

QuickDash-backed features read their browser-safe configuration from `.env.local`. Never commit that file or place a server credential in a `NEXT_PUBLIC_*` variable.

## Copy ideas

Parked, not forgotten.

- **Cron jobs for coffee.** Subscriptions are literally a scheduled job that runs
  every month, and this shop is built for developers. "SET AND FORGET / YOUR
  CAFFEINE CRON" or similar. Use it on the subscribe page once the plans are
  real and running, not before — a joke about automation on a page that cannot
  yet automate is just a joke about vapourware.
