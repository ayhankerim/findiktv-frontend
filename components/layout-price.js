import { useEffect, useState, Fragment } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { useDispatch } from "react-redux"
import { updateAds } from "@/store/advertisements"
import { isMobile } from "react-device-detect"
import { Popover, Transition } from "@headlessui/react"
import { TbChevronDown } from "react-icons/tb"
import Navbar from "./elements/navbar"
import Footer from "./elements/footer"
import NotificationBanner from "./elements/notification-banner"

const Loader = () => (
  <div className="lds-ellipsis">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)

const Advertisement = dynamic(
  () => import("@/components/elements/advertisement"),
  {
    loading: () => <Loader />,
    ssr: false,
  }
)
const Breadcrumb = dynamic(() => import("@/components/elements/breadcrumb"), {
  loading: () => <Loader />,
})
const AverageCard = dynamic(
  () => import("@/components/elements/price/average-card"),
  {
    loading: () => <Loader />,
  }
)
const ArticleShare = dynamic(() => import("@/components/elements/share"), {
  loading: () => <Loader />,
  ssr: false,
})
const PriceChart = dynamic(() => import("@/components/elements/price/chart"), {
  loading: () => <Loader />,
})
const CityPriceList = dynamic(
  () => import("@/components/elements/price/city-price-list"),
  {
    loading: () => <Loader />,
  }
)
const LatestPriceEntries = dynamic(
  () => import("@/components/elements/price/latest-price-entries"),
  {
    loading: () => <Loader />,
  }
)
const TermlyPriceChange = dynamic(
  () => import("@/components/elements/price/termly-price-changes"),
  {
    loading: () => <Loader />,
  }
)
const AddPrice = dynamic(() => import("@/components/elements/price/addPrice"), {
  loading: () => <Loader />,
  ssr: false,
})
const ArticleMostVisited = dynamic(
  () => import("@/components/elements/article/articles-most-visited"),
  {
    loading: () => <Loader />,
    ssr: false,
  }
)
const EfficiencyCalculation = dynamic(
  () => import("@/components/elements/price/priceCalculator"),
  {
    loading: () => <Loader />,
  }
)
const ArticleDates = dynamic(() => import("@/components/elements/date"), {
  loading: () => <Loader />,
})
const LatestArticles = dynamic(
  () => import("@/components/elements/latest-articles"),
  {
    loading: () => <Loader />,
    ssr: false,
  }
)
const ArticleComments = dynamic(
  () => import("@/components/elements/comments/comments"),
  {
    loading: () => <Loader />,
    ssr: false,
  }
)
const LatestComments = dynamic(
  () => import("@/components/elements/comments/latest-comments"),
  {
    loading: () => <Loader />,
    ssr: false,
  }
)

const pricetypes = [
  {
    name: "Borsa Fiyatları",
    title: "Fındık Fiyatları",
    id: "stockmarket",
    url: "fiyatlari",
  },
  {
    name: "Serbest Piyasa Fiyatları",
    title: "Serbest Piyasa Fındık Fiyatları",
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

const Layout = ({
  children,
  global,
  priceTypeSelection,
  productContent,
  priceData,
  productContext,
  advertisement,
}) => {
  const { navbar, footer, notificationBanner } = global.attributes

  const [bannerIsShown, setBannerIsShown] = useState(true)
  const [priceType, setPriceType] = useState(pricetypes[priceTypeSelection])
  const [cityList, setCityList] = useState(null)
  const dispatch = useDispatch()
  useEffect(() => {
    const citydata = [
      ...new Set(
        priceData.data.map((q) => q.attributes.city.data?.attributes.title)
      ),
    ]
    setCityList(citydata)
    advertisement && dispatch(updateAds(advertisement))
  }, [advertisement, dispatch, priceData.data])

  const breadcrumbElement = [
    { title: "ÜRÜNLER", slug: "/urunler" },
    {
      title: priceType.title.toLocaleUpperCase("tr"),
      slug: "/urunler/" + productContext.slug + "/fiyatlari",
    },
  ]
  return (
    <div className="flex flex-col flex-grow justify-between min-h-screen">
      {/* Aligned to the top */}
      <div className="flex flex-col">
        {notificationBanner && bannerIsShown && (
          <NotificationBanner
            data={notificationBanner}
            closeSelf={() => setBannerIsShown(false)}
          />
        )}
        <Navbar navbar={navbar} pageContext={productContext} />

        <main className="container gap-4 pt-2 bg-white">
          <div className="w-full">
            <Breadcrumb items={breadcrumbElement} />
            <div className="flex flex-col md:flex-row items-center justify-between">
              <h1 className="font-extrabold text-xxl">{priceType.title}</h1>
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={`
                ${open ? "" : "text-opacity-90"}
                group inline-flex items-center rounded-md bg-orange-700 px-3 py-2 text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                    >
                      <span>{priceType.name.toLocaleUpperCase("tr")}</span>
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
                              <Link
                                key={item.name}
                                //onClick={() => setPriceType(pricetypes[i])}
                                href={`/urunler/${productContext.slug}/${item.url}`}
                                className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                              >
                                <div className="ml-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.name.toLocaleUpperCase("tr")}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>
            <article className="font-semibold text-lg text-darkgray">
              {productContent.summary}
            </article>
          </div>
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
            <div className="flex flex-col flex-1 w-full gap-3">
              <AverageCard cardData={priceData} />
              {!isMobile && (
                <>
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
                </>
              )}
              {priceType.id !== "tmo" && !isMobile && (
                <>
                  <TermlyPriceChange
                    type={priceType.id}
                    product={productContext.slug}
                    priceData={priceData}
                  />
                  <div className="w-full h-[300px] lg:h-[120px] -mx-2 sm:mx-0">
                    <Advertisement position="price-page-middle-3" />
                  </div>
                </>
              )}
              {priceType.id !== "tmo" && (
                <>
                  <CityPriceList
                    product={productContext.slug}
                    priceData={priceData}
                    cityList={cityList}
                  />
                  <LatestPriceEntries priceData={priceData} />
                </>
              )}
            </div>
            <aside className="sticky top-2 flex-none w-full lg:w-[250px] xl:w-[336px]">
              <AddPrice product={productContent.id} cityData="" />
              {!isMobile && <ArticleMostVisited size={5} slug={null} />}
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
              <div className="mb-2 relative h-[320px] lg:h-[500px] -mx-4 sm:mx-0 lg:mx-0">
                <Image
                  src={productContent.featured.data.attributes.url}
                  alt={`${productContent.title} Fiyatları`}
                  className="md:rounded-lg"
                  fill
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhZPQAIhwMsJ60FNgAAAABJRU5ErkJggg=="
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
              <>{children}</>
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
                slug={`${process.env.NEXT_PUBLIC_SITE_URL}/urunler/${productContext.slug}/fiyatlari`}
                infinite={false}
                city={null}
              />
            </div>
            {!isMobile && (
              <aside className="sticky top-2 flex-none w-full xl:w-[336px]">
                <LatestComments size={5} position="sidebar" offset={0} />
              </aside>
            )}
          </div>
        </main>
      </div>
      {/* Aligned to the bottom */}
      <Footer footer={footer} />
    </div>
  )
}

export default Layout
