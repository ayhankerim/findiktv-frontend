import { useEffect } from "react"
import App from "next/app"
import Head from "next/head"
import { GoogleAnalytics, event } from "nextjs-google-analytics"
import { DefaultSeo } from "next-seo"
import { getStrapiMedia } from "utils/media"
import { getGlobalData } from "utils/api"
import { SessionProvider } from "next-auth/react"
import { Provider } from "react-redux"
import { store, persistor } from "@/store/index"
import { PersistGate } from "redux-persist/integration/react"
import { Dosis } from "next/font/google"
import runOneSignal from "utils/onesignal"

import "@/styles/style.css"

export function reportWebVitals({ id, name, label, value }) {
  event(name, {
    category: label === "web-vital" ? "Web Vitals" : "Next.js custom metric",
    value: Math.round(name === "CLS" ? value * 1000 : value), // values must be integers
    label: id, // id unique to current page load
    nonInteraction: true, // avoids affecting bounce rate.
  })
}

const dosis = Dosis({
  style: ["normal"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-dosis",
})

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
  pageRout,
}) => {
  useEffect(() => {
    process.env.NEXT_PUBLIC_DISABLE_EXTERNAL_SCRIPTS != "on" && runOneSignal()
  })
  // Extract the data we need
  const { global } = pageProps
  if (global == null || global.data) {
    return false
  }

  const { metadata, favicon, metaTitleSuffix } = global.attributes
  return (
    <>
      <GoogleAnalytics trackPageViews strategy="lazyOnload" />
      {/* Favicon */}
      <Head>
        <link
          rel="shortcut icon"
          href={getStrapiMedia(favicon.data.attributes.url)}
        />
        <link
          rel="preconnect"
          href="https://googleads.g.doubleclick.net"
        ></link>
        <link rel="preconnect" href="https://cdn.onesignal.com"></link>
      </Head>
      {/* Global site metadata */}
      <DefaultSeo
        titleTemplate={
          pageRout === "/"
            ? `${metaTitleSuffix} | %s`
            : `%s | ${metaTitleSuffix}`
        }
        title="FINDIK TV"
        description={metadata.metaDescription}
        openGraph={{
          images: Object.values(
            metadata.shareImage.data.attributes.formats
          ).map((image) => {
            return {
              url: getStrapiMedia(image.url),
              width: image.width,
              height: image.height,
            }
          }),
        }}
        twitter={{
          cardType: metadata.twitterCardType,
          handle: metadata.twitterUsername,
        }}
      />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SessionProvider session={session}>
            {/* Display the content */}
            <div className={`${dosis.variable} font-sans`}>
              <Component {...pageProps} />
            </div>
          </SessionProvider>
        </PersistGate>
      </Provider>
    </>
  )
}

// getInitialProps disables automatic static optimization for pages that don't
// have getStaticProps. So [[...slug]] pages still get SSG.
// Hopefully we can replace this with getStaticProps once this issue is fixed:
// https://github.com/vercel/next.js/discussions/10949
MyApp.getInitialProps = async (appContext) => {
  // Calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext)
  const globalLocale = await getGlobalData(appContext.router.locale)

  return {
    ...appProps,
    pageProps: {
      global: globalLocale,
    },
    pageRout: appContext.router.asPath,
  }
}

export default MyApp
