import React from "react"
import { useRouter } from "next/router"
import { fetchAPI, getGlobalData } from "@/utils/api"
import { getSectorData, getSectorListData } from "@/utils/api-firms"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import FirmView from "@/components/elements/firmView"
import FirmViewSidebar from "@/components/elements/firmViewSidebar"
import Moment from "moment"
import "moment/locale/tr"

const DynamicSectors = ({
  sectorContent,
  sectorList,
  global,
  sectorContext,
}) => {
  const router = useRouter()
  if (!router.isFallback && !sectorContent) {
    return {
      notFound: true,
    }
  }

  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const metadata = {
    id: 1,
    metaTitle: `${sectorContent.name}`,
    metaDescription: `${sectorContent.name}`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: "/sektor/" + sectorContext.slug,
    datePublished: Moment(sectorContext.createdAt).toISOString(),
    dateModified: Moment(sectorContext.updatedAt).toISOString(),
    tags: [],
  }
  return (
    <Layout global={global} pageContext={sectorContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-row items-end justify-between border-b border-midgray">
              <h1 className="font-semibold text-xl text-darkgray">
                {sectorContent.name.toLocaleUpperCase("tr")}{" "}
                <span className="text-midgray">FİRMALARI</span>
              </h1>
            </div>
            <p>
              {sectorContent.name} sektöründe faaliyet gösteren ({" "}
              <span className="text-danger font-bold">
                {sectorContent.firms.data.length}
              </span>{" "}
              ) adet firma bulundu.
            </p>
            <div className="w-full gap-2 mb-12">
              <FirmView firms={sectorContent.firms} />
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
  const categories = await context.locales.reduce(
    async (currentCategoriesPromise, locale) => {
      const currentCategories = await currentCategoriesPromise
      const localeCategories = await fetchAPI("/firm-categories", {
        locale,
        fields: ["slug"],
      })
      return [...currentCategories, ...localeCategories.data]
    },
    Promise.resolve([])
  )

  const paths = categories.map((category) => {
    const { slug, locale } = category.attributes
    const slugArray = !slug ? false : slug

    return {
      params: { slug: slugArray },
      locale,
    }
  })

  return { paths, fallback: "blocking" }
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)
  const categoryData = await getSectorData({
    slug: params.slug,
  })
  const sectorList = await getSectorListData()

  if (categoryData == null) {
    return {
      notFound: true,
    }
  }

  const { name, firms, slug, createdAt, updatedAt } = categoryData.attributes

  const sectorContent = {
    id: categoryData.id,
    name,
    firms,
  }

  const sectorContext = {
    locale,
    locales,
    defaultLocale,
    slug,
    createdAt,
    updatedAt,
  }

  return {
    props: {
      sectorContent: sectorContent,
      sectorList: sectorList,
      global: globalLocale.data,
      sectorContext: {
        ...sectorContext,
      },
    },
    revalidate: 60 * 60 * 4,
  }
}

export default DynamicSectors
