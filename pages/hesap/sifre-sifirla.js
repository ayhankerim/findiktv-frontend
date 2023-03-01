import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import Image from "next/image"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import { fetchAPI, getGlobalData } from "@/utils/api"
import Layout from "@/components/layout-clean"
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

export default function SignIn({ global }) {
  const [loading, setLoading] = useState(false)
  const [passReseted, setResetStatus] = useState(false)
  const { push, query } = useRouter()
  const router = useRouter()

  const metadata = {
    id: 1,
    metaTitle: "Şifre Sıfırla | FINDIK TV",
    metaDescription:
      "Kullanıcı hesabınıza erişemiyorsanız ve ya şifrenizi unuttuysanız bu sayfayı kullanarak şifrenizi sıfırlayabilirsiniz.",
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const loginSchema = yup.object().shape({
    password: yup
      .string()
      .required("Lütfen şifrenizi giriniz!")
      .min(4, "Çok kısa, lütfen kontrol ediniz!")
      .max(30, "Çok uzun, lütfen kontrol ediniz!"),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password"), null],
        "Şifreler uyuşmuyor, lütfen kontrol ediniz!"
      )
      .required("Şifre girilmesi gereklidir!"),
  })

  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const [farmerImage, setImage] = useState("")
  useEffect(() => {
    fetchAPI("/upload/files/37").then((data) => {
      setImage(data)
    })
  }, [])

  return (
    <Layout>
      <Toaster position="top-right" reverseOrder={false} />
      <Seo metadata={metadataWithDefaults} />
      <div className="px-5 py-5 lg:p-0 bg-white">
        <div className="flex justify-center w-full">
          <div className="lg:w-5/12 xl:w-4/12 p-12 xl:p-20 fixed left-0 top-0 h-screen overflow-y-hidden hidden lg:flex flex-col">
            {farmerImage && (
              <Image
                src={farmerImage.formats.large.url}
                alt={farmerImage.alternativeText}
                className="absolute inset-0 h-full w-full object-cover"
                priority={true}
                fill
              />
            )}
            <div className="flex absolute bg-secondary/80 left-0 top-0 h-full w-full">
              <div className="flex flex-col justify-end p-12">
                <h1 className="ls-tight font-bolder text-xl text-white mb-2">
                  FINDIK TV`de üyelere özel ayrıcalıkları keşfet
                </h1>
                <p className="text-white text-base text-opacity-75">
                  İçeriklerden önce haberdar ol, üyelerle etkileşimini arttır.
                  Fiyat değişimlerini yakından takip et.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-9/12 lg:w-7/12 lg:ml-[41.66666667%] lg:min-h-screen flex flex-col justify-center lg:py-16 lg:px-20 relative">
            <div className="flex">
              <div className="lg:w-10/12 md:w-9/12 xl:w-6/12 mx-auto xl:ml-0">
                <div className="mt-10 lg:mt-5 mb-6 flex flex-col align-center">
                  <Image
                    src="/uploads/logo_findiktv_2000_92bc7df5ca.png?updated_at=2023-01-09T08:00:08.202Z"
                    alt="FINDIK TV"
                    width={200}
                    height={48}
                    className="mb-4"
                  />
                  <h1 className="text-lg leading-tight font-bold">
                    Şifremi Sıfırla
                  </h1>
                </div>
                {passReseted ? (
                  <div className="text-base">
                    <p className="text-primary">
                      Şifreniz başarılı bir şekilde sıfırlanmıştır.
                    </p>
                    <p>
                      <Link
                        href="/hesap/giris-yap"
                        className="text-secondary hover:underline"
                      >
                        Buradan
                      </Link>{" "}
                      giriş yapabilirsiniz.
                    </p>
                  </div>
                ) : (
                  <Formik
                    initialValues={{
                      password: "",
                      passwordConfirmation: "",
                    }}
                    enableReinitialize
                    validationSchema={loginSchema}
                    onSubmit={async (
                      values,
                      { setSubmitting, setErrors, resetForm }
                    ) => {
                      setLoading(true)
                      try {
                        values.code = query.code
                        await fetchAPI(
                          `/auth/reset-password`,
                          {},
                          {
                            method: "POST",
                            body: JSON.stringify({
                              password: values.password,
                              passwordConfirmation: values.passwordConfirmation,
                              code: values.code,
                            }),
                          }
                        ).then(async (data) => {
                          if (data.user.id) {
                            setResetStatus(true)
                            return
                          }
                        })
                      } catch (err) {
                        setErrors(err)
                        notify(
                          "error",
                          "Yeni şifrenizi kaydederken bir hata ile karşılaştık. Lütfen daha sonra tekrar deneyiniz!"
                        )
                      }
                      setLoading(false)
                      setSubmitting(false)
                    }}
                  >
                    {({ errors, touched, isSubmitting, setFieldValue }) => (
                      <Form>
                        <div className="flex flex-col mb-5">
                          <label className="form-label" htmlFor="password">
                            Şifreniz
                          </label>
                          <Field
                            className={classNames(
                              errors.password && touched.password
                                ? "border-danger"
                                : "border-midgray",
                              "text-base focus:outline-none py-1 px-2 border"
                            )}
                            type="password"
                            name="password"
                          />
                          {errors.password && touched.password && (
                            <p className="text-danger">{errors.password}</p>
                          )}
                        </div>

                        <div className="flex flex-col mb-5">
                          <label
                            className="form-label"
                            htmlFor="passwordConfirmation"
                          >
                            Şifreniz (Tekrar)
                          </label>
                          <Field
                            className={classNames(
                              errors.passwordConfirmation &&
                                touched.passwordConfirmation
                                ? "border-danger"
                                : "border-midgray",
                              "text-base focus:outline-none py-1 px-2 border"
                            )}
                            type="password"
                            name="passwordConfirmation"
                          />
                          {errors.passwordConfirmation &&
                            touched.passwordConfirmation && (
                              <p className="text-danger">
                                {errors.passwordConfirmation}
                              </p>
                            )}
                        </div>
                        {errors.api && (
                          <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                            {errors.api}
                          </p>
                        )}
                        <div className="flex flex-row gap-2">
                          <button
                            className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-2 text-base transition duration-150 ease-out md:ease-in"
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
                              <span>Şifremi değiştir</span>
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}
                <div className="my-6">
                  <p>
                    <Link
                      href="/"
                      className="text-warning text-sm font-semibold"
                    >
                      Ana sayfaya dön
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  const { locale } = context
  const globalLocale = await getGlobalData(locale)

  if (!context.query.code || context.query.code === "") {
    return {
      redirect: {
        destination: "/hesap/giris-yap",
        permanent: true,
      },
    }
  }
  return {
    props: {
      global: globalLocale.data,
    },
  }
}
