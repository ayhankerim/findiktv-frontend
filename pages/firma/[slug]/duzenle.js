import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import { getSession, useSession } from "next-auth/react"
import axios from "axios"
import { fetchAPI, getGlobalData } from "@/utils/api"
import { getFirmData, getSectorListData } from "@/utils/api-firms"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import Select from "react-select"
import { badwords } from "@/utils/badwords"
import { BiLoaderCircle } from "react-icons/bi"
import { PatternFormat } from "react-number-format"
import { turkeyApi } from "@/utils/turkiye-api"
import { RiArrowGoBackFill } from "react-icons/ri"
import Link from "next/link"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import dynamic from "next/dynamic"
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
const FormField = ({
  keyCode,
  text,
  placeholder,
  errors,
  touched,
  required,
  children,
  ...customAttr
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-2 mb-6">
      <label
        htmlFor={keyCode}
        className="block lg:w-1/5 text-sm font-medium text-midgray"
      >
        {text}
        {required ? <span className="text-danger ml-2">*</span> : ""}
      </label>
      <div className="flex flex-col lg:w-4/5">
        <Field
          className={classNames(
            errors[keyCode] && touched[keyCode]
              ? "border-danger"
              : "border-inputgray",
            "text-base focus:outline outline-offset-2 outline-secondary/30 py-1 px-2 border"
          )}
          type="text"
          name={keyCode}
          id={keyCode}
          placeholder={placeholder}
          {...customAttr}
        >
          {children}
        </Field>
        {errors[keyCode] && touched[keyCode] && (
          <p className="text-danger">{errors[keyCode]}</p>
        )}
      </div>
    </div>
  )
}
const CustomEditor = dynamic(
  () => {
    return import("@/components/elements/MyEditor")
  },
  { ssr: false }
)
const DynamicFirm = ({ firmContent, sectorList, global, firmContext }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const provinceRef = useRef(null)
  const districtRef = useRef(null)
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

  const firmDataSchema = yup.object().shape({
    sector: yup.string().required("Sektör seçimi zorunludur!"),
    address: yup
      .string()
      .min(10, "Çok kısa, lütfen kontrol ediniz!")
      .max(200, "Çok uzun, lütfen kontrol ediniz!")
      .test("Bad Word", "Adres argo ifade içeremez!", function (value) {
        var bad_words = badwords
        var check_text = value
        var error = 0
        for (var i = 0; i < bad_words.length; i++) {
          var val = bad_words[i]
          if (check_text?.toLowerCase().indexOf(val.toString()) > -1) {
            error = error + 1
          }
        }

        if (error > 0) {
          return false
        } else {
          return true
        }
      }),
    fullname: yup
      .string()
      .nullable()
      .min(10, "Çok kısa, lütfen kontrol ediniz!")
      .max(300, "Çok uzun, lütfen kontrol ediniz!")
      .test("Bad Word", "Argo ifade içeremez!", function (value) {
        var bad_words = badwords
        var check_text = value
        var error = 0
        if (!value) return true
        for (var i = 0; i < bad_words.length; i++) {
          var val = bad_words[i]
          if (check_text?.toLowerCase().indexOf(val.toString()) > -1) {
            error = error + 1
          }
        }

        if (error > 0) {
          return false
        } else {
          return true
        }
      }),
    googlemaps: yup
      .string()
      .max(50, "Çok uzun, lütfen kontrol ediniz!")
      .matches(
        /^((https):\/\/)(maps.app.goo.gl)(\/[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        "https://maps.app.goo.gl/ içeren link giriniz!"
      ),
    latitude: yup
      .string()
      .max(50, "Çok uzun, lütfen kontrol ediniz!")
      .matches(
        /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/,
        "Geçerli bir değer giriniz!"
      ),
    longitude: yup
      .string()
      .max(50, "Çok uzun, lütfen kontrol ediniz!")
      .matches(
        /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/,
        "Geçerli bir değer giriniz!"
      ),
    email: yup
      .string()
      .nullable()
      .required("Lütfen geçerli bir mail adresi giriniz!")
      .email("Lütfen geçerli bir mail adresi giriniz!"),
    phone: yup
      .string()
      .nullable()
      .test(
        "Invalid Number",
        "Lütfen geçerli bir telefon numarası giriniz!",
        function (value) {
          if (!value) return true
          var cleanPhone =
            value && parseInt(value.replace("+90", "").replace(/\D/g, ""))

          if (cleanPhone < 1000000000 || cleanPhone > 9999999999) {
            return false
          } else {
            return true
          }
        }
      )
      .nullable(),
    website: yup
      .string()
      .nullable()
      .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        "Geçerli bir web sitesi giriniz!"
      ),
    video: yup
      .string()
      .nullable()
      .min(25, "Çok kısa, lütfen kontrol ediniz!")
      .max(50, "Çok uzun, lütfen kontrol ediniz!")
      .matches(
        /^((https):\/\/)(youtu.be)(\/[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        "https://youtu.be/ içeren link giriniz!"
      ),
    description: yup
      .string()
      .nullable()
      .min(10, "Çok kısa, lütfen kontrol ediniz!")
      .max(200, "Çok uzun, lütfen kontrol ediniz!")
      .test("Bad Word", "Argo ifade içeremez!", function (value) {
        var bad_words = badwords
        var check_text = value
        var error = 0
        if (!value) return true
        for (var i = 0; i < bad_words.length; i++) {
          var val = bad_words[i]
          if (check_text?.toLowerCase().indexOf(val.toString()) > -1) {
            error = error + 1
          }
        }

        if (error > 0) {
          return false
        } else {
          return true
        }
      }),
    about: yup
      .string()
      .nullable()
      .min(10, "Çok kısa, lütfen kontrol ediniz!")
      .max(4000, "Çok uzun, lütfen kontrol ediniz!")
      .test("Bad Word", "Argo ifade içeremez!", function (value) {
        var bad_words = badwords
        var check_text = value
        var error = 0
        if (!value) return true
        for (var i = 0; i < bad_words.length; i++) {
          var val = bad_words[i]
          if (check_text?.toLowerCase().indexOf(val.toString()) > -1) {
            error = error + 1
          }
        }

        if (error > 0) {
          return false
        } else {
          return true
        }
      }),
  })
  const findProvinceById = (id) => {
    const province = turkeyApi.provinces.find((province) => province.id === id)
    if (province) {
      return { value: province.id, label: province.name }
    }
    return ""
  }
  const findDistrictById = (id) => {
    if (!id) return ""
    const districtArray = turkeyApi.provinces
      .find((province) => province.id === firmContent.address[0].provinceId)
      ?.districts.find((district) => district.id === id)
    if (districtArray) {
      return { value: districtArray.id, label: districtArray.name }
    }
    return ""
  }
  const findSectorById = (id) => {
    const province = turkeyApi.provinces.find((province) => province.id === id)
    if (province) {
      return { value: province.id, label: province.name }
    }
    return ""
  }
  return (
    <Layout global={global} pageContext={firmContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col items-start gap-4 pt-2">
          <Toaster position="top-right" reverseOrder={false} />
          <h1 className="font-extrabold text-xl lg:text-xxl">
            Firma Profilini Düzenle
          </h1>
          <Formik
            initialValues={{
              sector: firmContent.firm_category.data.id,
              province: firmContent.address
                ? firmContent.address[0].provinceId
                : "",
              district: firmContent.address
                ? firmContent.address[0].districtId
                : "",
              address: firmContent.address
                ? firmContent.address[0].address
                : "",
              googlemaps: firmContent.address
                ? firmContent.address[0].googleMaps
                : "",
              latitude: firmContent.address
                ? firmContent.address[0].latitude
                : "",
              longitude: firmContent.address
                ? firmContent.address[0].longitude
                : "",
              website: firmContent.website,
              email: firmContent.email,
              phone: firmContent.phone,
              video: firmContent.video,
              description: firmContent.description,
              fullname: firmContent.fullname,
              about: firmContent.about,
            }}
            validationSchema={firmDataSchema}
            onSubmit={async (
              values,
              { setSubmitting, setErrors, resetForm }
            ) => {
              setLoading(true)
              try {
                setErrors({ api: null })
                await fetchAPI(
                  `/firms/${firmContent.id}`,
                  {},
                  {
                    method: "PUT",
                    body: JSON.stringify({
                      data: {
                        firm_category: values.sector,
                        website: values.website,
                        phone: values.phone
                          ? parseInt(
                              values.phone
                                .toString()
                                .replace("+90", "")
                                .replace(/\D/g, "")
                            )
                          : null,
                        email: values.email,
                        video: values.video,
                        description: values.description,
                        fullname: values.fullname,
                        about: values.about,
                        address: [
                          {
                            address: values.address,
                            country: "TR",
                            latitude: values.latitude,
                            longitude: values.longitude,
                            districtId: parseInt(values.district),
                            googleMaps: values.googlemaps,
                            provinceId: parseInt(values.province),
                          },
                        ],
                      },
                    }),
                  }
                )
                await axios.get(`/api/revalidate`, {
                  params: {
                    url: `/firma/${firmContent.slug}`,
                    secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET_TOKEN,
                  },
                })
                notify("success", "Bilgileriniz güncellenmiştir.")
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
              <Form className="w-full mb-8">
                <FormField
                  keyCode="fullname"
                  text="Firma Resmi Adı"
                  placeholder="Lütfen giriniz"
                  errors={errors}
                  touched={touched}
                />
                <div className="flex flex-col lg:flex-row gap-2 mb-6">
                  <label
                    htmlFor="sector"
                    className="block lg:w-1/5 text-sm font-medium text-midgray"
                  >
                    Sektör
                  </label>
                  <div className="flex flex-col lg:w-4/5">
                    <Select
                      classNames={{
                        control: (state) =>
                          "w-full text-base focus:outline outline-offset-2 outline-secondary/30 px-2 border !rounded-none",
                      }}
                      classNamePrefix="react-select"
                      isLoading={loading}
                      isClearable={false}
                      isSearchable={true}
                      name="sector"
                      placeholder="Sektör Seçiniz"
                      options={[
                        ...sectorList.map((item) => ({
                          value: item.id,
                          label: item.attributes.name,
                        })),
                      ]}
                      defaultValue={{
                        label: firmContent.firm_category.data.attributes.name,
                        value: firmContent.firm_category.data.id,
                      }}
                      onBlur={() => setFieldTouched("sector", true)}
                      onChange={(p) => {
                        setFieldValue("sector", p?.value || "")
                      }}
                    />
                    {errors.sector && touched.sector && (
                      <p className="text-danger">{errors.sector}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2 mb-6">
                  <label
                    htmlFor="province"
                    className="block lg:w-1/5 text-sm font-medium text-midgray"
                  >
                    Adres
                  </label>
                  <div className="grid grid-cols-2 lg:w-4/5 gap-2">
                    <div className="col-span-2 lg:col-span-1 flex flex-col">
                      <Select
                        ref={provinceRef}
                        classNames={{
                          control: (state) =>
                            "w-full text-base focus:outline outline-offset-2 outline-secondary/30 px-2 border !rounded-none",
                        }}
                        classNamePrefix="react-select"
                        isLoading={loading}
                        isClearable={true}
                        isSearchable={true}
                        name="province"
                        placeholder="İl Seçiniz"
                        options={[
                          ...turkeyApi.provinces.map((item) => ({
                            value: item.id,
                            label: item.name,
                          })),
                        ]}
                        defaultValue={findProvinceById(
                          firmContent.address &&
                            firmContent.address[0].provinceId
                        )}
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
                    <div className="col-span-2 lg:col-span-1 flex flex-col">
                      <Select
                        ref={districtRef}
                        classNames={{
                          control: (state) =>
                            "w-full text-base focus:outline outline-offset-2 outline-secondary/30 px-2 border !rounded-none",
                        }}
                        classNamePrefix="react-select"
                        isLoading={loading}
                        isClearable={true}
                        isSearchable={true}
                        name="district"
                        placeholder="İlçe Seçiniz"
                        options={[
                          ...(turkeyApi.provinces
                            .find(
                              (province) =>
                                province.id === parseInt(values.province)
                            )
                            ?.districts.map((item) => ({
                              value: item.id,
                              label: item.name,
                            })) || []),
                        ]}
                        onChange={(e) => {
                          setFieldTouched("district", true)
                          setFieldValue("district", e?.value)
                        }}
                        defaultValue={findDistrictById(
                          firmContent.address &&
                            firmContent.address[0].districtId
                        )}
                      />
                      {errors.district && touched.district && (
                        <p className="text-danger">{errors.district}</p>
                      )}
                    </div>
                    <div className="flex flex-col col-span-2">
                      <Field
                        className={classNames(
                          errors.address && touched.address
                            ? "border-danger"
                            : "border-inputgray",
                          "text-base focus:outline outline-offset-2 outline-secondary/30 py-1 px-2 border"
                        )}
                        as="textarea"
                        name="address"
                        id="address"
                        placeholder="Adres"
                      />
                      {errors.address && touched.address && (
                        <p className="text-danger">{errors.address}</p>
                      )}
                    </div>
                  </div>
                </div>
                <FormField
                  keyCode="googlemaps"
                  text="Google Maps Bağlantısı"
                  placeholder="Örn: https://maps.app.goo.gl/wfdgUxC9TMan8FHK9"
                  errors={errors}
                  touched={touched}
                />
                <div className="flex flex-col lg:flex-row gap-2 mb-6">
                  <label
                    htmlFor="latitude"
                    className="block lg:w-1/5 text-sm font-medium text-midgray"
                  >
                    Enlem / Boylam
                  </label>
                  <div className="flex flex-col lg:w-2/5">
                    <Field
                      className={classNames(
                        errors.latitude && touched.latitude
                          ? "border-danger"
                          : "border-inputgray",
                        "text-base focus:outline outline-offset-2 outline-secondary/30 py-1 px-2 border"
                      )}
                      type="text"
                      name="latitude"
                      id="latitude"
                      placeholder="Enlem (Latitude) giriniz"
                    />
                    {errors.latitude && touched.latitude && (
                      <p className="text-danger">{errors.latitude}</p>
                    )}
                  </div>
                  <div className="flex flex-col lg:w-2/5">
                    <Field
                      className={classNames(
                        errors.longitude && touched.longitude
                          ? "border-danger"
                          : "border-inputgray",
                        "text-base focus:outline outline-offset-2 outline-secondary/30 py-1 px-2 border"
                      )}
                      type="text"
                      name="longitude"
                      id="longitude"
                      placeholder="Boylam (Longitude) giriniz"
                    />
                    {errors.longitude && touched.longitude && (
                      <p className="text-danger">{errors.longitude}</p>
                    )}
                  </div>
                </div>
                <FormField
                  keyCode="email"
                  text="E-posta"
                  placeholder="Kurumsal e-posta adresiniz"
                  errors={errors}
                  touched={touched}
                  required={true}
                />
                <FormField
                  keyCode="phone"
                  text="Telefon"
                  placeholder="Telefon numaranız"
                  errors={errors}
                  touched={touched}
                  as={PatternFormat}
                  format="+90 (###) ### ## ##"
                />
                <FormField
                  keyCode="website"
                  text="Website"
                  placeholder="Kurumsal web adresiniz"
                  errors={errors}
                  touched={touched}
                />
                <FormField
                  keyCode="video"
                  text="Video"
                  placeholder="youtu.be linki giriniz"
                  errors={errors}
                  touched={touched}
                />
                <FormField
                  keyCode="description"
                  text="Kısa Açıklama / Slogan"
                  placeholder="Kısa Açıklama / Slogan"
                  errors={errors}
                  touched={touched}
                  as="textarea"
                  rows={3}
                />
                <FormField
                  keyCode="about"
                  text="Firma Hakkında"
                  placeholder="Firma Hakkında"
                  errors={errors}
                  touched={touched}
                  as={CustomEditor}
                  initialData={firmContent.about}
                  onChange={(event, editor) => {
                    const data = editor.getData()
                    setFieldValue("about", data)
                    setFieldTouched("about", true)
                  }}
                />
                {errors.api && (
                  <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                    {errors.api}
                  </p>
                )}
                <div className="flex justify-end gap-2 mb-6">
                  <div className="flex flex-col lg:w-1/5 hidden lg:flex"></div>
                  <div className="flex flex-col lg:w-1/5">
                    <Link
                      className="w-full bg-midgray hover:bg-midgray/90 text-white rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                      href={`/firma/${firmContent.slug}${
                        firmContent.publishedAt === null ? "/taslak" : ""
                      }`}
                    >
                      <RiArrowGoBackFill className="mr-2 inline-block align-middle w-4 h-4 text-gray-200" />
                      <span>Geri dön</span>
                    </Link>
                  </div>
                  <div className="flex flex-col w-1/2 lg:w-3/5">
                    <button
                      className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span role="status">
                          <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                          <span className="sr-only">Kaydediliyor...</span>
                          <span>Kaydediliyor...</span>
                        </span>
                      ) : (
                        <span>Kaydet</span>
                      )}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
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
  if (firmData == null) {
    return {
      notFound: true,
    }
  }

  const {
    name,
    slug,
    fullname,
    description,
    about,
    firm_category,
    video,
    address,
    email,
    website,
    phone,
    user,
    createdAt,
    updatedAt,
    publishedAt,
  } = firmData.attributes

  const firmContent = {
    id: firmData.id,
    name,
    slug,
    fullname,
    description,
    about,
    firm_category,
    video,
    address,
    email,
    website,
    phone,
    user,
    createdAt,
    updatedAt,
    publishedAt,
  }
  const firmContext = {
    locale,
    locales,
    defaultLocale,
    slug: params.slug,
  }
  const sectorList = await getSectorListData()
  return {
    props: {
      global: globalLocale.data,
      firmContent: firmContent,
      sectorList: sectorList,
      firmContext: {
        ...firmContext,
      },
    },
  }
}

export default DynamicFirm
