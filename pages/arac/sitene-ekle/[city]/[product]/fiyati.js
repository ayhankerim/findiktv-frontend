import React from "react"
import { fetchAPI, getGlobalData } from "@/utils/api"
import { getLastCityPrice } from "@/utils/api-add-site"
import { useRouter } from "next/router"
import { NextSeo } from "next-seo"
import { MdTrendingFlat, MdTrendingUp, MdTrendingDown } from "react-icons/md"
import Layout from "@/components/layout-add-site"
import Moment from "moment"
import "moment/locale/tr"

const PriceColor = (current, old) => {
  if (!Number(current) || !Number(old)) return "text-nochange"
  if (current > old) {
    return "text-up"
  } else if (current < old) {
    return "text-down"
  } else {
    return "text-nochange"
  }
}
const PriceIcon = (current, old) => {
  if (!Number(current) || !Number(old)) return ""
  if (current > old) {
    return <MdTrendingUp className="text-lg inline-block" />
  } else if (current < old) {
    return <MdTrendingDown className="text-lg inline-block" />
  } else {
    return <MdTrendingFlat className="text-lg inline-block" />
  }
}
function currencyFormatter(value) {
  if (!Number(value)) return ""

  const amount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value)
  return amount
}
const DynamicCityPrice = ({ prices }) => {
  const router = useRouter()
  if (!router.isFallback && !prices) {
    return {
      notFound: true,
    }
  }
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }
  return (
    <Layout>
      <NextSeo
        title={`${prices.LevantPrice[0].attributes.city.data.attributes.title} ${prices.LevantPrice[0].attributes.product.data.attributes.title} Fiyatı | FINDIK TV`}
        description="Şehir şehir fındık fiyatlarını gösteren, sitene ekle özelliği sayfasıdır."
        noindex={true}
      />
      <div className="flex group justify-between items-center min-w-[250px] max-w-[720px] p-2 bg-white border">
        <h1 className="flex flex-col">
          <span className="text-xl leading-none font-bold">
            {prices.LevantPrice[0].attributes.city.data.attributes.title.toLocaleUpperCase(
              "tr"
            )}
          </span>
          <a
            href="https://www.findiktv.com/urunler/findik/fiyatlari"
            title="Fındık Fiyatları"
            className="text-base group-hover:underline"
          >
            {prices.LevantPrice[0].attributes.product.data.attributes.title.toLocaleUpperCase(
              "tr"
            )}{" "}
            FİYATI
          </a>
          <span className="text-sm">
            {Moment(prices.LevantPrice[0].attributes.date)
              .format("DD.MM.YYYY")
              .toLocaleUpperCase("tr")}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1 items-center">
            <div className="text-lg">
              {currencyFormatter(prices.GiresunPrice[0].attributes.max)}
            </div>
            <hr className="w-[50px] border-midgray" />
            <div className="text-lg">
              {currencyFormatter(prices.SivriPrice[0].attributes.min)}
            </div>
          </div>
          <div
            className={`flex flex-col items-center ${PriceColor(
              prices.SivriPrice[0]?.attributes.average ||
                0 + prices.LevantPrice[0]?.attributes.average ||
                0 + prices.GiresunPrice[0]?.attributes.average,
              prices.SivriPrice[1]?.attributes.average ||
                0 + prices.LevantPrice[1]?.attributes.average ||
                0 + prices.GiresunPrice[1]?.attributes.average ||
                0
            )}`}
          >
            {PriceIcon(
              prices.SivriPrice[0]?.attributes.average ||
                0 + prices.LevantPrice[0]?.attributes.average ||
                0 + prices.GiresunPrice[0]?.attributes.average ||
                0,
              prices.SivriPrice[1]?.attributes.average ||
                0 + prices.LevantPrice[1]?.attributes.average ||
                0 + prices.GiresunPrice[1]?.attributes.average ||
                0
            )}
          </div>
        </div>
      </div>
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
  const priceType = ["openmarket", "stockmarket"]
  const { params, locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)

  if (params.city == null || params.product == null) {
    return {
      notFound: true,
    }
  }

  const SivriPrice = await getLastCityPrice({
    city: params.city,
    product: params.product,
    quality: "Sivri",
    type: priceType,
    locale,
  })

  const LevantPrice = await getLastCityPrice({
    city: params.city,
    product: params.product,
    quality: "Levant",
    type: priceType,
    locale,
  })

  const GiresunPrice = await getLastCityPrice({
    city: params.city,
    product: params.product,
    quality: "Giresun",
    type: priceType,
    locale,
  })

  const productContext = {
    locale,
    locales,
    defaultLocale,
  }
  return {
    props: {
      prices: {
        SivriPrice,
        LevantPrice,
        GiresunPrice,
      },
      global: globalLocale.data,
      productContext: {
        ...productContext,
      },
    },
    revalidate: 60 * 60 * 4,
  }
}

export default DynamicCityPrice
