import React from "react";
import qs from "qs";
import type { Viewport } from "next";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { generateMetadataObject } from "@/lib/shared/metadata";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { CartProvider } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import { ViewTransitions } from "next-view-transitions";
import fetchContentType from "@/lib/strapi/fetchContentType";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#06b6d4" },
  ],
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Default Global SEO for pages without them
export async function generateMetadata(): Promise<Metadata> {
  const query = qs.stringify(
    {
      populate: ["metadata"]
    },
    {
      encodeValuesOnly: true,
    }
  );
  const pageData = await fetchContentType(
    "global",
    query,
    true
  );

  const seo = pageData?.metadata;
  const metadata = generateMetadataObject(seo);
  return metadata;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const query = qs.stringify(
    {
      populate: ["navbar", "navbar.links", "navbar.button", "navbar.logo", "footer", "footer.logo", "footer.columns", "footer.columns.links"]
    },
    {
      encodeValuesOnly: true,
    }
  );
  const pageData = await fetchContentType(
    "global",
    query,
    true
  );
  return (
    <html lang="tr">
      <ViewTransitions>
        <CartProvider>
          <body
            className={cn(
              inter.className,
              "flex flex-col bg-white antialiased min-h-screen w-full"
            )}
          >
            <Navbar data={pageData.navbar} locale="tr" />
            {children}
            <Footer data={pageData.footer} locale="tr" />
          </body>
        </CartProvider>
      </ViewTransitions>
    </html>
  );
}
