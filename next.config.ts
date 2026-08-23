import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /**
   * 🔴 Product photographs live in QuickDash, on the API's own host.
   *
   * `next/image` refuses any remote host not listed here, and refuses it
   * SILENTLY as far as the page is concerned: the image simply never
   * appears. That is why every uploaded photograph rendered as a
   * placeholder — not a broken upload, an unlisted host.
   *
   * ⚠️ Localhost covers development, where the API serves assets itself.
   * The production host must be here before deploying or the same silence
   * returns.
   */
  images: {
    /**
     * 🔴 Optimisation OFF in development, and only in development.
     *
     * Next 16 refuses to let the image optimiser fetch a private or local
     * address — an SSRF protection, and `remotePatterns` cannot override it.
     * Proven rather than guessed: a public https host is accepted (404 from
     * upstream), while localhost:3011, localhost:3020 and 127.0.0.1:3020 are
     * all refused identically with 400.
     *
     * In development the API serves assets from localhost, so every product
     * photograph was silently blocked. In production they come from
     * `api.quickdash.xyz` over https, which the optimiser is happy to fetch —
     * so this costs nothing where it matters and unblocks the shop where it
     * does not.
     */
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      // 🔴 The PORT is not optional here. A pattern with no port matches only
      // a URL with no port, so `localhost:3011` was refused by a rule that
      // looked like it allowed localhost — and the image silently never
      // appeared. Every port the API or its dev proxy can answer on:
      {
        protocol: "http",
        hostname: "localhost",
        port: "3011",
        pathname: "/assets/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3020",
        pathname: "/assets/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/assets/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3020",
        pathname: "/assets/**",
      },
      { protocol: "https", hostname: "api.quickdash.xyz" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
