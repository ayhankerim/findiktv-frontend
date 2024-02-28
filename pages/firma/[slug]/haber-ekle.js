import React, { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import { badwords } from "@/utils/badwords"
import { fetchAPI, getGlobalData } from "@/utils/api"
import { getFirmData } from "@/utils/api-firms"
import * as yup from "yup"
import axios from "axios"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import { slugify } from "@/utils/slugify"
import { BiLoaderCircle } from "react-icons/bi"
import { RiArrowGoBackFill } from "react-icons/ri"
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
const PriceEntries = ({ global, firmContent, firmContext }) => {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState()
  const router = useRouter()

  const metadata = {
    id: 1,
    metaTitle: `Haber Ekle`,
    metaDescription: `Kurumunuzla alakalı haber paylaşın.`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: `/firma/${firmContent.slug}/haber-ekle`,
    datePublished: Moment(firmContent.publishedAt).toISOString(),
    dateModified: Moment(firmContent.updatedAt).toISOString(),
    tags: [],
  }

  useEffect(() => {}, [])

  if (!router.isFallback && !firmContent) {
    return {
      notFound: true,
    }
  }
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const MAX_FILE_SIZE = 2 * 1024 * 1024
  const validFileExtensions = {
    image: ["jpg", "png", "jpeg", "svg", "webp"],
  }
  function isValidFileType(fileName, fileType) {
    return (
      fileName &&
      validFileExtensions[fileType].indexOf(fileName.split(".").pop()) > -1
    )
  }
  const newsSchema = yup.object().shape({
    title: yup
      .string()
      .required("Lütfen başlık giriniz!")
      .min(10, "Çok kısa, lütfen kontrol ediniz!")
      .max(180, "Çok uzun, lütfen kontrol ediniz!")
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
    summary: yup
      .string()
      .required("Lütfen özet giriniz!")
      .min(100, "Çok kısa, lütfen kontrol ediniz!")
      .max(180, "Çok uzun, lütfen kontrol ediniz!")
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
    content: yup
      .string()
      .required("Lütfen içerik giriniz!")
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
    image: yup
      .mixed()
      .required("Lütfen bir görsel seçiniz!")
      .test(
        "is-valid-type",
        "Geçersiz bir görsel formatı seçtiniz!",
        (value) => {
          return isValidFileType(value && value.name.toLowerCase(), "image")
        }
      )
      .test(
        "is-valid-size",
        `İzin verilen maksimum dosya boyutu ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        (value) => {
          return value && value.size <= MAX_FILE_SIZE
        }
      ),
  })
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
                    Haber Ekle
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

                <Formik
                  initialValues={{
                    title: "",
                    summary: "",
                    content: "",
                    image: "",
                  }}
                  validationSchema={newsSchema}
                  onSubmit={async (
                    values,
                    { setSubmitting, setErrors, resetForm }
                  ) => {
                    setLoading(true)
                    const formData = new FormData()
                    formData.append("files", files[0])
                    axios
                      .post(
                        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`,
                        formData,
                        {
                          headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
                          },
                        }
                      )
                      .then(async (response) => {
                        try {
                          setErrors({ api: null })
                          await fetchAPI(
                            `/articles`,
                            {},
                            {
                              method: "POST",
                              body: JSON.stringify({
                                data: {
                                  title: values.title,
                                  slug: slugify(values.title),
                                  summary: values.summary,
                                  contentSections: [
                                    {
                                      __component: "sections.rich-text",
                                      content: values.content,
                                    },
                                  ],
                                  image: response.data[0].id,
                                  firms: firmContent.id,
                                  publishedAt: null,
                                },
                              }),
                            }
                          )
                          notify("success", "Haber girişiniz alınmıştır.")
                        } catch (err) {
                          console.error(err)
                          notify(
                            "error",
                            "Haber kaydedilirken bir sorunla karşılaştık."
                          )
                          setErrors({ api: err.message })
                        }
                        resetForm({
                          values: {
                            title: "",
                            summary: "",
                            content: "",
                            image: "",
                          },
                        })
                        setFiles()
                        setLoading(false)
                      })
                      .catch((error) => {
                        console.error(error)
                        notify(
                          "error",
                          "Görsel kaydedilirken bir sorunla karşılaştık!"
                        )
                        setErrors({ api: error.message })
                        setLoading(false)
                      })
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
                        keyCode="title"
                        text="Haber Başlığı"
                        placeholder="Giriniz"
                        errors={errors}
                        touched={touched}
                      />
                      <FormField
                        keyCode="summary"
                        text="Özet"
                        placeholder="Kısa açıklama"
                        errors={errors}
                        touched={touched}
                        as="textarea"
                        rows={2}
                      />
                      <FormField
                        keyCode="content"
                        text="İçerik"
                        placeholder="Haberi giriniz"
                        errors={errors}
                        touched={touched}
                        as={CustomEditor}
                        initialData={firmContent.content}
                        onChange={(event, editor) => {
                          const data = editor.getData()
                          setFieldValue("content", data)
                          setFieldTouched("content", true)
                        }}
                      />
                      <div className="flex flex-col lg:flex-row gap-2 mb-6">
                        <label
                          htmlFor={`image`}
                          className="block lg:w-1/5 text-sm font-medium text-midgray"
                        >
                          Görsel
                        </label>
                        <div className="flex flex-col lg:w-4/5">
                          <input
                            type="file"
                            name="image"
                            id="image"
                            accept="image/png, image/jpg, image/jpeg, image/svg, image/webp"
                            className={classNames(
                              errors.image && touched.image
                                ? "border-danger"
                                : "border-inputgray",
                              "text-base focus:outline outline-offset-2 outline-secondary/30 py-1 px-2 border w-full"
                            )}
                            onChange={(e) => {
                              setFieldTouched("image", true)
                              setFieldValue("image", e.target.files[0])
                              setFiles(e.target.files)
                            }}
                            disabled={loading}
                          />
                          {errors["image"] && touched["image"] && (
                            <p className="text-danger">{errors["image"]}</p>
                          )}
                        </div>
                      </div>

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
                        <div className="flex flex-col lg:w-3/5">
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
