import React from "react"
import { useRouter } from "next/router"
import useSWRInfinite from "swr/infinite"
import { getTagData, getAdsData, fetchAPI, getGlobalData } from "@/utils/api"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import SimpleSidebar from "@/components/elements/simple-sidebar"
import ArticleBlock from "@/components/elements/article/articles-block"

const fetcher = (url) => fetch(url).then((res) => res.json())
const PAGE_SIZE = 12
const SLIDER_SIZE = 0

const DynamicTags = ({ tagContent, preview, global, tagContext }) => {
  const qs = require("qs")
  const {
    data,
    error,
    mutate,
    size = 1,
    setSize,
    isValidating,
  } = useSWRInfinite(
    (index) =>
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/articles?${qs.stringify(
        {
          filters: {
            tags: {
              slug: {
                $eq: tagContext.slug,
              },
            },
          },
          fields: ["slug", "title", "summary", "publishedAt"],
          populate: ["image"],
          sort: ["id:desc"],
          pagination: {
            start: SLIDER_SIZE * (index + 1),
            limit: PAGE_SIZE,
          },
        },
        {
          encodeValuesOnly: true, // prettify URL
        }
      )}`,
    fetcher
  )
  const issues = data ? [].concat(...data) : []
  const isLoadingInitialData = !data && !error
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === "undefined")
  const isEmpty = data?.[0].data?.length === 0
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1].data?.length < PAGE_SIZE)
  const isRefreshing = isValidating && data && data.length === size

  const router = useRouter()
  // Check if the required data was provided
  if (!router.isFallback && !tagContent) {
    return {
      notFound: true,
    }
  }

  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const metadata = {
    id: 1,
    metaTitle: `${tagContent.title} | FINDIK TV`,
    metaDescription: `${tagContent.title} | FINDIK TV`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  return (
    <Layout global={global} pageContext={tagContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-row items-end justify-between border-b border-midgray">
              <h1 className="font-semibold text-xl text-darkgray">
                {tagContent.title.toLocaleUpperCase("tr")}{" "}
                <span className="text-midgray">HABERLERİ</span>
              </h1>
            </div>
            <div className="flex flex-wrap -mx-2">
              {issues.map((issue) =>
                issue.data.map((post, i) => (
                  <ArticleBlock
                    key={post.id}
                    article={post}
                    tag={tagContext.slug}
                  />
                ))
              )}
            </div>
            <div className="mb-10">
              {isEmpty ? (
                <div className="flex items-center justify-center border-b mt-12 mb-20">
                  <p className="relative bg-white top-[1rem] border-r border-l py-2 px-6 ">
                    İçerik Bulunamadı!
                  </p>
                </div>
              ) : isReachingEnd ? (
                <div className="flex items-center justify-center border-b my-4">
                  <p className="relative bg-white top-[1rem] border-r border-l py-2 px-6 ">
                    Hepsi Bu Kadar
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center border-b my-4">
                  <button
                    type="button"
                    className="relative bg-white top-[1rem] border-r border-l py-2 px-6 hover:underline"
                    disabled={isLoadingMore || isReachingEnd}
                    onClick={() => setSize(size + 1)}
                  >
                    {isLoadingMore ? "Yükleniyor..." : "Daha Fazla Yükle"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <SimpleSidebar />
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticPaths(context) {
  // Get all pages from Strapi
  const categories = await context.locales.reduce(
    async (currentCategoriesPromise, locale) => {
      const currentCategories = await currentCategoriesPromise
      const localeCategories = await fetchAPI("/tags", {
        locale,
        fields: ["slug", "locale"],
      })
      return [...currentCategories, ...localeCategories.data]
    },
    Promise.resolve([])
  )

  const paths = categories.map((tag) => {
    const { slug, locale } = tag.attributes
    // Decompose the slug that was saved in Strapi
    const slugArray = !slug ? false : slug

    return {
      params: { slug: slugArray },
      // Specify the locale to render
      locale,
    }
  })

  return { paths, fallback: "blocking" }
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()
  // Fetch pages. Include drafts if preview mode is on
  const tagData = await getTagData({
    slug: params.slug,
    locale,
  })

  if (tagData == null) {
    // Giving the page no props will trigger a 404 page
    return {
      notFound: true,
    }
  }

  // We have the required page data, pass it to the page component
  const { title, localizations, slug } = tagData.attributes

  const tagContent = {
    id: tagData.id,
    title,
  }

  const tagContext = {
    locale,
    locales,
    defaultLocale,
    slug,
    localizations,
  }

  //const localizedPaths = getLocalizedPaths(productContext)

  return {
    props: {
      tagContent: tagContent,
      advertisement: advertisement,
      global: globalLocale.data,
      tagContext: {
        ...tagContext,
        //localizedPaths,
      },
    },
    revalidate: 600,
  }
}

export default DynamicTags
