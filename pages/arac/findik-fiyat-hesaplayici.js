import React from "react"
import { getGlobalData } from "@/utils/api"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import LatestComments from "@/components/elements/comments/latest-comments"
import ArticleMostVisited from "@/components/elements/article/articles-most-visited"
import PriceCalculator from "@/components/elements/price/priceCalculator"

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
  return (
    <Layout global={global} pageContext={null}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
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
              <PriceCalculator title={false} />
            </div>
          </div>
          <aside className="sticky top-2 flex-none w-full md:w-[336px] lg:w-[250px] xl:w-[336px]">
            <ArticleMostVisited size={10} slug={null} />
            <LatestComments size={5} position="sidebar" offset={0} />
          </aside>
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
    revalidate: 24 * 60 * 60,
  }
}

export default RandimanHesaplama
