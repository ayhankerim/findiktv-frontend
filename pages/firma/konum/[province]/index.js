import React from "react"
import { useRouter } from "next/router"
import {
  getAllFirmListData,
  getSectorListData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import { turkeyApi } from "@/utils/turkiye-api"
import { slugify } from "@/utils/slugify"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import FirmView from "@/components/elements/firmView"
import FirmViewSidebar from "@/components/elements/firmViewSidebar"
import Moment from "moment"
import "moment/locale/tr"

const DynamicSectors = ({
  firmsContent,
  provinceData,
  sectorList,
  global,
  firmsContext,
}) => {
  const router = useRouter()
  if (!router.isFallback && firmsContent.firms.data < 1) {
    return {
      notFound: true,
    }
  }

  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }
  const metadata = {
    id: 1,
    metaTitle: provinceData.name + " Bölgesinde Faaliyet Gösteren Firmalar",
    metaDescription:
      provinceData.name +
      " Bölgesinde faaliyet gösteren ve sitemizde kayıtlı firmaları görmek için bu sayfayı ziyaret edebilirsiniz.",
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: "/sektor/konum/" + firmsContext.province,
    datePublished: Moment(
      firmsContent.firms.data[0].attributes.createdAt
    ).toISOString(),
    dateModified: Moment(
      firmsContent.firms.data[0].attributes.updatedAt
    ).toISOString(),
    tags: [],
  }
  return (
    <Layout global={global} pageContext={firmsContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-row items-end justify-between border-b border-midgray">
              <h1 className="font-semibold text-xl text-darkgray">
                {provinceData.name.toLocaleUpperCase("tr")}{" "}
                <span className="text-midgray">
                  BÖLGESİNE HİZMET VEREN FİRMALAR
                </span>
              </h1>
            </div>
            <p>
              {provinceData.name} bölgesinde faaliyet gösteren ({" "}
              <span className="text-danger font-bold">
                {firmsContent.firms.data.length}
              </span>{" "}
              ) adet firma bulundu.
            </p>
            <div className="w-full gap-2 mb-12">
              <FirmView firms={firmsContent.firms} />
            </div>
          </div>
          <aside className="sticky top-2 flex-none w-full md:w-[336px] lg:w-[250px] xl:w-[336px]">
            <FirmViewSidebar sectorList={sectorList} />
          </aside>
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticPaths(context) {
  const paths = turkeyApi.provinces.map((item) => {
    return {
      params: { province: slugify(item.name) },
    }
  })
  return { paths, fallback: "blocking" }
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale } = context

  const provinceData = turkeyApi.provinces.find(
    (item) => slugify(item.name) === params.province
  )

  const globalLocale = await getGlobalData(locale)
  const allFirmsData = await getAllFirmListData()
  const filteredFirms = allFirmsData.firms.data.filter(
    (item) =>
      item.attributes.servicePoints &&
      item.attributes.servicePoints.some(
        (point) =>
          point.provinces &&
          point.provinces.some((province) => province.id === provinceData.id)
      )
  )
  const sectorList = await getSectorListData()
  if (filteredFirms.length < 1) {
    return {
      notFound: true,
    }
  }

  const firmsContext = {
    locale,
    locales,
    defaultLocale,
    province: params.province,
  }

  return {
    props: {
      firmsContent: { firms: { data: filteredFirms } },
      provinceData: provinceData,
      sectorList: sectorList,
      global: globalLocale.data,
      firmsContext: {
        ...firmsContext,
      },
    },
    revalidate: 60 * 60 * 4,
  }
}

export default DynamicSectors
