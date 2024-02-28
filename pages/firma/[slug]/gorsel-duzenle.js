import React, { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"
import { fetchAPI, getGlobalData } from "@/utils/api"
import { getFirmData } from "@/utils/api-firms"
import axios from "axios"
import * as yup from "yup"
import { Formik, Form } from "formik"
import toast, { Toaster } from "react-hot-toast"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import { BiLoaderCircle } from "react-icons/bi"
import {
  RiArrowGoBackFill,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri"
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
  const qs = require("qs")
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState()
  const [galleryFiles, setGalleryFiles] = useState()
  const [firmLogo, setFirmLogo] = useState()
  const [firmGallery, setFirmGallery] = useState()
  const router = useRouter()

  const metadata = {
    id: 1,
    metaTitle: `Görsel Ekle`,
    metaDescription: `Logo ve galerinizi düzenleyin.`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: `/firma/${firmContent.slug}/gorsel-duzenle`,
    datePublished: Moment(firmContent.publishedAt).toISOString(),
    dateModified: Moment(firmContent.updatedAt).toISOString(),
    tags: [],
  }
  useEffect(() => {
    firmContent.logo && setFirmLogo(firmContent.logo)
    firmContent.gallery && setFirmGallery(firmContent.gallery)
    return () => {}
  }, [firmContent.gallery, firmContent.logo])

  if (!router.isFallback && !firmContent) {
    return {
      notFound: true,
    }
  }
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const MAX_FILE_SIZE = 2 * 1024 * 1024
  const MAX_GALLERY_COUNT = 4
  const validFileExtensions = {
    image: ["jpg", "png", "jpeg", "svg", "webp"],
  }
  function isValidFileType(fileName, fileType) {
    return (
      fileName &&
      validFileExtensions[fileType].indexOf(fileName.split(".").pop()) > -1
    )
  }
  const logoSchema = yup.object().shape({
    logo: yup
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
  const gallerySchema = yup.object().shape({
    gallery: yup
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
  const manageGallery = async (item, status = 0) => {
    const galleryUpdated = firmGallery.data.map((a) => parseInt(a.id))
    const index = galleryUpdated.indexOf(item)
    if (index !== -1) {
      galleryUpdated.splice(index, 1)
      status !== 0 && galleryUpdated.splice(index + status, 0, item)
    }
    const query = qs.stringify(
      {
        populate: ["gallery"],
      },
      {
        encodeValuesOnly: true,
      }
    )
    const galleryUpdate = await fetchAPI(
      `/firms/${firmContent.id}?${query}`,
      {},
      {
        method: "PUT",
        body: JSON.stringify({
          data: {
            gallery: galleryUpdated,
          },
        }),
      }
    )
    setFirmGallery(galleryUpdate.data.attributes.gallery)
    notify("success", "Başarıyla güncellendi.")
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
                    Logo Düzenle
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
                    logo: "",
                  }}
                  validationSchema={logoSchema}
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
                        const query = qs.stringify(
                          {
                            populate: ["logo"],
                          },
                          {
                            encodeValuesOnly: true,
                          }
                        )
                        const logoUpdate = await fetchAPI(
                          `/firms/${firmContent.id}?${query}`,
                          {},
                          {
                            method: "PUT",
                            body: JSON.stringify({
                              data: {
                                logo: response.data[0].id,
                              },
                            }),
                          }
                        )
                        setFirmLogo(logoUpdate.data.attributes.logo)
                        notify("success", "Başarıyla eklendi.")
                        resetForm({
                          values: {
                            logo: null,
                          },
                        })
                        setFiles()
                        setLoading(false)
                      })
                      .catch((error) => {
                        console.error(error)
                        notify("error", "Bir sorunla karşılaştık.")
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
                    <Form className="grid lg:grid-cols-4 bg-lightgray items-center p-2 gap-3">
                      {firmLogo && (
                        <div className="col-span">
                          <div className="group relative mx-auto w-full h-[200px] overflow-hidden rounded bg-white shadow-lg">
                            <Image
                              src={
                                firmLogo.data
                                  ? firmLogo.data.attributes.formats.small.url
                                  : "https://www.findiktv.com/cdn-cgi/imagedelivery/A_vnS-Tfmrf1TT32XC1EgA/7bbe9bd7-c876-4387-bd6f-a01dcaec5400/format=auto,width=250"
                              }
                              alt={firmContent.name}
                              className="absolute inset-0 h-full w-full object-contain rounded p-2 z-10"
                              priority={true}
                              fill
                            />
                          </div>
                        </div>
                      )}
                      <div className="col-span-2">
                        <input
                          type="file"
                          name="logo"
                          id="logo"
                          accept="image/png, image/jpg, image/jpeg, image/svg, image/webp"
                          className={classNames(
                            errors.logo && touched.logo
                              ? "border-danger"
                              : "border-inputgray",
                            "text-base focus:outline outline-offset-2 outline-secondary/30 py-1 px-2 border w-full"
                          )}
                          onChange={(e) => {
                            setFieldTouched("logo", true)
                            setFieldValue("logo", e.target.files[0])
                            setFiles(e.target.files)
                          }}
                          disabled={loading}
                        />
                        {errors.logo && touched.logo && (
                          <p className="text-danger">{errors.logo}</p>
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
                <div className="flex justify-between mt-16">
                  <h2 className="font-semibold text-xl text-dark">
                    Galeri Düzenle
                  </h2>
                </div>
                <Formik
                  initialValues={{
                    gallery: "",
                  }}
                  validationSchema={gallerySchema}
                  onSubmit={async (
                    values,
                    { setSubmitting, setErrors, resetForm }
                  ) => {
                    setLoading(true)
                    const formData = new FormData()
                    formData.append("files", galleryFiles[0])
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
                        const query = qs.stringify(
                          {
                            populate: ["gallery"],
                          },
                          {
                            encodeValuesOnly: true,
                          }
                        )
                        const galleryUpdated = firmGallery.data.map((a) =>
                          parseInt(a.id)
                        )

                        galleryUpdated.push(response.data[0].id)

                        const galleryUpdate = await fetchAPI(
                          `/firms/${firmContent.id}?${query}`,
                          {},
                          {
                            method: "PUT",
                            body: JSON.stringify({
                              data: {
                                gallery: galleryUpdated,
                              },
                            }),
                          }
                        )
                        setFirmGallery(galleryUpdate.data.attributes.gallery)
                        notify("success", "Başarıyla eklendi.")
                        resetForm({
                          values: {
                            gallery: null,
                          },
                        })
                        setGalleryFiles()
                        setLoading(false)
                      })
                      .catch((error) => {
                        console.error(error)
                        notify("error", "Bir sorunla karşılaştık.")
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
                    <Form className="grid lg:grid-cols-4 bg-lightgray items-center p-2 gap-3">
                      <div className="col-span-3">
                        <input
                          type="file"
                          name="gallery"
                          id="gallery"
                          accept="image/png, image/jpg, image/jpeg, image/svg, image/webp"
                          className={classNames(
                            errors.gallery && touched.gallery
                              ? "border-danger"
                              : "border-inputgray",
                            "text-base focus:outline outline-offset-2 outline-secondary/30 py-1 px-2 border w-full"
                          )}
                          onChange={(e) => {
                            setFieldTouched("gallery", true)
                            setFieldValue("gallery", e.target.files[0])
                            setGalleryFiles(e.target.files)
                          }}
                          disabled={
                            loading ||
                            firmGallery?.data.length > MAX_GALLERY_COUNT
                          }
                        />
                        {errors.gallery && touched.gallery && (
                          <p className="text-danger">{errors.gallery}</p>
                        )}
                      </div>
                      <div className="col-span">
                        <button
                          className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-2 text-base transition duration-150 ease-out md:ease-in"
                          type="submit"
                          disabled={
                            loading ||
                            firmGallery?.data.length > MAX_GALLERY_COUNT
                          }
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
                      {firmGallery?.data.length > MAX_GALLERY_COUNT && (
                        <div className="col-span-4 text-warning">
                          <p>
                            En fazla {MAX_GALLERY_COUNT} adet görsel
                            yükleyebilirsiniz!
                          </p>
                        </div>
                      )}

                      {firmGallery && (
                        <div className="col-span-4">
                          {firmGallery.data.length > 0 ? (
                            <div className="grid lg:grid-cols-2">
                              {firmGallery.data.map((item, i) => (
                                <div
                                  key={item.id}
                                  className="group relative h-[300px] overflow-hidden bg-white"
                                >
                                  <Image
                                    src={item.attributes.formats.small.url}
                                    alt={`${firmContent.name} Galeri Görseli ${
                                      i + 1
                                    }`}
                                    className="absolute inset-0 h-full w-full object-cover z-10"
                                    priority={i < 2 ? true : false}
                                    fill
                                  />
                                  <div className="absolute flex justify-center items-center w-full h-full gap-2 group-hover:bg-white/50 z-0 group-hover:z-20">
                                    <button
                                      className="disabled:opacity-50 disabled:cursor-not-allowed bg-secondary/90 py-2 px-4 text-white rounded hover:bg-secondary"
                                      type="button"
                                      disabled={i === 0}
                                      onClick={() => manageGallery(item.id, -1)}
                                    >
                                      <RiArrowLeftSLine />
                                    </button>
                                    <button
                                      className="bg-danger/90 py-2 px-4 text-white rounded hover:bg-danger"
                                      type="button"
                                      onClick={() => manageGallery(item.id, 0)}
                                    >
                                      Sil
                                    </button>
                                    <button
                                      className="disabled:opacity-50 disabled:cursor-not-allowed bg-secondary/90 py-2 px-4 text-white rounded hover:bg-secondary"
                                      type="button"
                                      disabled={
                                        i === firmGallery.data.length - 1
                                      }
                                      onClick={() => manageGallery(item.id, 1)}
                                    >
                                      <RiArrowRightSLine />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-warning">
                              <p>Görsel eklenmemiş!</p>
                            </div>
                          )}
                        </div>
                      )}
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

  const { name, slug, logo, gallery, user, publishedAt } = firmData.attributes

  const firmContent = {
    id: firmData.id,
    name,
    slug,
    logo,
    gallery,
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
