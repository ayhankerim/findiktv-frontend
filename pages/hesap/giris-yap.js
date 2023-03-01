import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import Image from "next/image"
import { signIn } from "next-auth/react"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import { setUser } from "@/store/user"
import { fetchAPI, getGlobalData } from "@/utils/api"
import Layout from "@/components/layout-clean"
import Seo from "@/components/elements/seo"
import Dialog from "@/components/elements/dialog"
import { Transition } from "@headlessui/react"
import { MdFacebook } from "react-icons/md"
import { FcGoogle } from "react-icons/fc"
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
  const router = useRouter()

  const metadata = {
    id: 1,
    metaTitle: "Giriş Yap | FINDIK TV",
    metaDescription: "FINDIK TV kullanıcı giriş sayfasıdır.",
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const loginSchema = yup.object().shape({
    email: yup
      .string()
      .email("Lütfen geçerli bir mail adresi giriniz!")
      .required("E-posta adresi gereklidir!"),
    password: yup
      .string()
      .required("Lütfen şifrenizi giriniz!")
      .min(4, "Çok kısa, lütfen kontrol ediniz!")
      .max(30, "Çok uzun, lütfen kontrol ediniz!"),
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
                  <Link href={"/"}>
                    <Image
                      src="/uploads/logo_findiktv_2000_92bc7df5ca.png?updated_at=2023-01-09T08:00:08.202Z"
                      alt="FINDIK TV"
                      width={200}
                      height={48}
                      className="mb-4"
                    />
                  </Link>
                  <h1 className="text-lg leading-tight font-bold">
                    Kullanıcı Girişi
                  </h1>
                </div>

                <Formik
                  initialValues={{
                    email: "",
                    password: "",
                  }}
                  enableReinitialize
                  validationSchema={loginSchema}
                  //validateOnChange={false}
                  onSubmit={async (
                    values,
                    { setSubmitting, setErrors, resetForm }
                  ) => {
                    setLoading(true)
                    const result = await signIn("credentials", {
                      redirect: false,
                      email: values.email,
                      password: values.password,
                    })
                    if (result.ok) {
                      router.replace("/")
                      return
                    }
                    setLoading(false)
                    setSubmitting(false)
                    notify(
                      "error",
                      "Giriş yapılamadı! Bilgilerinizi kontrol ediniz."
                    )
                  }}
                >
                  {({ errors, touched, isSubmitting, setFieldValue }) => (
                    <Form>
                      <div className="flex flex-col mb-5">
                        <label className="form-label" htmlFor="email">
                          E-posta adresiniz
                        </label>
                        <Field
                          className={classNames(
                            errors.email && touched.email
                              ? "border-danger"
                              : "border-midgray",
                            "text-base focus:outline-none py-1 px-2 border"
                          )}
                          type="email"
                          name="email"
                        />
                        {errors.email && touched.email && (
                          <p className="text-danger">{errors.email}</p>
                        )}
                      </div>
                      <div className="flex flex-col mb-5">
                        <label className="form-label" htmlFor="password">
                          Şifreniz
                          <Link
                            href="/hesap/sifremi-unuttum"
                            className="text-xs ml-2 text-secondary/80 hover:text-secondary"
                          >
                            (Şifreni mi unuttun?)
                          </Link>
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
                      {errors.api && (
                        <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                          {errors.api}
                        </p>
                      )}
                      <div className="flex flex-row gap-2">
                        <button
                          className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <span role="status">
                              <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                              <span className="sr-only">
                                Kontrol ediliyor...
                              </span>
                              <span>Kontrol ediliyor...</span>
                            </span>
                          ) : (
                            <span>Giriş yap</span>
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>

                <div className="py-5 text-center">
                  <span className="text-xs text-uppercase font-semibold">
                    veya
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="w-full">
                    <a
                      href="#"
                      className="flex flex-col items-center hover:bg-lightgray/90 text-midgray hover:text-secondary border hover:border-lightgray/90 text-center rounded px-6 py-2 text-sm w-full transition duration-150 ease-out md:ease-in"
                    >
                      <MdFacebook className="inline-block" />
                      Facebook
                    </a>
                  </div>
                  <div className="w-full">
                    <a
                      href="#"
                      className="flex flex-col items-center hover:bg-lightgray/90 text-midgray hover:text-secondary border hover:border-lightgray/90 text-center rounded px-6 py-2 text-sm w-full transition duration-150 ease-out md:ease-in"
                    >
                      <FcGoogle className="inline-block" />
                      Google
                    </a>
                  </div>
                </div>
                <div className="my-6">
                  <p>
                    <span className="mr-1">Hesabınız yok mu?</span>
                    <Link
                      href="/hesap/kayit-ol"
                      className="text-warning text-sm font-semibold"
                    >
                      Kayıt ol
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

export async function getStaticProps(context) {
  const { locale } = context
  const globalLocale = await getGlobalData(locale)

  return {
    props: {
      global: globalLocale.data,
    },
    revalidate: 15,
  }
}
