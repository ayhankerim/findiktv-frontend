import React from "react"
import { getGlobalData } from "@/utils/api"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import LatestComments from "@/components/elements/comments/latest-comments"
import ArticleMostVisited from "@/components/elements/article/articles-most-visited"

const TarsimPrimHesaplama = ({ global }) => {
  const metadata = {
    id: 1,
    metaTitle: "Tarsim Prim Hesaplama | FINDIK TV",
    metaDescription:
      "Fındık bahçenizi TARSİM ile sigortalamak istiyorsanız ödemeniz gereken prim rakamını ve herhangi bir afet durumunda alacağınız rakamı buradan öğrenebilirsiniz.",
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
                TARSİM <span className="text-midgray">PRİM HESAPLAMA</span>
              </h1>
            </div>
            <div className="flex flex-wrap -mx-2">
              <iframe
                className="w-full"
                width={800}
                height={800}
                title="Tarsim Prim Hesaplama"
                src="https://web.tarsim.gov.tr/ftarsim/OrnekAgacPrimHesap.ss?_method_=beginApplication&_programId_=195"
              ></iframe>
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
    revalidate: 15,
  }
}

export default TarsimPrimHesaplama
