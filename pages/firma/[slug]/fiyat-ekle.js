import React, { useState } from "react"
import { useRouter } from "next/router"
import { getSession, useSession } from "next-auth/react"
import { fetchAPI, getGlobalData } from "@/utils/api"
import { getFirmData, getCityCode, createCity } from "@/utils/api-firms"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import { NumericFormat } from "react-number-format"
import { BiLoaderCircle } from "react-icons/bi"
import { turkeyApi } from "@/utils/turkiye-api"
import { slugify } from "@/utils/slugify"
import { RiArrowGoBackFill } from "react-icons/ri"
import Link from "next/link"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import Moment from "moment"
import "moment/locale/tr"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}
const notify = (type, message) => {
  if (type === "success") {
    toast.success(message)
  } else if (type === "error") {
    toast.error(message)
  }
}

const FirmAddPrice = ({ firmContent, global, firmContext }) => {
  const [loading, setLoading] = useState(false)
  const [productQuality, setProductQuality] = useState("Levant")
  const [priceType, setPriceType] = useState("openmarket")
  const { data: session } = useSession()
  const router = useRouter()

  const metadata = {
    id: 1,
    metaTitle: `Firma Profilini Düzenle`,
    metaDescription: `Firma Profilini Düzenle`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: `/firma/${firmContent.slug}/duzenle`,
    datePublished: Moment(firmContent.publishedAt).toISOString(),
    dateModified: Moment(firmContent.updatedAt).toISOString(),
    tags: [],
  }
  if (!router.isFallback && !firmContent) {
    return {
      notFound: true,
    }
  }

  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const addPriceSchema = yup.object().shape({
    minimum_price: yup
      .string()
      .required("Fiyat girmeniz gereklidir!")
      .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
        var number = Number(
          parseInt(value ? value.replaceAll(".", "").slice(1) : 0)
        )
        if (number > 200 || number < 1) {
          return false
        } else {
          return true
        }
      }),
    maximum_price: yup
      .string()
      .required("Fiyat girmeniz gereklidir!")
      .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
        var number = Number(
          parseInt(value ? value.replaceAll(".", "").slice(1) : 0)
        )
        if (number > 200 || number < 1) {
          return false
        } else {
          return true
        }
      }),
    average_price: yup
      .string()
      .required("Fiyat girmeniz gereklidir!")
      .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
        var number = Number(
          parseInt(value ? value.replaceAll(".", "").slice(1) : 0)
        )
        if (number > 200 || number < 1) {
          return false
        } else {
          return true
        }
      }),
    date: yup.date().max(new Date(), "Geçerli bir tarih giriniz!"),
    volume: yup
      .string()
      .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
        var number = Number(
          parseInt(value ? value.replaceAll(".", "").slice(0, -3) : 1)
        )
        if (number > 999999 || number < 1) {
          return false
        } else {
          return true
        }
      }),
    efficiency: yup
      .string()
      .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
        var number = Number(parseInt(value ? value.replaceAll(",", ".") : 0))
        if (number > 60 || number < 40) {
          return false
        } else {
          return true
        }
      }),
    term: yup
      .bool()
      .oneOf([true], "Yorum yazma kurallarını onaylamanız gereklidir!"),
  })
  const handleButtonClick = (quality, pricetype) => {
    setProductQuality(quality)
    setPriceType(pricetype)
  }
  return (
    <Layout global={global} pageContext={firmContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            {firmContent.servicePoints &&
            firmContent.servicePoints[0].provinces.length > 0 &&
            firmContent.servicePoints[0].provinces[0].id != 999 ? (
              <div className="flex flex-col p-4">
                <div className="w-full">
                  <div className="flex flex-col lg:flex-row gap-2 mb-2 justify-between">
                    <h1 className="font-semibold text-xl text-dark">
                      Fiyat Gir
                    </h1>
                    <div className="flex items-center gap-6">
                      <div className="grid grid-cols-3 items-center justify-end gap-3">
                        <label className="col-span-3 text-center font-bold">
                          Kalite
                        </label>
                        <button
                          className={` ${
                            productQuality === "Sivri" &&
                            "bg-danger text-white border-danger"
                          } border items-center rounded-md px-2 py-1 text-sm hover:shadow-lg`}
                          onClick={() => handleButtonClick("Sivri", priceType)}
                        >
                          Sivri
                        </button>
                        <button
                          className={` ${
                            productQuality === "Levant" &&
                            "bg-danger text-white border-danger"
                          } border items-center rounded-md px-2 py-1 text-sm hover:shadow-lg`}
                          onClick={() => handleButtonClick("Levant", priceType)}
                        >
                          Levant
                        </button>
                        <button
                          className={` ${
                            productQuality === "Giresun" &&
                            "bg-danger text-white border-danger"
                          } border items-center rounded-md px-2 py-1 text-sm hover:shadow-lg`}
                          onClick={() =>
                            handleButtonClick("Giresun", priceType)
                          }
                        >
                          Giresun
                        </button>
                      </div>
                    </div>
                  </div>
                  <Toaster position="top-right" reverseOrder={false} />
                  <div className="hidden lg:block px-2 py-3 sm:p-3 lg:px-2 lg:py-3">
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
                  {firmContent.servicePointsCombined.map((item, index) => {
                    const formatter = new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })
                    const cityData = item.district
                      ? firmContent.systemIds.find(
                          (ab) => ab.attributes.cityCode == item.district
                        )
                      : firmContent.systemIds.find(
                          (ab) => ab.attributes.cityCode == item.province
                        )
                    const cityApi = item.district
                      ? turkeyApi.provinces
                          .find((a) => a.id === parseInt(item.province))
                          .districts.find(
                            (a) => a.id === parseInt(item.district)
                          )
                      : turkeyApi.provinces.find(
                          (a) => a.id === parseInt(item.province)
                        )
                    return (
                      <Formik
                        key={index}
                        enableReinitialize={true}
                        initialValues={{
                          minimum_price: formatter.format(
                            cityData?.attributes[productQuality].data[0]
                              ?.attributes.min || 0
                          ),
                          maximum_price: formatter.format(
                            cityData?.attributes[productQuality].data[0]
                              ?.attributes.max || 0
                          ),
                          average_price: formatter.format(
                            cityData?.attributes[productQuality].data[0]
                              ?.attributes.average || 0
                          ),
                          date: Moment(new Date()).format("YYYY-MM-DD"),
                          volume: "",
                          efficiency: 50,
                        }}
                        validationSchema={addPriceSchema}
                        onSubmit={async (
                          values,
                          { setSubmitting, setErrors, setStatus, resetForm }
                        ) => {
                          setLoading(true)
                          const cityId = !cityData
                            ? await createCity({
                                title: cityApi.name,
                                slug: slugify(cityApi.name),
                                cityCode: cityApi.id,
                                description: `${cityApi.name} Fındık Fiyatları serbest piyasa koşullarında oluşmaktadır. Arz-talep dengesi neticesinde oluşan fiyatlar gün gün değişir. İthalat-ihracat, dolar kuru ve diğer değişkenler ${cityApi.name} Fındık Fiyatlarında dalgalanmaya sebebiyet verir.`,
                              })
                            : cityData.id
                          try {
                            setErrors({ api: null })
                            fetchAPI(
                              `/prices`,
                              {},
                              {
                                method: "POST",
                                body: JSON.stringify({
                                  data: {
                                    date: Moment(values.date)
                                      .utcOffset(3)
                                      .set("hour", Moment().hour())
                                      .set("minute", Moment().minutes())
                                      .set("second", Moment().seconds())
                                      .format("YYYY-MM-DD HH:mm:ss"),
                                    article: null,
                                    min: Number(
                                      values.minimum_price
                                        .substring(1)
                                        .replace(",", ".")
                                    ),
                                    max: Number(
                                      values.maximum_price
                                        .substring(1)
                                        .replace(",", ".")
                                    ),
                                    average: Number(
                                      values.average_price
                                        .substring(1)
                                        .replace(",", ".")
                                    ),
                                    quality: productQuality,
                                    volume: 1,
                                    efficiency: 50,
                                    product: process.env.NEXT_PUBLIC_FINDIK_ID,
                                    approvalStatus: "adjustment",
                                    type: priceType,
                                    city: cityId,
                                    user: session.id,
                                    ip: "",
                                  },
                                }),
                              }
                            )
                            notify(
                              "success",
                              "Fiyat girişiniz alındı, teşekkür ederiz."
                            )
                            resetForm({
                              values: {
                                min: Number(
                                  values.minimum_price
                                    .substring(1)
                                    .replace(",", ".")
                                ),
                                max: Number(
                                  values.maximum_price
                                    .substring(1)
                                    .replace(",", ".")
                                ),
                                average: Number(
                                  values.average_price
                                    .substring(1)
                                    .replace(",", ".")
                                ),
                              },
                            })
                            setStatus("Kaydedildi")
                          } catch (err) {
                            console.error(err)
                            setErrors({ api: err.message })
                          }
                          setLoading(false)
                          setSubmitting(false)
                        }}
                      >
                        {({
                          setFieldValue,
                          errors,
                          touched,
                          values,
                          status,
                        }) => {
                          const handleInputChange = (e, setFieldValue) => {
                            const { name, value } = e.target
                            setFieldValue(name, value)
                            const minPrice = Number(
                              values.minimum_price
                                .substring(1)
                                .replace(",", ".")
                            )
                            const maxPrice = Number(
                              values.maximum_price
                                .substring(1)
                                .replace(",", ".")
                            )
                            const average = (minPrice + maxPrice) / 2
                            setFieldValue(
                              "average_price",
                              formatter.format(average)
                            )
                          }
                          return (
                            <Form
                              className={`p-2 mb-6 lg:mb-2 border ${
                                !item.district && "bg-secondary/5"
                              } ${
                                errors.api
                                  ? "border-danger"
                                  : "border-lightgray"
                              }`}
                            >
                              <div className="grid lg:grid-cols-7 gap-3 items-center">
                                <div className="col-span">
                                  <label className="block lg:hidden text-sm font-medium text-gray-900">
                                    Minimum Fiyat
                                  </label>
                                  <Field
                                    as={NumericFormat}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    autoComplete="off"
                                    prefix={"₺"}
                                    allowNegative={false}
                                    decimalScale={2}
                                    name="minimum_price"
                                    id="AddMinimumPriceprice"
                                    className={classNames(
                                      errors.minimum_price &&
                                        touched.minimum_price
                                        ? "border-danger"
                                        : "border-midgray",
                                      "mt-1 block w-full px-3 py-2 text-right rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    )}
                                    onBlur={(e) =>
                                      handleInputChange(e, setFieldValue)
                                    }
                                  />
                                  {errors.minimum_price &&
                                    touched.minimum_price && (
                                      <>
                                        <p className="text-danger">
                                          {errors.minimum_price}
                                        </p>
                                      </>
                                    )}
                                </div>
                                <div className="col-span">
                                  <label className="block lg:hidden text-sm font-medium text-gray-900">
                                    Maksimum Fiyat
                                  </label>
                                  <Field
                                    as={NumericFormat}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    autoComplete="off"
                                    prefix={"₺"}
                                    allowNegative={false}
                                    decimalScale={2}
                                    name="maximum_price"
                                    id="AddMaximumPriceprice"
                                    className={classNames(
                                      errors.maximum_price &&
                                        touched.maximum_price
                                        ? "border-danger"
                                        : "border-midgray",
                                      "mt-1 block w-full px-3 py-2 text-right rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    )}
                                    onBlur={(e) =>
                                      handleInputChange(e, setFieldValue)
                                    }
                                  />
                                  {errors.maximum_price &&
                                    touched.maximum_price && (
                                      <>
                                        <p className="text-danger">
                                          {errors.maximum_price}
                                        </p>
                                      </>
                                    )}
                                </div>
                                <div className="col-span">
                                  <label className="block lg:hidden text-sm font-medium text-gray-900">
                                    Ortalama Fiyat
                                  </label>
                                  <Field
                                    as={NumericFormat}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    autoComplete="off"
                                    prefix={"₺"}
                                    allowNegative={false}
                                    decimalScale={2}
                                    name="average_price"
                                    id="AddAveragePriceprice"
                                    className={classNames(
                                      errors.average_price &&
                                        touched.average_price
                                        ? "border-danger"
                                        : "border-midgray",
                                      "mt-1 block w-full px-3 py-2 text-right rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    )}
                                  />
                                  {errors.average_price &&
                                    touched.average_price && (
                                      <>
                                        <p className="text-danger">
                                          {errors.average_price}
                                        </p>
                                      </>
                                    )}
                                </div>
                                <div className="col-span">{cityApi.name}</div>
                                <div className="col-span">
                                  <label className="block lg:hidden text-sm font-medium text-gray-900">
                                    Tarih
                                  </label>
                                  <Field
                                    name="date"
                                    id="AddPricedate"
                                    type="date"
                                    className={classNames(
                                      errors.date && touched.date
                                        ? "border-danger"
                                        : "border-midgray",
                                      "mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    )}
                                  />
                                  {errors.date && touched.date && (
                                    <>
                                      <p className="text-danger">
                                        {errors.date}
                                      </p>
                                    </>
                                  )}
                                </div>
                                <div className="col-span">
                                  {status ? status : "-"}
                                </div>
                                <div className="col-span">
                                  {errors.api && (
                                    <div className="text-red-500 text-sm mt-1 ml-2 text-left">
                                      {errors.api}
                                    </div>
                                  )}
                                  <button
                                    className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-sm text-white rounded p-2 text-base transition duration-150 ease-out md:ease-in"
                                    type="submit"
                                    disabled={
                                      loading || status === "Kaydedildi"
                                        ? true
                                        : false
                                    }
                                  >
                                    {loading ? (
                                      <span role="status">
                                        <BiLoaderCircle className="inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                                        <span className="sr-only">
                                          Kaydediliyor ...
                                        </span>
                                        <span>Kaydediliyor...</span>
                                      </span>
                                    ) : (
                                      <span>Kaydet</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </Form>
                          )
                        }}
                      </Formik>
                    )
                  })}
                </div>
                <div className="flex flex-col lg:flex-row items-center gap-2 mb-6">
                  <div className="flex flex-col">
                    <Link
                      className="w-full bg-midgray hover:bg-midgray/90 text-white rounded p-2 text-sm transition duration-150 ease-out md:ease-in"
                      href={`/firma/${firmContent.slug}${
                        firmContent.publishedAt === null ? "/taslak" : ""
                      }`}
                    >
                      <RiArrowGoBackFill className="mr-2 inline-block align-middle w-4 h-4 text-gray-200" />
                      <span>Geri dön</span>
                    </Link>
                  </div>
                  <div>
                    <p>
                      Farklı bir şehir için de fiyat girmek istiyorsanız,{" "}
                      <Link
                        className="font-bold hover:underline text-secondary"
                        href={`/firma/${firmContent.slug}/hizmet-noktalari`}
                      >
                        hizmet noktaları
                      </Link>
                      nızı güncellemeniz gerekmektedir.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-4 min-h-[40vh]">
                <h1 className="font-semibold text-xl text-dark">Fiyat Gir</h1>
                <p className="text-lg">
                  Öncelikle{" "}
                  <Link
                    className="font-bold hover:underline text-secondary"
                    href={`/firma/${firmContent.slug}/hizmet-noktalari`}
                  >
                    hizmet noktası
                  </Link>{" "}
                  girilmesi gereklidir.
                </p>
                <p>
                  <Link
                    className="w-full bg-midgray hover:bg-midgray/90 text-white rounded p-2 text-sm transition duration-150 ease-out md:ease-in"
                    href={`/firma/${firmContent.slug}${
                      firmContent.publishedAt === null ? "/taslak" : ""
                    }`}
                  >
                    <RiArrowGoBackFill className="mr-2 inline-block align-middle w-4 h-4 text-gray-200" />
                    <span>Geri dön</span>
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  const { params, locale, locales, defaultLocale } = context
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

  const { name, slug, servicePoints, firm_category, video, user, publishedAt } =
    firmData.attributes
  const servicePointsCombined = []
  const servicePointsAll = []

  servicePoints &&
    servicePoints[0].provinces.forEach((province) => {
      servicePointsCombined.push({
        province: province.id,
        district: null,
      })
      servicePointsAll.push(province.id)
      province.districts.forEach((district) => {
        servicePointsCombined.push({
          province: province.id,
          district: district,
        })
        servicePointsAll.push(district)
      })
    })

  const systemIds = await getCityCode({
    cityCode: servicePointsAll,
  })

  const firmContent = {
    id: firmData.id,
    name,
    slug,
    servicePoints,
    servicePointsCombined,
    systemIds,
    firm_category,
    video,
    user,
    publishedAt,
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
      firmContext: {
        ...firmContext,
      },
    },
  }
}

export default FirmAddPrice
