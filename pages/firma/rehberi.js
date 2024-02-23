import React, { useState } from "react"
import Select from "react-select"
import Link from "next/link"
import Image from "next/image"
import { getGlobalData } from "@/utils/api"
import {
  getLatestFirms,
  getUpdatedFirms,
  searchFirm,
  getSectorListData,
} from "@/utils/api-firms"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import FirmView from "@/components/elements/firmView"
import { turkeyApi } from "@/utils/turkiye-api"
import { BiLoaderCircle } from "react-icons/bi"
import ModuleLoader from "@/components/elements/module-loader"
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
const DynamicSectors = ({
  sectorList,
  latestFirms,
  updatedFirms,
  global,
  pageContext,
}) => {
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState()
  const metadata = {
    id: 1,
    metaTitle: `Firma Rehberi`,
    metaDescription: `Firma rehberinde listeli firmalara ulaş, firma ara ve firmanı ekle ve düzenle...`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: "/firma/rehberi",
    datePublished: Moment().toISOString(),
    dateModified: Moment().toISOString(),
    tags: [],
  }
  const searchSchema = yup.object().shape({
    search: yup.string().max(20, "Çok uzun, lütfen kontrol ediniz!"),
  })
  return (
    <Layout global={global} pageContext={pageContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <Toaster position="top-right" reverseOrder={false} />
      <Formik
        initialValues={{
          search: "",
        }}
        validationSchema={searchSchema}
        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
          setLoading(true)
          try {
            setErrors({ api: null })
            const searchResult = await searchFirm({
              search: values.search,
              province: values.province
                ? `: ${parseInt(values.province)},`
                : undefined,
              sector: values.sector ? parseInt(values.sector) : undefined,
            })
            setSearchResults(searchResult)
            searchResult.data.length > 0
              ? notify(
                  "success",
                  `Aramanızla eşleşen ${searchResult.data.length} sonuç bulundu.`
                )
              : notify("error", "Eşleşen sonuç bulunamadı.")
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
        {({ errors, touched, setFieldValue }) => (
          <Form className="w-full">
            <div className="flex flex-col justify-center items-center relative min-h-[500px] h-[60vh] w-full mb-8">
              <div className="container relative flex flex-col w-full justify-center gap-3 z-20">
                <h1 className="text-xxl text-white text-center">
                  FİRMA REHBERİNDE ARA
                </h1>
                <div className="flex flex-col lg:flex-row w-full justify-center gap-2 lg:gap-0 mb-2">
                  <div className="w-full lg:w-1/5">
                    <Field
                      className={classNames(
                        errors.search && touched.search
                          ? "border-danger"
                          : "border-inputgray",
                        "w-full text-base focus:outline outline-offset-2 outline-secondary/30 h-[50px] px-2 border"
                      )}
                      type="text"
                      name="search"
                      id="search"
                      placeholder="Firma adı"
                    />
                  </div>
                  <div className="w-full lg:w-1/5">
                    <Select
                      classNames={{
                        control: (state) =>
                          "w-full text-base focus:outline outline-offset-2 outline-secondary/30 h-[50px] px-2 border !rounded-none",
                      }}
                      classNamePrefix="react-select"
                      isDisabled={false}
                      isLoading={loading}
                      isClearable={true}
                      isSearchable={true}
                      name="sector"
                      placeholder="Tüm sektörler"
                      options={sectorList.map((item) => ({
                        value: item.id,
                        label: item.attributes.name,
                      }))}
                      onChange={(e) => {
                        setFieldValue("sector", e?.value)
                      }}
                    />
                  </div>
                  <div className="w-full lg:w-1/5">
                    <Select
                      classNames={{
                        control: (state) =>
                          "w-full text-base focus:outline outline-offset-2 outline-secondary/30 h-[50px] px-2 border !rounded-none",
                      }}
                      classNamePrefix="react-select"
                      isDisabled={false}
                      isLoading={loading}
                      isClearable={true}
                      isSearchable={true}
                      name="province"
                      placeholder="Tüm Türkiye"
                      options={turkeyApi.provinces.map((item) => ({
                        value: item.id,
                        label: item.name,
                      }))}
                      onChange={(e) => {
                        setFieldValue("province", e?.value)
                      }}
                    />
                  </div>
                  <div className="w-full lg:w-1/5">
                    <button
                      className="disabled:opacity-75 w-full lg:w-[150px] bg-primary hover:bg-primary/90 text-white h-[50px] px-2 text-base transition duration-150 ease-out md:ease-in"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span role="status">
                          <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                          <span className="sr-only">Yükleniyor...</span>
                        </span>
                      ) : (
                        <span>Ara</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row w-full max-w-[900px] h-[30px] justify-center gap-0">
                  {errors.search && touched.search && (
                    <p className="text-danger">{errors.search}</p>
                  )}
                  {errors.api && (
                    <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                      {errors.api}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute h-full w-full bg-gradient-to-t from-secondary/70 to-secondary/50 z-10"></div>
              <Image
                src="https://imagedelivery.net/A_vnS-Tfmrf1TT32XC1EgA/7d23fc22-4aae-48bd-1dc4-51434b652e00/public"
                alt="Firma ara arka plan"
                className="absolute inset-0 h-full w-full object-contain rounded z-0"
                priority={true}
                fill
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
            {searchResults && searchResults.data.length > 0 && (
              <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
                  <div className="flex flex-col w-full gap-3">
                    <ModuleLoader
                      title="ARAMA SONUÇLARI"
                      theme="green"
                      component=""
                    >
                      <FirmView firms={searchResults} view={"card"} />
                    </ModuleLoader>
                  </div>
                </div>
              </main>
            )}
          </Form>
        )}
      </Formik>
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col w-full gap-3">
            <ModuleLoader
              title="SON GİRİLEN FİRMALAR"
              theme="default"
              component=""
            >
              <FirmView firms={updatedFirms} view={"card"} />
            </ModuleLoader>
            <ModuleLoader
              title="SON GÜNCELLENEN FİRMALAR"
              theme="default"
              component=""
            >
              <FirmView firms={latestFirms} view={"card"} />
            </ModuleLoader>
            <ModuleLoader title="SEKTÖRLER" theme="default" component="">
              <div className="flex gap-4 my-4">
                {sectorList
                  .slice()
                  .sort(
                    (a, b) =>
                      b.attributes.firms.data.length -
                      a.attributes.firms.data.length
                  )
                  .map((item, i) => (
                    <div key={item.id}>
                      <Link
                        href={`/firma/sektor/${item.attributes.slug}`}
                        className="flex justify-between p-2 hover:bg-lightgray"
                      >
                        <span>{item.attributes.name}</span>
                      </Link>
                    </div>
                  ))}
              </div>
            </ModuleLoader>
          </div>
        </div>
      </main>
    </Layout>
  )
}
export async function getServerSideProps(context) {
  const { locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)
  const latestFirms = await getLatestFirms()
  const updatedFirms = await getUpdatedFirms()
  const sectorList = await getSectorListData()

  const pageContext = {
    locale,
    locales,
    defaultLocale,
  }

  return {
    props: {
      sectorList: sectorList,
      latestFirms: latestFirms,
      updatedFirms: updatedFirms,
      global: globalLocale.data,
      pageContext: {
        ...pageContext,
      },
    },
  }
}

export default DynamicSectors
