import { useState } from "react"
import Router from "next/router"
import Select from "react-select"
import { getSession, useSession } from "next-auth/react"
import { getEditors, userFirmCheck, fetchAPI, getGlobalData } from "@/utils/api"
import { getSectorListData } from "@/utils/api-firms"
import { slugify } from "@/utils/slugify"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import { badwords } from "@/utils/badwords"
import { BiLoaderCircle } from "react-icons/bi"
import { RiArrowGoBackFill } from "react-icons/ri"
import Link from "next/link"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
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
const DynamicFirm = ({
  sectorList,
  pageContext,
  isEditor,
  userData,
  global,
}) => {
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
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
    slug: `/firma/olustur`,
    datePublished: Moment().toISOString(),
    dateModified: Moment().toISOString(),
    tags: [],
  }

  const firmDataSchema = yup.object().shape({
    sector: yup.string().required("Sektör seçimi zorunludur!"),
    name: yup
      .string()
      .required("Firma adı zorunludur!")
      .min(10, "Çok kısa, lütfen kontrol ediniz!")
      .max(300, "Çok uzun, lütfen kontrol ediniz!")
      .test("Bad Word", "Argo ifade içeremez!", function (value) {
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
    <Layout global={global} pageContext={pageContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col items-start gap-4 pt-2">
          <Toaster position="top-right" reverseOrder={false} />
          <h1 className="font-extrabold text-xl lg:text-xxl">
            Yeni Firma Oluştur
          </h1>
          <Formik
            initialValues={{
              sector: "",
              name: "",
            }}
            validationSchema={firmDataSchema}
            onSubmit={async (
              values,
              { setSubmitting, setErrors, resetForm }
            ) => {
              setLoading(true)
              try {
                setErrors({ api: null })
                const result = await fetchAPI(
                  `/firms`,
                  {},
                  {
                    method: "POST",
                    body: JSON.stringify({
                      data: {
                        firm_category: values.sector,
                        name: values.name,
                        slug: slugify(values.name),
                        publishedAt: null,
                        user: isEditor ? null : userData.id,
                      },
                    }),
                  }
                )
                setTimeout(() => {
                  Router.push(`/firma/${result.data.attributes.slug}/taslak`)
                }, 2000)
                notify("success", "Bilgileriniz güncellenmiştir.")
              } catch (err) {
                setLoading(false)
                setSubmitting(false)
                console.error(err)
                notify(
                  "error",
                  "Bilgileriniz kaydedilirken bir sorunla karşılaştık."
                )
                setErrors({ api: err.message })
              }
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
                  keyCode="name"
                  text="Firma Adı"
                  placeholder="Lütfen giriniz"
                  errors={errors}
                  touched={touched}
                  disabled={!isEditor && userData.attributes.firm.data}
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
                      isDisabled={!isEditor && userData.attributes.firm.data}
                      name="sector"
                      placeholder="Sektör Seçiniz"
                      options={[
                        ...sectorList.map((item) => ({
                          value: item.id,
                          label: item.attributes.name,
                        })),
                      ]}
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
                {errors.api && (
                  <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                    {errors.api}
                  </p>
                )}
                {!isEditor && userData.attributes.firm.data && (
                  <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                    Bir kullanıcı sadece bir adet firma oluşturabilir!
                  </p>
                )}
                <div className="flex justify-end gap-2 mb-6">
                  <div className="flex flex-col lg:w-1/5 hidden lg:flex"></div>
                  <div className="flex flex-col lg:w-1/5">
                    <Link
                      className="w-full bg-midgray hover:bg-midgray/90 text-white rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                      href={`/firma/rehberi`}
                    >
                      <RiArrowGoBackFill className="mr-2 inline-block align-middle w-4 h-4 text-gray-200" />
                      <span>Geri dön</span>
                    </Link>
                  </div>
                  <div className="flex flex-col lg:w-3/5">
                    <button
                      className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                      type="submit"
                      disabled={
                        loading || (!isEditor && userData.attributes.firm.data)
                      }
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
  const { locale, locales, defaultLocale } = context
  const globalLocale = await getGlobalData(locale)
  const session = await getSession(context)
  const pageContext = {
    locale,
    locales,
    defaultLocale,
  }
  if (session == null) {
    return {
      redirect: {
        destination: "/hesap/giris-yap?redirect=",
        permanent: false,
      },
    }
  }
  const userData = await userFirmCheck(session.id)
  const isEditor = await getEditors({
    user: session.id,
  })
  const sectorList = await getSectorListData()
  return {
    props: {
      global: globalLocale.data,
      sectorList: sectorList,
      isEditor: isEditor,
      userData: userData,
      pageContext: {
        ...pageContext,
      },
    },
  }
}

export default DynamicFirm
