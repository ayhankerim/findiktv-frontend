import React, { useEffect, useState, useCallback } from "react"
import { getSession } from "next-auth/react"
import { useSelector } from "react-redux"
import { useRouter } from "next/router"
import { NumericFormat } from "react-number-format"
import { fetchAPI, getUserData, getGlobalData } from "@/utils/api"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import { BiLoaderCircle } from "react-icons/bi"
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

const PriceEntries = ({ userContent, global, userContext }) => {
  const [cities, setCityList] = useState([])
  const [productQuality, setProductQuality] = useState("Levant")
  const [priceType, setPriceType] = useState("openmarket")
  const userData = useSelector((state) => state.user.userData)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const fetchCityData = useCallback(async (quality, pricetype) => {
    try {
      fetchAPI("/cities", {
        filters: {
          prices: {
            product: {
              id: {
                $eq: process.env.NEXT_PUBLIC_FINDIK_ID,
              },
            },
          },
        },
        fields: ["title", "slug"],
        populate: {
          prices: {
            populate: ["id", "min", "max", "average"],
            filters: {
              type: {
                $eq: pricetype,
              },
              approvalStatus: {
                $eq: "adjustment",
              },
              quality: {
                $eq: quality,
              },
            },
            sort: ["id:desc"],
            pagination: {
              start: 0,
              limit: 1,
            },
          },
        },
        sort: ["title:asc"],
        pagination: {
          start: 0,
          limit: 100,
        },
      }).then((data) => {
        setCityList(data)
      })
    } catch (error) {
      console.error("Error fetching city data:", error)
    }
  }, [])

  useEffect(() => {
    fetchCityData(productQuality, priceType)
  }, [fetchCityData, priceType, productQuality])

  const handleButtonClick = (quality, pricetype) => {
    fetchCityData(quality, pricetype)
    setProductQuality(quality)
    setPriceType(pricetype)
  }

  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const metadata = {
    id: 1,
    metaTitle: `Fiyat Gir | FINDIK TV`,
    metaDescription: `Fiyat Gir`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const loggedInSchema = yup.object().shape({
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

  // Merge default site SEO settings with page specific SEO settings
  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: "/hesap/profil/" + userContent.username + "/duzenle",
    datePublished: "2023-02-21T21:16:43.786Z",
    dateModified: "2023-02-21T21:16:43.786Z",
    tags: [],
  }
  return (
    <Layout global={global} pageContext={userContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-col p-4">
              <div className="w-full">
                <div className="flex justify-between">
                  <h1 className="font-semibold text-xl text-dark">Fiyat Gir</h1>
                  <div className="flex items-center gap-6">
                    <div className="grid grid-cols-2 items-center justify-end gap-3">
                      <label className="col-span-2 text-center font-bold">
                        Tip
                      </label>
                      {/* <button
                        className={` ${
                          priceType === "stockmarket" &&
                          "bg-warning text-white border-warning"
                        } border items-center rounded-md px-2 py-1 text-sm hover:shadow-lg`}
                        onClick={() =>
                          handleButtonClick(productQuality, "stockmarket")
                        }
                      >
                        Borsa Fiyatı
                      </button> */}
                      <button
                        className={` ${
                          priceType === "openmarket" &&
                          "bg-warning text-white border-warning"
                        } border items-center rounded-md px-2 py-1 text-sm hover:shadow-lg`}
                        onClick={() =>
                          handleButtonClick(productQuality, "openmarket")
                        }
                      >
                        Serbest Piyasa Fiyatı
                      </button>
                    </div>
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
                        onClick={() => handleButtonClick("Giresun", priceType)}
                      >
                        Giresun
                      </button>
                    </div>
                  </div>
                </div>
                <Toaster position="top-right" reverseOrder={false} />

                <div className="px-4 py-5 sm:p-6 lg:px-4 lg:py-5">
                  <div className="grid grid-cols-7 p-2 gap-3">
                    <div className="col-span">
                      <label
                        htmlFor="AddMinimumPriceprice"
                        className="block text-sm font-medium text-gray-900"
                      >
                        Min Fiyat
                      </label>
                    </div>
                    <div className="col-span">
                      <label
                        htmlFor="AddMaximumPriceprice"
                        className="block text-sm font-medium text-gray-900"
                      >
                        Max Fiyat
                      </label>
                    </div>
                    <div className="col-span">
                      <label
                        htmlFor="AddAveragePriceprice"
                        className="block text-sm font-medium text-gray-900"
                      >
                        Ort Fiyat
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
                  {cities &&
                    cities.data &&
                    cities.data.map((item, index) => {
                      const formatter = new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })
                      return (
                        <Formik
                          key={index}
                          enableReinitialize={true}
                          initialValues={{
                            minimum_price: item.attributes.prices.data[0]
                              ? formatter.format(
                                  item.attributes.prices.data[0]?.attributes.min
                                )
                              : formatter.format(100),
                            maximum_price: item.attributes.prices.data[0]
                              ? formatter.format(
                                  item.attributes.prices.data[0]?.attributes.max
                                )
                              : formatter.format(100),
                            average_price: item.attributes.prices.data[0]
                              ? formatter.format(
                                  item.attributes.prices.data[0]?.attributes
                                    .average
                                )
                              : formatter.format(100),
                            date: Moment(new Date()).format("YYYY-MM-DD"),
                            volume: "",
                            efficiency: 50,
                          }}
                          validationSchema={loggedInSchema}
                          onSubmit={async (
                            values,
                            { setSubmitting, setErrors, setStatus }
                          ) => {
                            setLoading(true)
                            try {
                              setErrors({ api: null })
                              fetchAPI(
                                `/prices/${item.attributes.prices.data[0]?.id}`,
                                {},
                                {
                                  method: "PUT",
                                  body: JSON.stringify({
                                    data: {
                                      date: Moment(values.date)
                                        .utcOffset(3)
                                        .set("hour", Moment().hour())
                                        .set("minute", Moment().minutes())
                                        .set("second", Moment().seconds())
                                        .format("YYYY-MM-DD HH:mm:ss"),
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
                                  }),
                                }
                              )
                              notify(
                                "success",
                                "Fiyat girişiniz alındı, teşekkür ederiz."
                              )
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
                                className={`p-2 mb-2 border ${
                                  errors.api
                                    ? "border-danger"
                                    : "border-lightgray"
                                }`}
                              >
                                <div className="grid grid-cols-7 gap-3 items-center">
                                  <div className="col-span">
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
                                  <div className="col-span">
                                    {item.attributes.title}
                                  </div>
                                  <div className="col-span">
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
                                      disabled={loading}
                                    >
                                      {loading ? (
                                        <span role="status">
                                          <BiLoaderCircle className="inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                                          <span className="sr-only">
                                            Güncelleniyor...
                                          </span>
                                          <span>Güncelleniyor...</span>
                                        </span>
                                      ) : (
                                        <span>Güncelle</span>
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  const { params, locale } = context
  const globalLocale = await getGlobalData(locale)
  const session = await getSession(context)
  const userData = await getUserData({
    username: params.username,
  })

  if (userData === null) {
    return { props: {} }
  }
  const { username, role } = userData.attributes

  const userContent = {
    id: userData.id,
    username,
    role,
  }

  if (session == null) {
    return {
      redirect: {
        destination: "/hesap/giris-yap",
        permanent: false,
      },
    }
  }
  return {
    props: {
      userContent: userContent,
      global: globalLocale.data,
    },
  }
}

export default PriceEntries
