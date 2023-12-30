import React from "react"
import {
  getProductData,
  getProductCityData,
  getAdsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import {
  getPriceCard,
  getTermlyPriceList,
  getPriceEntries,
  getGraphData,
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
    metaTitle: `${metadata.metaTitle} ${productContent.productTitle} Fiyatı`,
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
    ...metadataUpdated,
  }
  const breadcrumbElement = [
    { title: "ÜRÜNLER", slug: "/urunler" },
    {
      title: `${productContent.productTitle.toLocaleUpperCase("tr")} FİYATLARI`,
      slug: `/urunler/${productContent.productSlug}/fiyatlari`,
    },
    {
      title: `${metadata.metaTitle.toLocaleUpperCase(
        "tr"
      )} ${productContent.productTitle.toLocaleUpperCase("tr")} FİYATI`,
      slug: `/urunler/${productContent.productSlug}/${productContext.slug}/fiyati`,
    },
  ]
  const pricetypes = [
    {
      name: `${metadata.metaTitle} ${productContent.productTitle} Borsa Fiyatı`,
      title: `${metadata.metaTitle} ${productContent.productTitle} Fiyatı`,
      id: "stockmarket",
      url: "fiyatlari",
    },
    {
      name: `${productContent.productTitle} Serbest Piyasa Fiyatı`,
      title: `Serbest Piyasa ${productContent.productTitle} ${productContent.productTitle} Fiyatı`,
      id: "openmarket",
      url: "serbest-piyasa-fiyati",
    },
  ]
  const articleSeoData = {
    slug:
      "/urunler/" +
      productContent.productSlug +
      "/" +
      productContext.slug +
      "/fiyati",
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
      priceTypeSelection={0}
      productContent={productContent}
      priceCardData={priceCardData}
      priceCitiesData={null}
      priceDefaultsData={null}
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
  const cities = await context.locales.reduce(
    async (currentCitiesPromise, locale) => {
      const currentCities = await currentCitiesPromise
      const localeCities = await fetchAPI("/cities", {
        locale,
        fields: ["slug", "locale"],
        populate: {
          prices: {
            populate: {
              product: {
                populate: ["slug"],
                fields: ["slug"],
              },
            },
          },
        },
        sort: ["id:desc"],
        pagination: {
          start: 0,
          limit: 1,
        },
      })
      return [...currentCities, ...localeCities.data]
    },
    Promise.resolve([])
  )
  const paths = cities
    .filter((city) => city.attributes.prices.data.length > 0)
    .map((city) => {
      const { slug, locale } = city.attributes
      const { slug: product } =
        city.attributes.prices.data[0].attributes.product.data.attributes
      // Decompose the slug that was saved in Strapi
      const slugArray = !slug ? false : slug
      const productArray = !product ? false : product
      return {
        params: {
          city: slugArray,
          product: productArray,
        },
        // Specify the locale to render
        locale,
      }
    })

  return { paths, fallback: true }
}

export async function getStaticProps(context) {
  const priceType = "stockmarket"
  const { params, locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()

  const productData = await getProductData({
    product: params.product,
    locale,
  })

  const cityData = await getProductCityData({
    city: params.city,
    product: params.product,
    locale,
  })

  if (productData == null || !cityData || cityData == null) {
    return {
      notFound: true,
    }
  }
  const priceQualities = ["Sivri", "Levant", "Giresun"]
  const priceCard = await getPriceCard({
    product: params.product,
    priceType: priceType,
    priceQualities: priceQualities,
    city: cityData.id,
  })

  const termlyPrices = await getTermlyPriceList({
    product: params.product,
    priceType: priceType,
    priceQualities: priceQualities,
    city: cityData.id,
  })

  const lastEntries = await getPriceEntries({
    product: params.product,
    priceType: priceType,
    city: cityData.id,
  })

  const graphData = await getGraphData({
    product: params.product,
    priceType: priceType,
    city: cityData.id,
  })

  // We have the required page data, pass it to the page component
  const { title, content, featured, metadata, localizations, slug } =
    params.city ? cityData.attributes : productData.attributes

  const productContent = {
    id: productData.id,
    title,
    content,
    featured,
    productTitle: productData.attributes.title,
    productSlug: productData.attributes.slug,
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
