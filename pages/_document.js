import Document, { Html, Head, Main, NextScript } from "next/document"
import Script from "next/script"

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="tr">
        <Head />
        <body>
          <Main />
          <NextScript />
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
              data-ad-client="ca-pub-7598098755679343"
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7598098755679343"
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
            src={`https://news.google.com/swg/js/v1/swg-basic.js`}
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
        </body>
      </Html>
    )
  }
}
