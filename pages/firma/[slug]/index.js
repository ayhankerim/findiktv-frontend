import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { getAdsData, getEditors, fetchAPI, getGlobalData } from "@/utils/api"
import { getFirmData } from "@/utils/api-firms"
import { turkeyApi } from "@/utils/turkiye-api"
import {
  getPriceCard,
  getUserLastPrice,
  getGraphData,
} from "@/utils/api-prices"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import VideoEmbed from "@/components/elements/video-embed"
import AverageCard from "@/components/elements/price/average-card-new"
import LatestArticles from "@/components/elements/article/latest-firm-articles"
import CityPriceList from "@/components/sections/city-price-list"
import Link from "next/link"
import Image from "next/image"
import Slider from "react-slick"
import { PatternFormat } from "react-number-format"
import Tooltip from "@/components/elements/tooltip"
import { LocalBusinessJsonLd } from "next-seo"
import {
  MdLocationPin,
  MdPhone,
  MdAlternateEmail,
  MdLink,
} from "react-icons/md"
import { RiEditBoxLine, RiAddFill } from "react-icons/ri"
import { FcApproval } from "react-icons/fc"
import Moment from "moment"
import "moment/locale/tr"
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"
import "slick-carousel/slick/slick.css"
import { slugify } from "@/utils/slugify"

const Loader = ({ cssClass }) => (
  <div className={`lds-ellipsis ${cssClass}`}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)
