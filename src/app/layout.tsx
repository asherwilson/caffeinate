import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-store";
import { CatalogProvider } from "@/components/catalog-store";
import { CustomerAuthProvider } from "@/components/customer-auth-store";
import { NavigationHint } from "@/components/navigation-hint";
import { ToastProvider, ToastViewport } from "@/components/toast-store";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Caffeinate",
  description: "Caffeinate coffee shop.",
  // The pixel cup is drawn as paths on a grid rather than a bitmap, so one file
  // is crisp at 16px in a tab and at any size anywhere else.
  //
  // `sizes: "any"` is the part that matters: without it a browser treats the SVG
  // as a fixed-size asset and renders it at the file's own width, instead of
  // scaling the viewBox to whatever the surface asks for.
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

/**
 * Which way the page slid in.
 *
 * 🔴 Must run before first paint, which is why it is an inline script and not
 * an effect. A cross-document view transition begins as the new document starts
 * rendering, long before React hydrates, so a direction set in a `useEffect`
 * arrives after the animation it was meant to choose.
 *
 * The value is written by the arrow-key navigation just before it leaves the
 * previous page. Anything else, a typed URL or a clicked link, leaves it unset
 * and the transition falls back to the default direction.
 */
const slideDirectionScript = `
try {
  var d = sessionStorage.getItem("caffeinate-slide");
  if (d) {
    document.documentElement.dataset.slide = d;
    sessionStorage.removeItem("caffeinate-slide");
  }
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `suppressHydrationWarning` because the script below sets `data-slide`
    // here before React hydrates, so the server markup and the live DOM
    // legitimately differ by that one attribute. Scoped to this element only.
    <html lang="en" className={jetBrainsMono.variable} suppressHydrationWarning>
      <body>
        {/*
          🔴 First child of `<body>`, NOT inside a hand-written `<head>`.
          The App Router owns the head, so declaring one here is a structural
          mismatch: React gave up on the server HTML and re-rendered the whole
          tree, leaving TWO copies of the shell in the document. The navigation
          attached to one and everything measured the other, which read as the
          keyboard silently not working.

          Here it still runs before any of the page below it paints, which is
          all the slide direction needs.
        */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string with no interpolation, and it must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: slideDirectionScript }} />
        <ToastProvider>
          <CustomerAuthProvider>
            <CatalogProvider>
              <CartProvider>
                {children}
                <NavigationHint />
                <ToastViewport />
              </CartProvider>
            </CatalogProvider>
          </CustomerAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
