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
