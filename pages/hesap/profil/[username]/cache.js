import { useState } from "react"
import { useRouter } from "next/router"
import { getSession } from "next-auth/react"
import { getUserData, getGlobalData } from "@/utils/api"
import axios from "axios"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import { BiLoaderCircle } from "react-icons/bi"

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

const DynamicUsers = ({ userContent, global, userContext }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  // Check if the required data was provided
  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const metadata = {
    id: 1,
    metaTitle: `Cache Temizleme | FINDIK TV`,
    metaDescription: `Cache Temizleme | FINDIK TV`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }
  const loggedInSchema = yup.object().shape({
    link: yup
      .string()
      .min(2, "Çok kısa, lütfen kontrol ediniz!")
      .max(300, "Çok uzun, lütfen kontrol ediniz!"),
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
    slug: "/hesap/profil/" + userContent.username + "/cache",
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
                <h1 className="font-semibold text-xl text-dark">
                  Cache Temizleme
                </h1>
                <p className="text-midgray">
                  Cache temizlemesini istediğiniz linki aşağıdaki formatta
                  giriniz:
                </p>

                <Toaster position="top-right" reverseOrder={false} />
                <Formik
                  initialValues={{
                    link: "/urunler/findik/fiyatlari",
                  }}
                  validationSchema={loggedInSchema}
                  onSubmit={async (
                    values,
                    { setSubmitting, setErrors, resetForm }
                  ) => {
                    setLoading(true)

                    try {
                      const response = await axios.get(`/api/revalidate`, {
                        params: {
                          url: values.link,
                          secret:
                            process.env.NEXT_PUBLIC_REVALIDATION_SECRET_TOKEN,
                        },
                      })
                      notify("success", "Cache Temizlendi")
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
                  {({ errors, touched, isSubmitting, setFieldValue }) => (
                    <div className="bg-lightgray border rounded-xl p-3 border-lightgray mt-5 md:col-span-2 md:mt-0 mb-8">
                      <Form className="">
                        <div className="flex flex-col gap-2 mb-2">
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-midgray"
                            >
                              Link
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                <span className="text-gray-500 dark:text-gray-400">
                                  https://www.findiktv.com
                                </span>
                              </div>
                              <Field
                                className={classNames(
                                  errors.link && touched.link
                                    ? "border-danger"
                                    : "border-midgray",
                                  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-[180px] p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                )}
                                type="text"
                                name="link"
                                placeholder="Link *"
                              />
                            </div>
                            {errors.link && touched.link && (
                              <p className="text-danger">{errors.link}</p>
                            )}
                          </div>
                          {errors.api && (
                            <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                              {errors.api}
                            </p>
                          )}
                          <div className="flex flex-col gap-2 col-span-2">
                            <button
                              className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                              type="submit"
                              disabled={loading}
                            >
                              {loading ? (
                                <span role="status">
                                  <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                                  <span className="sr-only">
                                    Temizleniyor...
                                  </span>
                                  <span>Temizleniyor...</span>
                                </span>
                              ) : (
                                <span>Temizle</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </Form>
                    </div>
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
  const { params, locale } = context
  const globalLocale = await getGlobalData(locale)
  const session = await getSession(context)
  const userData = await getUserData({
    username: params.username,
  })

  if (userData === null) {
    // Giving the page no props will trigger a 404 page
    return { props: {} }
  }

  // We have the required page data, pass it to the page component
  const { username, role } = userData.attributes

  const userContent = {
    id: userData.id,
    username,
    role,
  }
  // Check if session exists or not, if not, redirect
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

export default DynamicUsers
