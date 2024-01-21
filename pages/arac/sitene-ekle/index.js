import React, { useEffect, useState, useCallback } from "react"
import { Formik, Form, Field } from "formik"
import { fetchAPI, getGlobalData } from "@/utils/api"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"

const PriceEntries = ({ userContent, global, userContext }) => {
  const [city, setCity] = useState("unye")
  const [cityList, setCityList] = useState([])

  useEffect(() => {
    fetchAPI("/cities", {
      filters: {
        prices: {
          product: { slug: { eq: "findik" } },
          type: { in: ["stockmarket", "openmarket"] },
        },
      },
      fields: ["title", "slug"],
      sort: ["title:asc"],
      pagination: {
        start: 0,
        limit: 100,
      },
    }).then((data) => {
      setCityList(data.data)
    })
  }, [city, setCityList])
  const metadata = {
    id: 1,
    metaTitle: `Sitene Ekle | FINDIK TV`,
    metaDescription: `Web siteniz için kullanabileceğiniz modülleri ve ayarlamalarına bu sayfadan ulaşabilirsiniz.`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: "/arac/sitene-ekle",
    datePublished: "2024-01-20T21:16:43.786Z",
    dateModified: "2024-01-20T21:16:43.786Z",
    tags: [],
  }
  const cityPriceHtmlCode = `<iframe width="300" height="108" src="${process.env.NEXT_PUBLIC_SITE_URL}/arac/sitene-ekle/${city}/findik/fiyati"></iframe>`
  return (
    <Layout global={global} pageContext={userContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <Formik
        initialValues={{
          city: city,
        }}
      >
        {({}) => (
          <Form className="border border-lightgray">
            <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
                <div className="flex flex-col flex-1 w-full gap-3">
                  <div className="flex flex-col p-4">
                    <div className="w-full">
                      <div className="flex justify-between">
                        <h1 className="font-semibold text-xl text-dark">
                          Sitene Ekle
                        </h1>
                        <div className="flex items-center gap-6"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold">
                          Şehir Fiyat Modülü
                        </h2>
                        <p>
                          Herhangi bir şehir için en güncel minimum ve maksimum
                          fiyatları gösteren modüldür.
                        </p>
                        <h3 className="text-base font-bold">Önizleme</h3>
                        <iframe
                          width={300}
                          height={108}
                          src={`/arac/sitene-ekle/${city}/findik/fiyati`}
                        ></iframe>
                        <h3 className="text-base font-bold">HTML Kodu</h3>
                        <Field
                          as="select"
                          name="city"
                          id="city"
                          className="border-midgray mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm max-w-[500px]"
                          onChange={(e) => {
                            setCity(e.target.value)
                          }}
                        >
                          {cityList.map((item, i) => (
                            <option
                              key={i}
                              value={item.attributes.slug}
                              defaultValue={
                                item.attributes.slug === city ? true : false
                              }
                            >
                              {item.attributes.title}
                            </option>
                          ))}
                        </Field>
                        <textarea
                          className="border rounded p-2 max-w-[500px]"
                          readOnly
                          value={cityPriceHtmlCode}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  const { locale } = context
  const globalLocale = await getGlobalData(locale)

  return {
    props: {
      global: globalLocale.data,
    },
  }
}

export default PriceEntries
