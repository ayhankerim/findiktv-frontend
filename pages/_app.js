import { useEffect } from "react"
import App from "next/app"
import Head from "next/head"
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
        facebook={{
          appId: "419414316513559",
        }}
      />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {() => (
            <SessionProvider session={session}>
              {/* Display the content */}
              <div className={`${dosis.variable} font-sans`}>
                <Component {...pageProps} />
              </div>
            </SessionProvider>
          )}
        </PersistGate>
      </Provider>
    </>
  )
}

MyApp.getInitialProps = async (appContext) => {
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
