import React from "react"
import {
  getProductData,
  getAllPricesData,
  getAdsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import {
  getLastPriceDate,
  getPreviousPriceDate,
  getPriceValues,
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
  priceData,
  priceCardData,
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
    metaTitle: "TMO Fındık Fiyatları",
    metaDescription:
      "Toprak Mahsülleri Ofisi tarafından üreticiye desteklemek amacıyla fındık alımının yapıldığı hukümet yetkilileri tarafından belirlenen fiyatları buradan öğrenebilirsiniz.",
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
      priceTypeSelection={2}
      productContent={productContent}
      priceData={priceData}
      priceCardData={priceCardData}
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
  const priceType = "tmo"
  const { params, locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()
  //const comments = params ? await getCommentsData(params.id) : null
  //console.log(JSON.stringify(comments))
  // Fetch pages. Include drafts if preview mode is on
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
  const pricess = await getAllPricesData({
    product: params.product,
    type: priceType,
    limit: Number(String(process.env.NEXT_PUBLIC_PRICE_LIMIT)),
  })
  const priceQualities = ["Sivri", "Levant", "Giresun"]
  let priceCardArray = []
  for (let i = 0; i < priceQualities.length; i++) {
    const latestPricedate = await getLastPriceDate({
      product: params.product,
      type: priceType,
      quality: priceQualities[i],
    })
    const PreviousPricedate = await getPreviousPriceDate({
      product: params.product,
      type: priceType,
      date: Moment(latestPricedate)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .toISOString(),
      quality: priceQualities[i],
    })
    const getPriceValue = await getPriceValues({
      product: params.product,
      type: priceType,
      minDate: Moment(latestPricedate)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .toISOString(),
      maxDate: Moment(latestPricedate)
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 59)
        .toISOString(),
      quality: priceQualities[i],
    })
    let priceSum = 0
    let totalvolume = 0
    getPriceValue.map((item) => {
      priceSum = item.attributes.average * item.attributes.volume + priceSum
      totalvolume = item.attributes.volume + totalvolume
    })
    const averageSum = priceSum / totalvolume
    const getPrevPriceValue = await getPriceValues({
      product: params.product,
      type: priceType,
      minDate: Moment(PreviousPricedate)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .toISOString(),
      maxDate: Moment(PreviousPricedate)
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 59)
        .toISOString(),
      quality: priceQualities[i],
    })
    let pricePrevSum = 0
    let totalPrevvolume = 0
    getPrevPriceValue.map((item) => {
      pricePrevSum =
        item.attributes.average * item.attributes.volume + pricePrevSum
      totalPrevvolume = item.attributes.volume + totalPrevvolume
    })
    const averagePrevSum = pricePrevSum / totalPrevvolume
    priceCardArray.push({
      name: priceQualities[i],
      date1: latestPricedate,
      date2: PreviousPricedate,
      value1: averageSum,
      value2: averagePrevSum,
    })
  }

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
      priceData: pricess,
      priceCardData: priceCardArray,
      productContext: {
        ...productContext,
        //localizedPaths,
      },
    },
    revalidate: 60 * 60,
  }
}

export default DynamicProducts
