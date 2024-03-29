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
  getDefaultPriceValues,
} from "@/utils/api-prices"
import { useRouter } from "next/router"
import Seo from "@/components/elements/seo"
import Layout from "@/components/layout-price"
import Moment from "moment"
import "moment/locale/tr"

const DynamicProducts = ({
  productContent,
  advertisement,
  metadata,
  global,
  priceCardData,
  priceCitiesData,
  priceDefaultsData,
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
    metaTitle: "Borsa Fındık Fiyatları",
    metaDescription:
      "Her gün güncellenen Fındık fiyatları bu sayfada karşınızda. Ordu, Giresun, Trabzon, Samsun, Çarşamba, Sakarya, Zonguldak, Ünye, Fatsa, Terme, Düzce ve Akçakoca borsa fiyatları burada...",
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
    ...metadataUpdated,
  }
  const breadcrumbElement = [
    { title: "ÜRÜNLER", slug: "/urunler" },
    {
      title: `BORSA ${productContent.title.toLocaleUpperCase("tr")} FİYATLARI`,
      slug: "/urunler/" + productContext.slug + "/borsa-fiyatlari",
    },
  ]
  const pricetypes = [
    {
      name: "Fındık Fiyatları",
      title: `${productContent.title} Fiyatları`,
      id: "all",
      url: "fiyatlari",
    },
    {
      name: "Borsa Fiyatları",
      title: `Borsa ${productContent.title} Fiyatları`,
      id: "stockmarket",
      url: "borsa-fiyatlari",
    },
    {
      name: "Serbest Piyasa Fiyatları",
      title: `Serbest Piyasa ${productContent.title} Fiyatları`,
      id: "openmarket",
      url: "serbest-piyasa-fiyatlari",
    },
    {
      name: "TMO Fiyatları",
      title: "TMO Fındık Fiyatları",
      id: "tmo",
      url: "tmo-fiyatlari",
    },
  ]
  const articleSeoData = {
    slug: "/urunler/" + productContext.slug + "/borsa-fiyatlari",
    datePublished: Moment(
      lastEntriesData?.[0].attributes.createdAt
    ).toISOString(),
    dateModified: Moment(
      lastEntriesData?.[0].attributes.updatedAt
    ).toISOString(),
    tags: [],
  }
  return (
    <Layout
      global={global}
      pageContext={productContext}
      pricetypes={pricetypes}
      priceTypeSelection={1}
      productContent={productContent}
      priceCardData={priceCardData}
      priceCitiesData={priceCitiesData}
      priceDefaultsData={priceDefaultsData}
      termlyPricesData={termlyPricesData}
      lastEntriesData={lastEntriesData}
      graphData={graphData}
      productContext={productContext}
      breadcrumbElement={breadcrumbElement}
      advertisement={advertisement}
    >
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
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
  const priceType = ["stockmarket"]
  const approvalStatus = ["approved"]
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
    approvalStatus: approvalStatus,
  })
  const priceCities = await getCitiesPrice({
    product: params.product,
    priceType: priceType,
    priceQualities: priceQualities,
    approvalStatus: approvalStatus,
  })

  const priceDefaults = await getDefaultPriceValues({
    product: params.product,
    type: priceType,
    priceQualities: priceQualities,
    approvalStatus: approvalStatus,
  })

  const termlyPrices = await getTermlyPriceList({
    product: params.product,
    priceType: priceType,
    priceQualities: priceQualities,
    approvalStatus: approvalStatus,
  })

  const lastEntries = await getPriceEntries({
    product: params.product,
    priceType: priceType,
    approvalStatus: approvalStatus,
  })

  const graphData = await getGraphData({
    product: params.product,
    priceType: priceType,
    approvalStatus: approvalStatus,
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
      priceDefaultsData: priceDefaults,
      termlyPricesData: termlyPrices,
      lastEntriesData: lastEntries,
      graphData: graphData,
      productContext: {
        ...productContext,
        //localizedPaths,
      },
    },
    revalidate: 60 * 60 * 24,
  }
}

export default DynamicProducts