const PriceChart = dynamic(
  () => import("@/components/elements/price/chart-new"),
  {
    loading: () => <Loader cssClass="h-[400px]" />,
  }
)
function SampleNextArrow(props) {
  const { className, style, onClick } = props
  return (
    <div
      className={`${className} ${
        className.indexOf("slick-disabled") !== -1
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
      } absolute flex z-10 items-center inset-y-0 right-0`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <BsChevronRight className="text-xxl text-white drop-shadow self-center" />
    </div>
  )
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props
  return (
    <div
      className={`${className} ${
        className.indexOf("slick-disabled") !== -1
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
      } absolute flex z-10 items-center inset-y-0 left-0`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <BsChevronLeft className="text-xxl text-white drop-shadow self-center" />
    </div>
  )
}
const Gallery = ({ firmContent }) => {
  const settings = {
    dots: false,
    speed: 500,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    slidesToShow: firmContent.gallery.data.length > 2 ? 2 : 1,
    slidesToScroll: 1,
    initialSlide: 0,
    infinite: false,
    responsive: [
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  }
  return (
    <div className="relative w-full left-0 top-0 h-[200px] sm:h-[300px] overflow-y-hidden lg:flex flex-col">
      {firmContent.gallery.data.length > 0 ? (
        <Slider {...settings}>
          {firmContent.gallery.data.map((item, i) => (
            <article key={item.id}>
              <Link href={`${item.attributes.url}`} target="_blank">
                <div className="relative mx-auto w-full h-[300px] overflow-hidden bg-white">
                  <Image
                    src={item.attributes.formats.small.url}
                    alt={`${firmContent.name} Galeri Görseli ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                    priority={i < 2 ? true : false}
                    fill
                  />
                </div>
              </Link>
            </article>
          ))}
        </Slider>
      ) : (
        <div className="relative mx-auto w-full h-[300px] overflow-hidden">
          <Image
            src="https://www.findiktv.com/cdn-cgi/imagedelivery/A_vnS-Tfmrf1TT32XC1EgA/b875adcf-38b8-4458-84fb-8de2245bbc00/format=auto,width=1200"
            alt="Şirket"
            className="absolute inset-0 h-full w-full object-cover"
            priority={true}
            fill
          />
        </div>
      )}
    </div>
  )
}

const Address = ({ firmContent }) => {
  const { data: session } = useSession()
  return (
    <address className="flex flex-col not-italic gap-2">
      {firmContent.fullname && (
        <div className="flex items-center gap-2">
          <h2 className="font-bold">{firmContent.fullname}</h2>
        </div>
      )}
      <div className="flex items-center gap-2">
        <MdLocationPin />
        {firmContent.address && firmContent.address[0]?.address ? (
          <a
            href={firmContent?.address[0]?.googleMaps}
            target="_blank"
            rel="nofollow"
          >
            {firmContent.address[0].address}{" "}
            {firmContent.address[0].provinceId &&
              firmContent.address[0].provinceId &&
              turkeyApi.provinces
                .find((item) => item.id === firmContent.address[0].provinceId)
                .districts.find(
                  (d) => d.id === firmContent.address[0].districtId
                ).name}{" "}
            {firmContent.address[0].provinceId &&
              turkeyApi.provinces.find(
                (item) => item.id === firmContent.address[0].provinceId
              ).name}
          </a>
        ) : (
          <span className="text-midgray">Adres girilmemiş</span>
        )}
      </div>
      <div className="flex flex-wrap justify-between items-center gap-x-8 gap-y-2">
        <div className="flex items-center gap-2">
          <MdPhone />
          {firmContent.phone ? (
            <a className="hover:underline" href={`tel:+90${firmContent.phone}`}>
              <PatternFormat
                format="+90 (###) ### ## ##"
                value={firmContent.phone}
                displayType="text"
              />
            </a>
          ) : (
            <span className="text-midgray">Telefon girilmemiş</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <MdAlternateEmail />
          {firmContent.email ? (
            <a
              className="hover:underline"
              target="_blank"
              href={`mailto:${firmContent.email}`}
            >
              <span>{firmContent.email}</span>
            </a>
          ) : (
            <span>E-posta adresi girilmemiş</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <MdLink />
          {firmContent.website ? (
            <a
              className="hover:underline"
              target="_blank"
              rel="nofollow"
              href={getValidUrl(firmContent.website)}
            >
              <span>{firmContent.website.replace(/^https?:\/\//, "")}</span>
            </a>
          ) : (
            <span className="text-midgray">Web adresi girilmemiş</span>
          )}
        </div>
      </div>
    </address>
  )
}
const LocalBusSeo = ({ firmContent }) => {
  const areaServedArray = firmContent.servicePoints
    ? firmContent.servicePoints[0].provinces.map((province) => ({
        geoMidpoint: {
          latitude: turkeyApi.provinces.find((item) => item.id === province.id)
            ?.coordinates.latitude,
          longitude: turkeyApi.provinces.find((item) => item.id === province.id)
            ?.coordinates.longitude,
        },
        geoRadius: "40000",
      }))
    : null
  return (
    <LocalBusinessJsonLd
      type="Store"
      id={firmContent.slug}
      name={firmContent.name}
      description={firmContent.description}
      url={`http://www.findiktv.com/firma/${firmContent.slug}`}
      telephone={`+90${firmContent.phone}`}
      address={{
        streetAddress: firmContent.address
          ? firmContent.address[0]?.address
          : "",
        addressLocality:
          firmContent.address &&
          firmContent.address[0].provinceId &&
          firmContent.address[0]?.districtId
            ? turkeyApi.provinces
                .find((a) => a.id === firmContent.address[0].provinceId)
                .districts.find(
                  (d) => d.id === firmContent.address[0].districtId
                ).name
            : "",
        addressRegion:
          firmContent.address && firmContent.address[0].provinceId
            ? turkeyApi.provinces.find(
                (item) => item.id === firmContent.address[0].provinceId
              ).name
            : "",
        addressCountry: "TR",
      }}
      geo={{
        latitude: firmContent.address ? firmContent.address[0]?.latitude : "",
        longitude: firmContent.address ? firmContent.address[0]?.longitude : "",
      }}
      images={[firmContent.gallery.data.map((item, i) => item.attributes.url)]}
      sameAs={[firmContent.website]}
      areaServed={areaServedArray}
    />
  )
}
const getValidUrl = (url = "") => {
  let newUrl = decodeURI(url)
  newUrl = newUrl.trim().replace(/\s/g, "")

  if (/^(:\/\/)/.test(newUrl)) {
    return `http${newUrl}`
  }
  if (!/^(f|ht)tps?:\/\//i.test(newUrl)) {
    return `http://${newUrl}`
  }

  return newUrl
}
const DynamicFirms = ({
  firmContent,
  priceCardData,
  lastPriceDate,
  graphData,
  preview,
  global,
  advertisement,
  firmContext,
}) => {
  const router = useRouter()
  const [isEditor, setIsEditor] = useState(false)
  const { data: session } = useSession()
  useEffect(() => {
    async function fetchData() {
      const isEditor =
        session &&
        (await getEditors({
          user: session.id,
        }))
      setIsEditor(isEditor)
    }
    fetchData()
  }, [session, session?.id])
  if (!router.isFallback && !firmContent) {
    return {
      notFound: true,
    }
  }

  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const metadata = {
    id: 1,
    metaTitle: `${firmContent.name}`,
    metaDescription: `${firmContent.description}`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: "/firma/" + firmContext.slug,
    datePublished: Moment(firmContext.createdAt).toISOString(),
    dateModified: Moment(firmContext.updatedAt).toISOString(),
    tags: [],
  }
  const priceCity = lastPriceDate
    ? {
        title: `${Moment(lastPriceDate.attributes?.date).format(
          "DD-MM-YYYY"
        )} Tarihli ${firmContent.name} Fındık Fiyatları`,
        description: `Bu liste ${firmContent.name} firmasına ait fiyatları gösterir.`,
        date: Moment(lastPriceDate.attributes?.date).format("YYYY-MM-DD"),
        product: {
          data: {
            id: process.env.NEXT_PUBLIC_FINDIK_ID,
            attributes: {
              slug: "findik",
            },
          },
        },
        priceType: "all",
        approvalStatus: "all",
      }
    : null

  return (
    <Layout global={global} pageContext={firmContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <LocalBusSeo firmContent={firmContent} />
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-col items-end justify-between border rounded-xl border-lightgray">
              <Gallery firmContent={firmContent} />
              <div className="flex flex-col sm:flex-row w-full gap-4 p-4">
                <div className="w-full md:w-3/12 relative top-[-30px] lg:top-[-100px] mb-[-20px] lg:mb-[-80px]">
                  <div className="group relative mx-auto w-full h-[200px] overflow-hidden rounded bg-white shadow-lg">
                    <Image
                      src={
                        firmContent.logo.data
                          ? firmContent.logo.data.attributes.formats.small.url
                          : "https://www.findiktv.com/cdn-cgi/imagedelivery/A_vnS-Tfmrf1TT32XC1EgA/7bbe9bd7-c876-4387-bd6f-a01dcaec5400/format=auto,width=250"
                      }
                      alt={firmContent.name}
                      className="absolute inset-0 h-full w-full object-contain rounded p-2 z-10"
                      priority={true}
                      fill
                    />
                    {session &&
                      (session.id == firmContent.user.data?.id || isEditor) && (
                        <div className="absolute flex justify-center items-center w-full h-full group-hover:bg-white/50 z-0 group-hover:z-20">
                          <Link
                            className="bg-secondary/80 py-2 px-4 text-white rounded hover:bg-secondary"
                            href={`/firma/${firmContent.slug}/gorsel-duzenle`}
                          >
                            Düzenle
                          </Link>
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex flex-col w-full md:w-9/12 gap-2">
                  <div className="flex flex-row w-full items-center justify-between">
                    <div className="flex flex-col w-full">
                      <div className="flex flex-col lg:flex-row w-full justify-between gap-2 items-start">
                        <div className="flex items-center gap-2">
                          <h1 className="font-semibold text-xl text-dark">
                            {firmContent.name}
                            {firmContent.user.data?.id &&
                              firmContent.user.data.attributes.confirmed && (
                                <div className="inline-block ml-2 text-lg">
                                  <Tooltip
                                    orientation="bottom"
                                    tooltipText="Sayfa firma yetkilisi tarafından yönetiliyor"
                                  >
                                    <FcApproval />
                                  </Tooltip>
                                </div>
                              )}
                          </h1>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p>
                          {firmContent.description}
                          {session &&
                            session.id == firmContent.user.data?.id && (
                              <span className="text-midgray">
                                {!firmContent.description &&
                                  "Kısa açıklama/slogan girilmemiş"}
                              </span>
                            )}
                        </p>
                        <p className="mb-4">
                          <Link
                            href={`/firma/sektor/${firmContent.firm_category.data.attributes.slug}`}
                            className="text-secondary font-bold hover:underline"
                          >
                            {firmContent.firm_category.data.attributes.name}
                          </Link>
                        </p>
                      </div>
                      <Address firmContent={firmContent} />
                      {session &&
                        (session.id == firmContent.user.data?.id ||
                          isEditor) && (
                          <div className="flex flex-row flex-wrap mt-2 gap-2">
                            <Link
                              href={`/firma/${firmContent.slug}/duzenle`}
                              className="flex border items-center rounded-md px-2 py-1 text-sm hover:shadow-lg"
                            >
                              <RiEditBoxLine
                                className="mr-2 text-sm text-secondary"
                                aria-hidden="true"
                              />
                              Düzenle
                            </Link>
                            {firmContent.firm_category.data.attributes.slug ===
                              "findik-alim-satim" && (
                              <>
                                <Link
                                  href={`/firma/${firmContent.slug}/fiyat-ekle`}
                                  className="flex whitespace-nowrap border items-center rounded-md px-2 py-1 text-sm hover:shadow-lg"
                                >
                                  <RiAddFill
                                    className="mr-2 text-sm text-secondary"
                                    aria-hidden="true"
                                  />
                                  Fiyat Gir
                                </Link>
                                <Link
                                  href={`/firma/${firmContent.slug}/fiyatlar`}
                                  className="flex whitespace-nowrap border items-center rounded-md px-2 py-1 text-sm hover:shadow-lg"
                                >
                                  Fiyatlar
                                </Link>
                              </>
                            )}
                          </div>
                        )}
                      {!firmContent.user.data?.id && (
                        <div className="flex flex-row mt-2 gap-2">
                          <Link
                            href={`/firma/${firmContent.slug}/sahiplen`}
                            className="flex whitespace-nowrap border items-center rounded-md px-2 py-1 text-sm bg-primary text-white hover:shadow-lg"
                          >
                            Bu işletmeyi sahiplenin
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
              <div id="about" className="flex flex-col lg:w-2/3 mb-8">
                <div className="flex flex-row items-center justify-between border-b border-secondary/20 relative">
                  <h2 className="font-semibold text-base text-midgray">
                    Firma Hakkında
                  </h2>
                  <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
                </div>
                <article
                  className="NewsContent firmPage min-h-[20vh] mt-5 md:mt-4 pb-4 border-b border-secondary/20"
                  dangerouslySetInnerHTML={{
                    __html: firmContent.about
                      ? firmContent.about
                      : "<p class='text-midgray'>İçerik girilmemiş</p>",
                  }}
                />
              </div>
              <div id="servicePoints" className="flex flex-col lg:w-1/3 mb-8">
                <div className="flex flex-row items-center justify-between border-b border-secondary/20 relative">
                  <h2 className="font-semibold text-base text-midgray">
                    Hizmet Noktaları
                  </h2>
                  {session &&
                    (session.id == firmContent.user.data?.id || isEditor) && (
                      <Link
                        href={`/firma/${firmContent.slug}/hizmet-noktalari`}
                        className="underline text-secondary"
                      >
                        Düzenle
                      </Link>
                    )}
                  <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
                </div>
                <div className="min-h-[8vh] mt-5 md:mt-4 pb-4 border-b border-secondary/20">
                  {firmContent.servicePoints &&
                  firmContent.servicePoints[0].provinces[0] ? (
                    <ul className="flex flex-col gap-2 divide-y divide-secondary/20">
                      {firmContent.servicePoints[0].provinces[0].id !== 999 ? (
                        firmContent.servicePoints[0].provinces.map(
                          (province, i) => {
                            const provinceData = turkeyApi.provinces.find(
                              (item) => item.id === province.id
                            )
                            return (
                              <li key={i} className="flex gap-2">
                                <Link
                                  href={`/firma/konum/${slugify(
                                    provinceData.name
                                  )}`}
                                  className="min-w-[80px] font-bold underline hover:no-underline"
                                >
                                  {provinceData.name}
                                </Link>
                                {province.districts.length > 0 ? (
                                  <ul className="flex flex-wrap gap-2">
                                    {province.districts.map((districtId, j) => (
                                      <li key={j}>
                                        {
                                          turkeyApi.provinces
                                            .find(
                                              (item) => item.id === province.id
                                            )
                                            .districts.find(
                                              (district) =>
                                                district.id === districtId
                                            )?.name
                                        }
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>Tüm ilçeler</p>
                                )}
                              </li>
                            )
                          }
                        )
                      ) : (
                        <li>Tüm Türkiye</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-midgray">Belirtilmemiş</p>
                  )}
                </div>
              </div>
            </div>
            {firmContent.firm_category.data.attributes.slug ===
              "findik-alim-satim" &&
              firmContent.user.data &&
              priceCity && (
                <div id="prices" className="flex flex-col mb-8">
                  <div className="flex flex-row items-center justify-between border-b border-secondary/20 relative mb-8">
                    <h2 className="font-semibold text-base text-midgray">
                      {firmContent.name} Fındık Alım Fiyatı
                    </h2>
                    <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
                  </div>
                  {priceCardData && (
                    <AverageCard priceCardData={priceCardData} />
                  )}
                  <CityPriceList data={priceCity} user={firmContent.user} />
                  <PriceChart grapghData={graphData} />
                </div>
              )}
            <div id="Video" className="flex flex-col mb-8">
              <div className="flex flex-row items-center justify-between border-b border-secondary/20 relative">
                <h2 className="font-semibold text-base text-midgray">Video</h2>
                <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
              </div>
              {firmContent.video ? (
                <VideoEmbed data={firmContent.video} />
              ) : (
                <div className="min-h-[20vh] mt-5 md:mt-4 border-b border-secondary/20">
                  <p className="text-midgray">Video girilmemiş</p>
                </div>
              )}
            </div>
            <div id="FirmNews" className="flex flex-col mb-8">
              <div className="flex flex-row items-center justify-between border-b border-secondary/20 relative">
                <h2 className="font-semibold text-base text-midgray">
                  Firma Haberleri
                </h2>
                {session &&
                  (session.id == firmContent.user.data?.id || isEditor) && (
                    <Link
                      href={`/firma/${firmContent.slug}/haber-ekle`}
                      className="underline text-secondary"
                    >
                      Haber Ekle
                    </Link>
                  )}
                <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
              </div>
              {firmContent.articles.data.length > 0 ? (
                <LatestArticles latestArticles={firmContent.articles} />
              ) : (
                <div className="min-h-[20vh] mt-5 md:mt-4 border-b border-secondary/20">
                  <p className="text-midgray">Haber girilmemiş</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticPaths(context) {
  // Get all pages from Strapi
  const firms = await context.locales.reduce(
    async (currentfirmsPromise, locale) => {
      const currentfirms = await currentfirmsPromise
      const localefirms = await fetchAPI("/firms", {
        locale,
        fields: ["slug"],
      })
      return [...currentfirms, ...localefirms.data]
    },
    Promise.resolve([])
  )

  const paths = firms.map((firm) => {
    const { slug } = firm.attributes
    // Decompose the slug that was saved in Strapi
    const slugArray = !slug ? false : slug

    return {
      params: { slug: slugArray },
    }
  })

  return { paths, fallback: "blocking" }
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale } = context
  const priceType = ["stockmarket", "openmarket", "tmo"]
  const approvalStatus = ["approved", "adjustment"]
  const priceQualities = ["Sivri", "Levant", "Giresun"]

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()
  const firmData = await getFirmData({
    slug: params.slug,
  })

  if (firmData == null || firmData.attributes.publishedAt == null) {
    return {
      notFound: true,
    }
  }

  const {
    name,
    slug,
    description,
    about,
    firm_category,
    logo,
    gallery,
    video,
    fullname,
    address,
    email,
    website,
    phone,
    user,
    articles,
    servicePoints,
    createdAt,
    updatedAt,
    publishedAt,
  } = firmData.attributes

  const firmContent = {
    id: firmData.id,
    name,
    slug,
    description,
    about,
    firm_category,
    logo,
    gallery,
    video,
    fullname,
    address,
    email,
    website,
    phone,
    user,
    articles,
    servicePoints,
    createdAt,
    updatedAt,
    publishedAt,
  }

  const firmContext = {
    locale,
    locales,
    defaultLocale,
    slug,
    createdAt,
    updatedAt,
  }
  const priceCard = user.data
    ? await getPriceCard({
        product: "findik",
        priceType: priceType,
        priceQualities: priceQualities,
        approvalStatus: approvalStatus,
        user: user.data?.id,
      })
    : priceQualities.map((a) => ({
        name: a,
        date1: null,
        date2: null,
        value1: null,
        value2: null,
      }))
  const userLastPriceDate = user.data
    ? await getUserLastPrice({
        user: user.data.id,
      })
    : null
  const graphData = user.data
    ? await getGraphData({
        product: "findik",
        priceType: priceType,
        approvalStatus: approvalStatus,
        user: user.data?.id,
      })
    : []
  return {
    props: {
      firmContent: firmContent,
      priceCardData: priceCard,
      lastPriceDate: userLastPriceDate,
      graphData: graphData,
      advertisement: advertisement,
      global: globalLocale.data,
      firmContext: {
        ...firmContext,
      },
    },
    revalidate: 60 * 60 * 4,
  }
}

export default DynamicFirms
