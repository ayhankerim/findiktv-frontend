import { useState } from "react"
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
  const [mailSend, setMailSend] = useState(false)
  const router = useRouter()

  const metadata = {
    id: 1,
    metaTitle: "Hesap Onaylama Mailini Tekrar Gönder | FINDIK TV",
    metaDescription:
      "Hesap oluşturdunuz ama hesabınızı onaylayamadıysanız, onay mailinin tekrar gönderilmesini sağlayabilirsiniz.",
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const loginSchema = yup.object().shape({
    email: yup
      .string()
      .email("Lütfen geçerli bir mail adresi giriniz!")
      .required("E-posta adresi gereklidir!"),
  })

  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }

  return (
    <Layout>
      <Toaster position="top-right" reverseOrder={false} />
      <Seo metadata={metadataWithDefaults} />
      <div className="px-5 py-5 lg:p-0 bg-white">
        <div className="flex justify-center w-full">
          <div className="lg:w-5/12 xl:w-4/12 p-12 xl:p-20 fixed left-0 top-0 h-screen overflow-y-hidden hidden lg:flex flex-col">
            <Image
              src={`${process.env.NEXT_PUBLIC_CLOUD_IMAGE_CORE_URL}9db77d3a-1cdb-4bc5-c236-20f990316500/format=auto,height=1000`}
              alt="Üretici hesabı"
              className="absolute inset-0 h-full w-full object-cover"
              priority={true}
              fill
            />
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
                    src={`${process.env.NEXT_PUBLIC_CLOUD_IMAGE_CORE_URL}84789d40-699b-40da-9930-3d2b9c9cb300/format=auto,w=250,q=100`}
                    alt="FINDIK TV"
                    width={200}
                    height={48}
                    className="mb-4"
                  />
                  <h1 className="text-lg leading-tight font-bold">
                    Hesap Onaylama Mailini Tekrar Gönder
                  </h1>
                </div>
                {mailSend ? (
                  <div className="text-base">
                    Hesap onaylama maili belirtmiş olduğunuz e-posta adresine{" "}
                    <span className="text-primary">gönderilmiştir.</span> Lütfen
                    e-posta kutunuzu kontrol ediniz.
                  </div>
                ) : (
                  <Formik
                    initialValues={{
                      email: "",
                    }}
                    enableReinitialize
                    validationSchema={loginSchema}
                    onSubmit={async (
                      values,
                      { setSubmitting, setErrors, resetForm }
                    ) => {
                      setLoading(true)
                      try {
                        await fetchAPI(
                          `/users?filters[email][$eq]=${values.email}&filters[confirmed][$eq]=false&fields[0]=email`,
                          {},
                          {
                            method: "GET",
                          }
                        ).then((data) => {
                          if (data.length > 0) {
                            fetchAPI(
                              `/auth/send-email-confirmation`,
                              {},
                              {
                                method: "POST",
                                body: JSON.stringify({
                                  email: values.email,
                                }),
                              }
                            ).then(async (data) => {
                              if (data.sent) {
                                resetForm({
                                  values: {
                                    email: "",
                                  },
                                })
                                setMailSend(true)
                                return
                              }
                            })
                          } else {
                            notify(
                              "error",
                              "Belirttiğiniz e-posta adresiyle ya kayıtlı bir hesap yok ya da hesap onaylıdır. Lütfen kontrol ediniz!"
                            )
                          }
                        })
                      } catch (err) {
                        setErrors(err)
                        notify(
                          "error",
                          "Şifre sıfırlama bağlantınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz!"
                        )
                      }
                      setLoading(false)
                      setSubmitting(false)
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
                        {errors.api && (
                          <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                            {errors.api}
                          </p>
                        )}
                        <div className="flex flex-row gap-2">
                          <button
                            className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-2 text-sm transition duration-150 ease-out md:ease-in"
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
                              <span>Onaylama mailini gönder</span>
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
                      href="/hesap/giris-yap"
                      className="text-warning text-sm font-semibold"
                    >
                      Giriş yap
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
