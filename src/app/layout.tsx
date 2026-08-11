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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={jetBrainsMono.variable}>
      <body>
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
