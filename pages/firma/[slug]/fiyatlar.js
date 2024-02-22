import React, { useState } from "react"
import { useRouter } from "next/router"
import { getSession } from "next-auth/react"
import { getFirmData, getGlobalData } from "@/utils/api"
import { getUserEnteredPrices, updatePrice } from "@/utils/api-prices"
import toast, { Toaster } from "react-hot-toast"
import { BiLoaderCircle } from "react-icons/bi"
import Tooltip from "@/components/elements/tooltip"
import { RiArrowGoBackFill } from "react-icons/ri"
import Link from "next/link"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import Moment from "moment"
import "moment/locale/tr"

const notify = (type, message) => {
  if (type === "success") {
    toast.success(message)
  } else if (type === "error") {
    toast.error(message)
  }
}

const PriceItem = ({ item }) => {
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const formatter = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  })
  const removePrice = async (price) => {
    setLoading(true)
    try {
      await updatePrice(price)
      setDeleted(true)
      notify("success", "Fiyat kaldırıldı, teşekkür ederiz.")
    } catch (err) {
      console.error(err)
      notify("error", "Fiyat kaldırılırken bir sorunla karşılaştık!")
    }
    setLoading(false)
  }
  return (
    <div
      className={`p-2 mb-2 border ${
        item.attributes.approvalStatus === "ignored" || deleted
          ? "bg-danger/10"
          : ""
      } border-lightgray`}
    >
      <div className="grid lg:grid-cols-7 gap-3 items-center">
        <div className="col-span">
          <span className="inline-block lg:hidden mr-2">Minimum Fiyat:</span>
          {formatter.format(item.attributes.min)}
        </div>
        <div className="col-span">
          <span className="inline-block lg:hidden mr-2">Maksimum Fiyat:</span>
          {formatter.format(item.attributes.max)}
        </div>
        <div className="col-span">
          <span className="inline-block lg:hidden mr-2">Ortalama Fiyat:</span>
          {formatter.format(item.attributes.average)}
        </div>
        <div className="col-span">
          {item.attributes.city.data.attributes.title}
        </div>
        <div className="col-span">
          <span className="inline-block">
            <Tooltip
              orientation="bottom"
              tooltipText={Moment(item.attributes.date).format("LLLL")}
            >
              {Moment(item.attributes.date).format("LL")}
            </Tooltip>
          </span>
        </div>
        <div className="col-span">
          {item.attributes.approvalStatus === "ignored" || deleted
            ? "Silindi"
            : ""}
        </div>
        <div className="col-span">
          <button
            className={`disabled:opacity-75 w-full ${
              item.attributes.approvalStatus === "ignored" || deleted
                ? "hidden"
                : "bg-danger hover:bg-danger/90"
            } text-sm text-white rounded p-2 text-base transition duration-150 ease-out md:ease-in`}
            type="button"
            onClick={() => removePrice(item.id)}
            disabled={item.attributes.approvalStatus === "ignored"}
          >
            {loading ? (
              <span role="status">
                <BiLoaderCircle className="inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                <span className="sr-only">Kaydediliyor ...</span>
                <span>Kaydediliyor...</span>
              </span>
            ) : (
              <span>Sil</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const FirmAddPrice = ({ firmContent, global, lastEntries, firmContext }) => {
  const router = useRouter()

  const metadata = {
    id: 1,
    metaTitle: `Son Girdiğiniz Fiyatlar`,
    metaDescription: `Son Girdiğiniz Fiyatlar`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: `/firma/${firmContent.slug}/fiyatlar`,
    datePublished: Moment(firmContent.publishedAt).toISOString(),
    dateModified: Moment(firmContent.updatedAt).toISOString(),
    tags: [],
  }
  if (!router.isFallback && !firmContent) {
    return {
      notFound: true,
    }
  }

  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }
  return (
    <Layout global={global} pageContext={firmContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-col p-4">
              <div className="w-full">
                <div className="flex justify-between">
                  <h1 className="font-semibold text-xl text-dark">
                    Son Girdiğiniz Fiyatlar
                  </h1>
                </div>
                {lastEntries.length > 0 ? (
                  <>
                    <Toaster position="top-right" reverseOrder={false} />
                    <div className="hidden lg:block px-4 py-5 sm:p-6 lg:px-4 lg:py-5">
                      <div className="grid grid-cols-7 items-end text-center p-2 gap-3">
                        <div className="col-span">
                          <label
                            htmlFor="AddMinimumPriceprice"
                            className="block text-sm font-medium text-gray-900"
                          >
                            Minimum
                            <br />
                            Fiyat
                          </label>
                        </div>
                        <div className="col-span">
                          <label
                            htmlFor="AddMaximumPriceprice"
                            className="block text-sm font-medium text-gray-900"
                          >
                            Maksimum
                            <br />
                            Fiyat
                          </label>
                        </div>
                        <div className="col-span">
                          <label
                            htmlFor="AddAveragePriceprice"
                            className="block text-sm font-medium text-gray-900"
                          >
                            Ortalama
                            <br />
                            Fiyat
                          </label>
                        </div>
                        <div className="col-span">
                          <label
                            htmlFor="AddPricecity"
                            className="block text-sm font-medium text-gray-900"
                          >
                            Şehir
                          </label>
                        </div>
                        <div className="col-span">
                          <label
                            htmlFor="AddPricedate"
                            className="block text-sm font-medium text-gray-900"
                          >
                            Tarih
                          </label>
                        </div>
                        <div className="col-span">
                          <label className="block text-sm font-medium text-gray-900">
                            Durum
                          </label>
                        </div>
                      </div>
                    </div>
                    {lastEntries.map((item, i) => {
                      return <PriceItem item={item} key={i} />
                    })}
                  </>
                ) : (
                  <div className="text-base my-4">Hiç fiyat girilmemiş</div>
                )}
              </div>
              <div className="flex gap-2 mb-6">
                <div className="flex flex-col">
                  <Link
                    className="w-full bg-midgray hover:bg-midgray/90 text-white rounded p-2 text-sm transition duration-150 ease-out md:ease-in"
                    href={`/firma/${firmContent.slug}`}
                  >
                    <RiArrowGoBackFill className="mr-2 inline-block align-middle w-4 h-4 text-gray-200" />
                    <span>Geri dön</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  const { params, locale, locales, defaultLocale } = context
  const type = ["openmarket"]
  const approvalStatus = ["adjustment", "ignored"]
  const globalLocale = await getGlobalData(locale)
  const session = await getSession(context)
  if (session == null) {
    return {
      redirect: {
        destination: "/hesap/giris-yap?redirect=",
        permanent: false,
      },
    }
  }
  const firmData = await getFirmData({
    slug: params.slug,
  })

  const { name, slug } = firmData.attributes

  const lastEntries = await getUserEnteredPrices({
    product: "findik",
    type: type,
    minDate: Moment().subtract(2, "days").format(),
    approvalStatus: approvalStatus,
    user: session.id,
  })

  const firmContent = {
    id: firmData.id,
    name,
    slug,
  }
  const firmContext = {
    locale,
    locales,
    defaultLocale,
    slug: params.slug,
  }
  if (firmData == null) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      global: globalLocale.data,
      firmContent: firmContent,
      lastEntries: lastEntries,
      firmContext: {
        ...firmContext,
      },
    },
  }
}

export default FirmAddPrice
