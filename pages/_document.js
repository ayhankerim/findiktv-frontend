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
            async={true}
            strategy="beforeInteractive"
            data-ad-client="ca-pub-7598098755679343"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7598098755679343"
          />
        </body>
      </Html>
    )
  }
}
