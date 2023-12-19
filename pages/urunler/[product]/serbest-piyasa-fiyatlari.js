import React from "react"
import {
  getProductData,
  getAdsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import {
  getPriceCard,
  getCitiesPrice,
  getTermlyPriceList,
  getPriceEntries,
  getGraphData,
} from "@/utils/api-prices"
import { useRouter } from "next/router"
import Seo from "@/components/elements/seo"
import Layout from "@/components/layout-price"

const DynamicProducts = ({
  productContent,
  advertisement,
  metadata,
  global,
  priceCardData,
  priceCitiesData,
  termlyPricesData,
  lastEntriesData,
  graphData,
  productContext,
}) => {
  const router = useRouter()
  // Check if the required data was provided
  if (!router.isFallback && !productContent.content?.length) {
    return {
      notFound: true,
    }
  }

  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  // Merge default site SEO settings with page specific SEO settings
  if (metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataUpdated = {
    metaTitle: "Serbest Piyasa Fındık Fiyatları",
    metaDescription:
      "Her gün güncellenen Serbest Piyasa Fındık fiyatları bu sayfada karşınızda. Ordu, Giresun, Trabzon, Samsun, Çarşamba, Sakarya, Zonguldak, Ünye, Fatsa, Terme, Düzce ve Akçakoca serbest piyasa fiyatları burada...",
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
    ...metadataUpdated,
  }
  return (
    <Layout
      global={global}
      pageContext={productContext}
      priceTypeSelection={1}
      productContent={productContent}
      priceCardData={priceCardData}
      priceCitiesData={priceCitiesData}
      termlyPricesData={termlyPricesData}
      lastEntriesData={lastEntriesData}
      graphData={graphData}
      productContext={productContext}
      advertisement={advertisement}
    >
      <Seo metadata={metadataWithDefaults} />
    </Layout>
  )
}

export async function getStaticPaths(context) {
  // Get all pages from Strapi
  const products = await context.locales.reduce(
    async (currentProductsPromise, locale) => {
      const currentProducts = await currentProductsPromise
      const localeProducts = await fetchAPI("/products", {
        locale,
        fields: ["slug", "locale"],
      })
      return [...currentProducts, ...localeProducts.data]
    },
    Promise.resolve([])
  )

  const paths = products.map((product) => {
    const { slug, locale } = product.attributes
    // Decompose the slug that was saved in Strapi
    const slugArray = !slug ? false : slug

    return {
      params: { product: slugArray },
      // Specify the locale to render
      locale,
    }
  })

  return { paths, fallback: true }
}

export async function getStaticProps(context) {
  const priceType = "openmarket"
  const { params, locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()

  const productData = await getProductData({
    product: params.product,
    locale,
  })

  if (productData == null) {
    // Giving the page no props will trigger a 404 page
    return {
      notFound: true,
    }
  }
  const priceQualities = ["Sivri", "Levant", "Giresun"]
  const priceCard = await getPriceCard({
    product: params.product,
    priceType: priceType,
    priceQualities: priceQualities,
  })
  const priceCities = await getCitiesPrice({
    product: params.product,
    priceType: priceType,
    priceQualities: priceQualities,
  })

  const termlyPrices = await getTermlyPriceList({
    product: params.product,
    priceType: priceType,
    priceQualities: priceQualities,
  })

  const lastEntries = await getPriceEntries({
    product: params.product,
    priceType: priceType,
  })

  const graphData = await getGraphData({
    product: params.product,
    priceType: priceType,
  })

  // We have the required page data, pass it to the page component
  const { title, summary, content, featured, metadata, localizations, slug } =
    productData.attributes

  const productContent = {
    id: productData.id,
    title,
    summary,
    content,
    featured,
  }

  const productContext = {
    locale,
    locales,
    defaultLocale,
    slug,
    localizations,
  }

  return {
    props: {
      productContent: productContent,
      advertisement: advertisement,
      metadata,
      global: globalLocale.data,
      priceCardData: priceCard,
      priceCitiesData: priceCities,
      termlyPricesData: termlyPrices,
      lastEntriesData: lastEntries,
      graphData: graphData,
      productContext: {
        ...productContext,
        //localizedPaths,
      },
    },
    revalidate: 60 * 60 * 4,
  }
}

export default DynamicProducts
