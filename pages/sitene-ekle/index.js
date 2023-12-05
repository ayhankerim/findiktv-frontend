import React from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { getGlobalData } from "@/utils/api"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import SimpleSidebar from "@/components/elements/simple-sidebar"

const SiteneEkle = ({ global }) => {
  const metadata = {
    id: 1,
    metaTitle: "Sitene Ekle | FINDIK TV",
    metaDescription:
      "Web sitenizde kullanabileceğiniz kullanışlı modüller; fındık fiyatlar ve şehir şehir fındık fiyat modülü ve fındık haberleri modülleri ile sitenizi zenginleştirin.",
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

  return (
    <Layout global={global} pageContext={null}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white md:flex-row md:flex-nowrap gap-2 align-top pb-6">
        <div className="w-full md:w-8/12">
          <div className="flex flex-row items-end justify-between border-b border-midgray">
            <h1 className="font-semibold text-xl text-darkgray">
              SİTENE <span className="text-midgray">EKLE</span>
            </h1>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="findik-fiyatlari"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Fındık Fiyatları Modülü
              </label>
              <div className="mt-2">
                {/* <iframe
                  src="/sitene-ekle/modul/findik-fiyatlari"
                  width={500}
                  height={845}
                  className="bg-white m-0 p-0 w-full h-100"
                ></iframe> */}
                <textarea
                  id="findik-fiyatlari"
                  name="findik-fiyatlari"
                  rows={3}
                  className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  defaultValue={`<iframe src="${process.env.NEXT_PUBLIC_SITE_URL}/sitene-ekle/modul/findik-fiyatlari" width="500" height="500"></iframe>`}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Buradaki kodu kullanarak sitenizde kullanabilirsiniz, width ve
                height değerlerini kendi sitenize göre düzenleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
        <SimpleSidebar />
      </main>
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
    revalidate: 24 * 60 * 60,
  }
}

export default SiteneEkle
