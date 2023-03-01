import Document, { Html, Head, Main, NextScript } from "next/document"

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="tr">
        <Head />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7598098755679343"
          crossOrigin="anonymous"
        ></script>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
