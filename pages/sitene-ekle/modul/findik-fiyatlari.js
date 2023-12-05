import React from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { getGlobalData } from "@/utils/api"
import { getCitiesPrice } from "@/utils/api-prices"
import Layout from "@/components/layout-clean"
import Seo from "@/components/elements/seo"

const Loader = ({ cssClass }) => (
  <div className={`lds-ellipsis ${cssClass}`}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)

const CityPriceList = dynamic(
  () => import("@/components/elements/price/city-price-list-new"),
  {
    loading: () => <Loader cssClass="h-[60px]" />,
  }
)

const SiteneEkle = ({ global, priceCitiesData }) => {
  const metadata = {
    id: 1,
    metaTitle: "Sitene Ekle | FINDIK TV",
    metaDescription:
      "Web sitenizde kullanabileceğiniz kullanışlı modüller; fındık fiyatlar ve şehir şehir fındık fiyat modülü ve fındık haberleri modülleri ile sitenizi zenginleştirin.",
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const Slider = dynamic(() => import("react-slick"), {
    loading: () => <p>Yükleniyor...</p>,
    ssr: false,
  })

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
      <main className="flex flex-col justify-between gap-4 pt-2 md:flex-row md:flex-nowrap gap-2 align-top pb-0">
        <div className="w-full">
          <CityPriceList product={"findik"} priceData={priceCitiesData} />
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const { locale } = context
  const globalLocale = await getGlobalData(locale)

  const priceType = "stockmarket"
  const priceQualities = ["Sivri", "Levant", "Giresun"]
  const priceCities = await getCitiesPrice({
    product: "findik",
    priceType: priceType,
    priceQualities: priceQualities,
  })

  return {
    props: {
      global: globalLocale.data,
      priceCitiesData: priceCities,
    },
    revalidate: 24 * 60 * 60,
  }
}

export default SiteneEkle
