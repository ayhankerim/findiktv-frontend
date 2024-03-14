import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Dosis } from "next/font/google";
import runOneSignal from "./utils/onesignal";
import SessionWrapper from "./components/SessionWrapper";
import { getStrapiMedia, getStrapiURL } from "./utils/api-helpers";
import { fetchAPI } from "./utils/fetch-api";
import { i18n } from "../../i18n-config";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { FALLBACK_SEO } from "./utils/constants";

const dosis = Dosis({
  style: ["normal"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-dosis",
});

async function getGlobal(lang: string): Promise<any> {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  if (!token)
    throw new Error("The Strapi API Token environment variable is not set.");

  const path = `/global`;
  const options = { headers: { Authorization: `Bearer ${token}` } };

  const urlParamsObject = {
    populate: [
      "metadata.shareImage",
      "favicon",
      "notificationBanner.link",
      "navbar.links",
      "navbar.button",
      "navbar.logo",
      "footer.logo",
      "footer.button",
      "footer.columns",
      "footer.columns.links",
      "footer.smallText",
      "footer.copyright",
    ],
    locale: lang,
  };
  return await fetchAPI(path, urlParamsObject, options);
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const meta = await getGlobal("tr");

  if (!meta.data) return FALLBACK_SEO;

  const { metadata, favicon } = meta.data.attributes;
  const { url } = favicon.data.attributes;

  return {
    title: metadata.metaTitle,
    description: metadata.metaDescription,
    icons: {
      icon: [new URL(url, getStrapiURL())],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const global = await getGlobal("tr");
  // TODO: CREATE A CUSTOM ERROR PAGE
  if (!global.data) return null;

  const { notificationBanner, navbar, footer } = global.data.attributes;

  const navbarLogoUrl = getStrapiMedia(navbar.logo.data.attributes.url);

  const footerLogoUrl = getStrapiMedia(footer.logo.data.attributes.url);

  return (
    <SessionWrapper>
      <html lang="tr">
        <head>
          <link
            rel="preconnect"
            href="https://googleads.g.doubleclick.net"
          ></link>
          <link rel="preconnect" href="https://cdn.onesignal.com"></link>
        </head>
        <body className={`${dosis.variable} font-sans`}>
          <Script
            id="SiteName"
            strategy="beforeInteractive"
            type="application/ld+json"
          >
            {`
          {
            "@context" : "https://schema.org",
            "@type" : "WebSite",
            "name" : "FINDIK TV",
            "alternateName" : "FTV",
            "url" : "https://www.findiktv.com/"
          }
          `}
          </Script>
          {process.env.NEXT_PUBLIC_DISABLE_EXTERNAL_SCRIPTS != "on" && (
            <Script
              async={true}
              strategy="beforeInteractive"
              data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB}
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB}`}
            />
          )}
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          />
          <Script id="GoogleAnalytics" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `}
          </Script>
          <Script
            strategy="lazyOnload"
            src={
              process.env.NEXT_PUBLIC_ADSENSE_TEST !== "on"
                ? "https://news.google.com/swg/js/v1/swg-basic.js"
                : ""
            }
          />
          <Script id="NewsArticle" strategy="lazyOnload">
            {`
              (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
                basicSubscriptions.init({
                  type: "NewsArticle",
                  isPartOfType: ["Product"],
                  isPartOfProductId: "CAoiEATMSmX53ZjtQ4kcyzxQ1_I:openaccess",
                  clientOptions: { theme: "light", lang: "tr" },
                });
              });
            `}
          </Script>
          {children}
          {/* <div className="flex flex-col flex-grow justify-between min-h-screen">
            <div className="flex flex-col">
              <Navbar
                links={navbar.links}
                logoUrl={navbarLogoUrl}
                button={navbar.button}
              />
              <>{children}</>
              <Banner data={notificationBanner} />
            </div>
            <Footer
              logoUrl={footerLogoUrl}
              columns={footer.columns || []}
              smallText={footer.smallText || ""}
              copyright={footer.copyright || ""}
            />
          </div> */}
        </body>
      </html>
    </SessionWrapper>
  );
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}
