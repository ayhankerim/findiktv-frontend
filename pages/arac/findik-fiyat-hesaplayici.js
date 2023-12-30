import React from "react"
import { getGlobalData } from "@/utils/api"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import PriceCalculator from "@/components/elements/price/priceCalculator"
import SimpleSidebar from "@/components/elements/simple-sidebar"

const RandimanHesaplama = ({ global }) => {
  const metadata = {
    id: 1,
    metaTitle: "Fındık Fiyat Hesaplayıcı | FINDIK TV",
    metaDescription:
      "Güncel piyasa fiyatlarından ya da kendi belirleyeceğiniz fiyat üzerinden ve randıman da belirleyerek elinize geçecek ücreti hesaplayabileceğiniz bir araçtır.",
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: "/arac/findik-fiyat-hesaplayici",
    datePublished: "2023-02-21T21:16:43.786Z",
    dateModified: "2023-02-21T21:16:43.786Z",
    tags: [],
  }
  return (
    <Layout global={global} pageContext={null}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-row items-end justify-between border-b border-midgray">
              <h1 className="font-semibold text-xl text-darkgray">
                FINDIK <span className="text-midgray">FİYAT HESAPLAYICI</span>
              </h1>
            </div>
            <div className="flex flex-col -mx-2">
              <PriceCalculator />
            </div>
          </div>
          <SimpleSidebar />
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const { locale } = context
  const globalLocale = await getGlobalData(locale)

  return {
    props: {
      global: globalLocale.data,
    },
    revalidate: 60 * 60 * 24 * 30,
  }
}

export default RandimanHesaplama
