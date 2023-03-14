import React, { useState, useEffect, Fragment } from "react"
import ErrorPage from "next/error"
import {
  getProductData,
  getProductAllCitiesData,
  getAdsData,
  //getCommentsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import { useSelector, useDispatch } from "react-redux"
import { updateAds } from "@/store/advertisements"
import { Popover, Transition } from "@headlessui/react"
import { TbChevronDown } from "react-icons/tb"
import Breadcrumb from "@/components/elements/breadcrumb"
import Advertisement from "@/components/elements/advertisement"
import ArticleDates from "@/components/elements/date"
import ViewCounter from "@/components/elements/pageviews"
import ArticleShare from "@/components/elements/share"
import PriceChart from "@/components/elements/price/chart"
import Seo from "@/components/elements/seo"
import Image from "next/image"
import { useRouter } from "next/router"
import Layout from "@/components/layout"
import AverageCard from "@/components/elements/price/average-card"
import CityPriceList from "@/components/elements/price/city-price-list"
import TermlyPriceChange from "@/components/elements/price/termly-price-changes"
import LatestArticles from "@/components/elements/latest-articles"
import ArticleComments from "@/components/elements/comments/comments"
import AddPrice from "@/components/elements/price/addPrice"
import EfficiencyCalculation from "@/components/elements/price/priceCalculator"
import LatestPriceEntries from "@/components/elements/price/latest-price-entries"
import ArticleMostVisited from "@/components/elements/article/articles-most-visited"
import LatestComments from "@/components/elements/comments/latest-comments"

const pricetypes = [
  {
    name: "BORSA FİYATLARI",
    id: "stockmarket",
  },
  {
    name: "SERBEST PİYASA FİYATLARI",
    id: "openmarket",
  },
  {
    name: "TMO FİYATLARI",
    id: "tmo",
  },
]
const DynamicProducts = ({
  productContent,
  advertisement,
  metadata,
  preview,
  global,
  productContext,
  allCities,
}) => {
  const [priceType, setPriceType] = useState(pricetypes[0])
  const [priceData, setPriceData] = useState(null)
  const [cityList, setCityList] = useState(null)
  const dispatch = useDispatch()
  const AllAdvertisements = useSelector((state) => state.advertisement.adsData)

  useEffect(() => {
    fetchAPI("/prices", {
      filters: {
        product: {
          slug: {
            $eq: productContext.slug,
          },
        },
        type: {
          $eq: priceType.id,
        },
        approvalStatus: {
          $eq: "approved",
        },
      },
      fields: ["min", "max", "average", "quality", "volume"],
      populate: {
        city: {
          fields: ["title", "slug"],
        },
      },
      sort: ["date:desc"],
      pagination: {
        start: 0,
        limit: 100,
      },
    }).then((data) => {
      const citydata =
        priceType.id != "tmo"
          ? [
              ...new Set(
                data.data.map((q) => q.attributes.city.data.attributes.title)
              ),
            ]
          : null
      setCityList(citydata)
      setPriceData(data)
    })
    advertisement && dispatch(updateAds(advertisement))
  }, [advertisement, dispatch, priceType, productContext.slug])

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
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const breadcrumbElement = [
    { title: "ÜRÜNLER", slug: "/urunler" },
    {
      title: productContent.title.toLocaleUpperCase("tr") + " FİYATLARI",
      slug: "/urunler/" + productContext.slug + "/fiyatlari",
    },
  ]
  return (
    <Layout global={global} pageContext={productContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      <main className="container gap-4 pt-2 bg-white">
        <div className="w-full">
          <Breadcrumb items={breadcrumbElement} />
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h1 className="font-extrabold text-xxl">
              {productContent.title} Fiyatları
            </h1>
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={`
                ${open ? "" : "text-opacity-90"}
                group inline-flex items-center rounded-md bg-orange-700 px-3 py-2 text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                  >
                    <span>{priceType.name}</span>
                    <TbChevronDown
                      className={`${open ? "" : "text-opacity-70"}
                  ml-2 h-5 w-5 text-orange-300 transition duration-150 ease-in-out group-hover:text-opacity-80`}
                      aria-hidden="true"
                    />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute right-0 z-10 mt-3 w-[16rem] px-4 sm:px-0">
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative grid gap-8 bg-white p-7 grid-cols-1">
                          {pricetypes.map((item, i) => (
                            <Popover.Button
                              key={item.name}
                              onClick={() => setPriceType(pricetypes[i])}
                              className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                            >
                              <div className="ml-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </p>
                              </div>
                            </Popover.Button>
                          ))}
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <AverageCard cardData={priceData} />
            <ArticleShare
              position="articleTop"
              title={`${productContent.title} Fiyatları`}
              slug={`${process.env.NEXT_PUBLIC_SITE_URL}/urunler/${productContext.slug}/fiyatlari`}
            />
            <PriceChart
              type={priceType.id}
              city=""
              product={productContext.slug}
              grapghData={priceData}
            />
            {priceType.id != "tmo" && (
              <>
                <TermlyPriceChange
                  type={priceType.id}
                  product={productContext.slug}
                  priceData={priceData}
                />
                <div className="w-full h-[300px] lg:h-[120px] -mx-4 sm:mx-0">
                  <Advertisement position="price-page-middle-3" />
                </div>
                <CityPriceList
                  product={productContext.slug}
                  priceData={priceData}
                  cityList={cityList}
                />
                <LatestPriceEntries
                  product={productContext.slug}
                  priceData={priceData}
                  cityList={cityList}
                />
              </>
            )}
          </div>
          <aside className="sticky top-2 flex-none w-full lg:w-[250px] xl:w-[336px]">
            <AddPrice
              product={productContent.id}
              cities={allCities}
              cityData=""
            />
            <ArticleMostVisited size={10} slug={null} />
            <EfficiencyCalculation
              product={productContent.id}
              city={null}
              pricetype={priceType.id}
            />
          </aside>
        </div>
        <div className="flex flex-col xl:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            {/* Featured Image or Video Section*/}
            <article className="font-semibold text-lg text-darkgray">
              {productContent.summary}
            </article>
            <div className="mb-2 relative h-[320px] lg:h-[500px] -mx-4 sm:mx-0 lg:mx-0">
              <Image
                src={
                  productContent.featured.data.attributes.formats.large
                    ? productContent.featured.data.attributes.formats.large.url
                    : productContent.featured.data.attributes.formats.medium.url
                }
                alt={`${productContent.title} Fiyatları`}
                className="md:rounded-lg"
                priority={true}
                fill
                sizes="(max-width: 768px) 100vw,
                  (max-width: 800px) 50vw,
                  33vw"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
            <article
              className="NewsContent flex flex-col gap-2 mx-0 -lg:mx-2"
              dangerouslySetInnerHTML={{ __html: productContent.content }}
            />
            <ArticleShare
              position="articleBottom"
              title={`${productContent.title} Fiyatları`}
              slug={`${process.env.NEXT_PUBLIC_SITE_URL}/urunler/${productContext.slug}/fiyatlari`}
            />
            <div className="flex flex-row items-center sm:items-start justify-between mt-4 mb-2">
              <ArticleDates
                publishedAt={priceData?.data[0].attributes.date}
                updatedAt={priceData?.data[0].attributes.date}
              />
              <ViewCounter articleId={productContent.id} pageType="products" />
            </div>
            <LatestArticles
              current={null}
              product={productContent.id}
              city={null}
              count={3}
              offset={0}
              position="bottom"
              headTitle={
                productContent.title.toLocaleUpperCase("tr") + " HABERLERİ"
              }
            />
            <ArticleComments
              article={null}
              product={productContent.id}
              slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${productContent.id}/${productContext.slug}`}
              infinite={false}
              city={null}
            />
          </div>
          <aside className="sticky top-2 flex-none w-full xl:w-[336px]">
            <LatestComments size={5} position="sidebar" offset={0} />
          </aside>
        </div>
      </main>
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
  const productAllCityData = await getProductAllCitiesData({
    product: params.product,
    locale,
  })

  if (productData == null) {
    // Giving the page no props will trigger a 404 page
    return {
      notFound: true,
    }
  }

  // We have the required page data, pass it to the page component
  const { title, content, featured, metadata, localizations, slug } =
    productData.attributes

  const productContent = {
    id: productData.id,
    title,
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

  //const localizedPaths = getLocalizedPaths(productContext)

  return {
    props: {
      productContent: productContent,
      advertisement: advertisement,
      metadata,
      global: globalLocale.data,
      productContext: {
        ...productContext,
        //localizedPaths,
      },
      allCities: productAllCityData,
    },
    revalidate: 60,
  }
}

export default DynamicProducts
