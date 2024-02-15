import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { getSession, useSession } from "next-auth/react"
import { fetchAPI, getFirmData, getGlobalData } from "@/utils/api"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import { badwords } from "@/utils/badwords"
import { BiLoaderCircle } from "react-icons/bi"
import { PatternFormat } from "react-number-format"
import { turkeyApi } from "@/utils/turkiye-api"
import Image from "next/image"
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
const DynamicFirm = ({ firmContent, global, firmContext }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
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
    metaTitle: ``,
    metaDescription: ``,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: "/firma/",
    datePublished: Moment("2022").toISOString(),
    dateModified: Moment("2022").toISOString(),
    tags: [],
  }

  const firmDataSchema = yup.object().shape({
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
    email: yup.string().email("Lütfen geçerli bir mail adresi giriniz!"),
    phone: yup
      .string()
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
      .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        "Geçerli bir web sitesi giriniz!"
      ),
    video: yup
      .string()
      .min(25, "Çok kısa, lütfen kontrol ediniz!")
      .max(50, "Çok uzun, lütfen kontrol ediniz!")
      .matches(
        /^((https):\/\/)(youtu.be)(\/[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        "https://youtu.be/ içeren link giriniz!"
      ),
    description: yup
      .string()
      .min(10, "Çok kısa, lütfen kontrol ediniz!")
      .max(200, "Çok uzun, lütfen kontrol ediniz!")
      .test("Bad Word", "Açıklama argo ifade içeremez!", function (value) {
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
    about: yup
      .string()
      .min(10, "Çok kısa, lütfen kontrol ediniz!")
      .max(4000, "Çok uzun, lütfen kontrol ediniz!")
      .test("Bad Word", "Açıklama argo ifade içeremez!", function (value) {
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
  })
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
              province: firmContent.address[0].provinceId,
              district: firmContent.address[0].districtId,
              address: firmContent.address[0].address,
              googlemaps: firmContent.address[0].googleMaps,
              latitude: firmContent.address[0].latitude,
              longitude: firmContent.address[0].longitude,
              website: firmContent.website,
              email: firmContent.email,
              phone: firmContent.phone,
              video: firmContent.video,
              description: firmContent.description,
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
                        website: values.website,
                        phone: parseInt(
                          values.phone
                            .toString()
                            .replace("+90", "")
                            .replace(/\D/g, "")
                        ),
                        email: values.email,
                        video: values.video,
                        description: values.description,
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
                <div className="flex flex-col lg:flex-row gap-2 mb-6">
                  <label
                    htmlFor="province"
                    className="block lg:w-1/5 text-sm font-medium text-midgray"
                  >
                    Adres
                  </label>
                  <div className="grid grid-cols-2 lg:w-4/5 gap-2">
                    <div className="flex flex-col">
                      <Field
                        className={classNames(
                          errors.province && touched.province
                            ? "border-danger"
                            : "border-inputgray",
                          "text-base focus:outline outline-offset-2 outline-secondary/30 py-1 px-2 border"
                        )}
                        as="select"
                        name="province"
                        id="province"
                        onChange={(e) => {
                          setFieldValue("province", e.target.value)
                          setFieldValue("district", "")
                          e.target.value
                            ? setFieldValue(
                                "districtOptions",
                                turkeyApi.provinces.find(
                                  (item) => item.id === parseInt(e.target.value)
                                ).districts
                              )
                            : setFieldValue("districtOptions", "")
                        }}
                      >
                        <option value={""} defaultValue>
                          Lütfen Seçiniz!
                        </option>
                        {turkeyApi.provinces.map((item, i) => (
                          <option value={item.id} key={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Field>
                      {errors.province && touched.province && (
                        <p className="text-danger">{errors.province}</p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <Field
                        className={classNames(
                          errors.district && touched.district
                            ? "border-danger"
                            : "border-inputgray",
                          "text-base focus:outline outline-offset-2 outline-secondary/30 py-1 px-2 border"
                        )}
                        as="select"
                        name="district"
                        id="district"
                      >
                        <option value={""} defaultValue>
                          Lütfen seçiniz
                        </option>
                        {turkeyApi.provinces
                          .find((item) => item.id === values.province)
                          ?.districts.map((item, i) => {
                            return (
                              <option value={item.id} key={item.id}>
                                {item.name}
                              </option>
                            )
                          })}
                        {values.districtOptions &&
                          values.districtOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                      </Field>
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
                  placeholder="ısa Açıklama / Slogan"
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
                    console.log(data)
                  }}
                />
                {errors.api && (
                  <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                    {errors.api}
                  </p>
                )}
                <div className="flex flex-col lg:flex-row justify-end gap-2 mb-6">
                  <div className="flex flex-col lg:w-4/5">
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
    description,
    about,
    firm_category,
    video,
    address,
    email,
    website,
    phone,
    user,
  } = firmData.attributes

  const firmContent = {
    id: firmData.id,
    name,
    slug,
    description,
    about,
    firm_category,
    video,
    address,
    email,
    website,
    phone,
    user,
  }
  const firmContext = {
    locale,
    locales,
    defaultLocale,
    slug: params.slug,
  }
  if (session == null) {
    return {
      redirect: {
        destination: "/hesap/giris-yap?redirect=",
        permanent: false,
      },
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

export default DynamicFirm
