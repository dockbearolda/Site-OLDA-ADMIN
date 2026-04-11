import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import { CartButton } from "@/components/cart/cart-button";
import { CartDrawer } from "@/components/cart/cart-drawer";

import { CartProvider } from "@/lib/cart-context";
import { CartDrawerProvider } from "@/lib/cart-drawer-context";
import { ProjectsProvider } from "@/lib/projects-context";
import { ProjectsDrawerProvider } from "@/lib/projects-drawer-context";

import { ToastProvider } from "@/lib/toast-context";
import { AuthSessionProvider } from "@/lib/session-provider";
import { siteConfig } from "@/data/site";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/* Viewport-fit=cover : indispensable pour que env(safe-area-inset-top)
   retourne la vraie valeur de l'encoche/Dynamic Island sur iPhone */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Atelier OLDA",
    template: "Atelier OLDA",
  },
  description: "",
  applicationName: "Atelier OLDA",
  openGraph: {
    title: "Atelier OLDA",
    description: "",
    siteName: "Atelier OLDA",
  },
  twitter: {
    title: "Atelier OLDA",
    description: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={manrope.variable}>
      <body>
        <AuthSessionProvider>
          {/*
           * CartProvider doit envelopper ProjectsProvider
           * car ProjectsProvider consomme useCart() en interne.
           */}
          <CartProvider>
            <ProjectsProvider>
              <CartDrawerProvider>
                <ProjectsDrawerProvider>
                  <ToastProvider>
                    {children}
                    <CartButton />
                    <CartDrawer />
                  </ToastProvider>
                </ProjectsDrawerProvider>
              </CartDrawerProvider>
            </ProjectsProvider>
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
