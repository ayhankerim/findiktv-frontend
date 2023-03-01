import App from "next/app"
import Head from "next/head"
import ErrorPage from "next/error"
import { useRouter } from "next/router"
import { DefaultSeo } from "next-seo"
import { getStrapiMedia } from "utils/media"
import { getGlobalData } from "utils/api"
import { SessionProvider } from "next-auth/react"
import { Provider } from "react-redux"
import { store, persistor } from "@/store/index"
import { PersistGate } from "redux-persist/integration/react"
import { Dosis } from "@next/font/google"

import "@/styles/style.css"

const dosis = Dosis({
  style: ["normal"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-dosis",
})

const MyApp = ({ Component, pageProps: { session, ...pageProps } }) => {
  // Extract the data we need
  const { global } = pageProps
  if (global == null || global.data) {
    return <ErrorPage statusCode={404} />
  }

  const { metadata, favicon, metaTitleSuffix } = global.attributes
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SessionProvider session={session}>
            {/* Favicon */}
            <Head>
              <link
                rel="shortcut icon"
                href={getStrapiMedia(favicon.data.attributes.url)}
              />
            </Head>
            {/* Global site metadata */}
            <DefaultSeo
              titleTemplate={`%s | ${metaTitleSuffix}`}
              title="Page"
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
  }
}

export default MyApp
