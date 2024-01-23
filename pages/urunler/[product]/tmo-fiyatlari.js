import React from "react"
import {
  getProductData,
  getAllPricesData,
  getAdsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import { getPriceCard, getPriceEntries, getGraphData } from "@/utils/api-prices"
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
    metaTitle: "TMO Fındık Fiyatları",
    metaDescription:
      "Toprak Mahsülleri Ofisi tarafından üreticiye desteklemek amacıyla fındık alımının yapıldığı Hükûmet yetkilileri tarafından belirlenen fiyatları buradan öğrenebilirsiniz.",
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
    ...metadataUpdated,
  }
  const breadcrumbElement = [
    { title: "ÜRÜNLER", slug: "/urunler" },
    {
      title: `TOPRAK MAHSÜLLERİ OFİSİ ${productContent.title.toLocaleUpperCase(
        "tr"
      )} FİYATLARI`,
      slug: "/urunler/" + productContext.slug + "/fiyatlari",
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
      title: `${productContent.title} Fiyatları`,
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
    slug: "/urunler/" + productContext.slug + "/tmo-fiyatlari",
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
      priceTypeSelection={3}
      productContent={productContent}
      priceCardData={priceCardData}
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
  const priceType = ["tmo"]
  const approvalStatus = ["approved"]
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
  const priceCard = await getPriceCard({
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
      lastEntriesData: lastEntries,
      graphData: graphData,
      productContext: {
        ...productContext,
        //localizedPaths,
      },
    },
    revalidate: 60 * 60 * 24 * 30,
  }
}

export default DynamicProducts
