import React, { useEffect, useState, useRef } from "react"
import { getSession } from "next-auth/react"
import Link from "next/link"
import Select from "react-select"
import { useRouter } from "next/router"
import { turkeyApi } from "@/utils/turkiye-api"
import { fetchAPI, getGlobalData } from "@/utils/api"
import { getFirmData } from "@/utils/api-firms"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import { BiLoaderCircle } from "react-icons/bi"
import { RiArrowGoBackFill, RiCloseCircleLine } from "react-icons/ri"
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

const PriceEntries = ({ global, firmContent, firmContext }) => {
  const [cities, setCityList] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const provinceRef = useRef(null)
  const districtRef = useRef(null)

  const metadata = {
    id: 1,
    metaTitle: `Hizmet Noktaları`,
    metaDescription: `Hizmet noktalarını düzenle`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: `/firma/${firmContent.slug}/hizmet-noktalari`,
    datePublished: Moment(firmContent.publishedAt).toISOString(),
    dateModified: Moment(firmContent.updatedAt).toISOString(),
    tags: [],
  }

  useEffect(() => {
    setCityList(
      firmContent.servicePoints ? firmContent.servicePoints[0].provinces : []
    )
  }, [firmContent.servicePoints])

  if (!router.isFallback && !firmContent) {
    return {
      notFound: true,
    }
  }
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const servicePointsSchema = yup.object().shape({
    province: yup
      .string()
      .ensure()
      .required("Lütfen seçiniz!")
      .oneOf(
        [turkeyApi.provinces.map((item) => item.id.toString()), "999"],
        "Lütfen seçiniz!"
      ),
    district: yup
      .array()
      .min(1, "İlçe seçiniz!")
      .of(
        yup.object().shape({
          label: yup.string().required(),
          value: yup.string().required(),
        })
      ),
  })
  const deleteCity = async (province, district) => {
    setLoading(true)
    const newCityList = district
      ? cities.map((item) => {
          if (item.id === province) {
            item.districts = item.districts.filter((a) => a !== district)
          }
          return item
        })
      : cities.filter((item) => item.id !== province)
    try {
      await fetchAPI(
        `/firms/${firmContent.id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify({
            data: {
              servicePoints: [
                {
                  provinces: newCityList,
                },
              ],
            },
          }),
        }
      )
      setCityList(newCityList)
      notify("success", "Başarıyla silindi.")
    } catch (err) {
      console.error(err)
      notify("error", "Bilgileriniz kaydedilirken bir sorunla karşılaştık.")
    }
    setLoading(false)
  }
  return (
    <Layout global={global} pageContext={firmContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-col">
              <div className="w-full mb-12">
                <div className="flex justify-between">
                  <h1 className="font-semibold text-xl text-dark">
                    Hizmet Noktaları
                  </h1>
                  <div className="flex gap-2 mb-6">
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
                  </div>
                </div>
                <Toaster position="top-right" reverseOrder={false} />
                <div className="grid grid-cols-3 p-2 gap-3">
                  <div className="col-span">
                    <label className="block text-sm font-medium text-gray-900">
                      Hizmet verilen İLLER
                    </label>
                  </div>
                  <div className="col-span">
                    <label className="block text-sm font-medium text-gray-900">
                      Hizmet verilen İLÇELER
                    </label>
                  </div>
                  <div className="col-span">
                    <label className="block text-sm font-medium text-gray-900"></label>
                  </div>
                </div>
                <Formik
                  initialValues={{
                    province: "",
                    district: [],
                  }}
                  validationSchema={servicePointsSchema}
                  onSubmit={async (
                    values,
                    { setSubmitting, setErrors, resetForm }
                  ) => {
                    console.log(values)
                    setLoading(true)
                    cities.push({
                      id: parseInt(values.province),
                      districts:
                        values.district.value === 0 ||
                        values.district.find((p) => p.value === 0)
                          ? []
                          : values.district.map((a) => parseInt(a.value)),
                    })
                    try {
                      setErrors({ api: null })
                      await fetchAPI(
                        `/firms/${firmContent.id}`,
                        {},
                        {
                          method: "PUT",
                          body: JSON.stringify({
                            data: {
                              servicePoints: [
                                {
                                  provinces: cities.sort((a, b) => a.id - b.id),
                                },
                              ],
                            },
                          }),
                        }
                      )
                      notify("success", "Başarıyla eklendi.")
                      provinceRef.current.clearValue()
                      resetForm({
                        values: {
                          province: "",
                          district: [],
                        },
                      })
                    } catch (err) {
                      console.error(err)
                      notify(
                        "error",
                        "Bilgileriniz kaydedilirken bir sorunla karşılaştık."
                      )
                      setErrors({ api: err.message })
                    }

                    setLoading(false)
                    setSubmitting(false)
                  }}
                >
                  {({
                    errors,
                    touched,
                    values,
                    isSubmitting,
                    setFieldValue,
                    setFieldTouched,
                  }) => (
                    <Form className="grid lg:grid-cols-4 bg-lightgray p-2 gap-3">
                      <div className="col-span">
                        <Select
                          ref={provinceRef}
                          classNames={{
                            control: (state) =>
                              "w-full text-base focus:outline outline-offset-2 outline-secondary/30 px-2 border !rounded-none",
                          }}
                          classNamePrefix="react-select"
                          isDisabled={cities.length > 0 && cities[0].id === 999}
                          isLoading={loading}
                          isClearable={true}
                          isSearchable={true}
                          name="province"
                          placeholder="İl Seçiniz"
                          options={[
                            { value: 999, label: "Tüm İller" },
                            ...turkeyApi.provinces.map((item) => ({
                              value: item.id,
                              label: item.name,
                              isDisabled: cities.find((a) => a.id === item.id),
                            })),
                          ]}
                          onBlur={() => setFieldTouched("province", true)}
                          onChange={(p) => {
                            setFieldValue("province", p?.value || "")
                            setFieldValue("district", "")
                            districtRef.current.clearValue()
                          }}
                        />
                        {errors.province && touched.province && (
                          <p className="text-danger">{errors.province}</p>
                        )}
                      </div>
                      <div className="col-span lg:col-span-2">
                        <Select
                          ref={districtRef}
                          isMulti
                          classNames={{
                            control: (state) =>
                              "w-full text-base focus:outline outline-offset-2 outline-secondary/30 px-2 border !rounded-none",
                          }}
                          classNamePrefix="react-select"
                          isLoading={loading}
                          isClearable={true}
                          isSearchable={true}
                          isDisabled={values.province === ""}
                          name="district"
                          placeholder="İlçe Seçiniz"
                          options={[
                            { value: 0, label: "Tüm İlçeler" },
                            ...(turkeyApi.provinces
                              .find(
                                (province) =>
                                  province.id === parseInt(values.province)
                              )
                              ?.districts.map((item) => ({
                                value: item.id,
                                label: item.name,
                                isDisabled: cities.find(
                                  (a) => a.id === item.id
                                ),
                              })) || []),
                          ]}
                          onChange={(e) => {
                            console.log("b", values.province, values.district)
                            setFieldTouched("district", true)
                            setFieldValue(
                              "district",
                              e.map((d) => ({
                                value: d.value,
                                label: d.label,
                              }))
                            )
                          }}
                        />
                        <p>Birden çok seçim yapabilirsiniz</p>
                        {errors.district && touched.district && (
                          <p className="text-danger">{errors.district}</p>
                        )}
                      </div>
                      <div className="col-span">
                        <button
                          className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-2 text-base transition duration-150 ease-out md:ease-in"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <span role="status">
                              <BiLoaderCircle className="mr-2 inline-block align-middle w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                              <span className="sr-only">Ekleniyor...</span>
                              <span>Ekleniyor...</span>
                            </span>
                          ) : (
                            <span>Ekle</span>
                          )}
                        </button>
                      </div>

                      {errors.api && (
                        <p className="col-span-3 text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                          {errors.api}
                        </p>
                      )}
                    </Form>
                  )}
                </Formik>
                {cities.length > 0 ? (
                  cities.map((item, i) => {
                    return (
                      <div
                        key={i}
                        className={`p-2 mb-2 border border-lightgray`}
                      >
                        <div className="grid lg:grid-cols-4 gap-3 items-center">
                          <div className="col-span">
                            {item.id !== 999
                              ? turkeyApi.provinces.find(
                                  (a) => a.id === parseInt(item.id)
                                ).name
                              : "TÜM İLLER"}
                          </div>
                          <div className="col-span lg:col-span-2 flex flex-wrap gap-2">
                            {item.districts.length > 0 ? (
                              item.districts.map((district, index) => {
                                return (
                                  <div
                                    key={index}
                                    className={`flex items-center group p-2 mb-1 border border-lightgray gap-2`}
                                  >
                                    {
                                      turkeyApi.provinces
                                        .find((a) => a.id === parseInt(item.id))
                                        .districts.find(
                                          (a) => a.id === parseInt(district)
                                        )?.name
                                    }
                                    <button
                                      type="button"
                                      className="text-sm text-danger group-hover:text-white group-hover:bg-danger rounded-full p-1 text-base transition duration-150 ease-out md:ease-in"
                                      onClick={() =>
                                        deleteCity(item.id, district)
                                      }
                                    >
                                      <RiCloseCircleLine />
                                    </button>
                                  </div>
                                )
                              })
                            ) : (
                              <>Tüm ilçeler</>
                            )}
                          </div>
                          <div className="col-span text-right">
                            <button
                              type="button"
                              className="inline-flex items-center hover:bg-danger text-danger hover:text-white border border-danger text-sm rounded p-2 gap-2 text-base transition duration-150 ease-out md:ease-in"
                              onClick={() => deleteCity(item.id, null)}
                            >
                              Tüm ili sil <RiCloseCircleLine />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="my-4">
                    Hiçbir hizmet noktası bulunmamaktadır.
                  </div>
                )}
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

  const { name, slug, servicePoints, user, publishedAt } = firmData.attributes

  const firmContent = {
    id: firmData.id,
    name,
    slug,
    servicePoints,
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

export default PriceEntries
