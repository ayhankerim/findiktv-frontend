import React from "react"
import { useRouter } from "next/router"
import ErrorPage from "next/error"
import useSWRInfinite from "swr/infinite"
import {
  getCategoryData,
  getAdsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import Layout from "@/components/layout"
import ArticleBlock from "@/components/elements/article/articles-block"
import ArticleSlider from "@/components/elements/article/article-slider"
import Seo from "@/components/elements/seo"
import LatestComments from "@/components/elements/comments/latest-comments"
import ArticleMostVisited from "@/components/elements/article/articles-most-visited"

const fetcher = (url) => fetch(url).then((res) => res.json())
const PAGE_SIZE = 12
const SLIDER_SIZE = 5

const DynamicCategories = ({
  categoryContent,
  advertisement,
  metadata,
  preview,
  global,
  categoryContext,
}) => {
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
      `/api/articles?${qs.stringify(
        {
          filters: {
            category: {
              slug: {
                $eq: categoryContext.slug,
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
  if (!router.isFallback && !categoryContent) {
    return <ErrorPage statusCode={404} />
  }

  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  // Merge default site SEO settings with page specific SEO settings
  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  return (
    <Layout global={global} pageContext={categoryContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="Slider -mx-8">
          <ArticleSlider slug={categoryContext.slug} size={SLIDER_SIZE} />
        </div>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-row items-end justify-between border-b border-midgray">
              <h1 className="font-semibold text-xl text-darkgray">
                {categoryContent.title.toLocaleUpperCase(
                  categoryContext.locale
                )}{" "}
                <span className="text-midgray">HABERLERİ</span>
              </h1>
            </div>
            <div className="flex flex-wrap -mx-2">
              {issues.map((issue) =>
                issue.data.map((post, i) => (
                  <ArticleBlock
                    key={post.id}
                    article={post}
                    category={categoryContext.slug}
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
          <aside className="sticky top-2 flex-none w-full md:w-[336px] lg:w-[250px] xl:w-[336px]">
            <ArticleMostVisited size={10} slug={null} />
            <LatestComments size={5} position="sidebar" offset={0} />
          </aside>
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
      const localeCategories = await fetchAPI("/categories", {
        locale,
        fields: ["slug", "locale"],
      })
      return [...currentCategories, ...localeCategories.data]
    },
    Promise.resolve([])
  )

  const paths = categories.map((category) => {
    const { slug, locale } = category.attributes
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
  const categoryData = await getCategoryData({
    slug: params.slug,
    locale,
  })

  if (categoryData == null) {
    // Giving the page no props will trigger a 404 page
    return { props: {} }
  }

  // We have the required page data, pass it to the page component
  const { title, metadata, localizations, slug } = categoryData.attributes

  const categoryContent = {
    id: categoryData.id,
    title,
  }

  const categoryContext = {
    locale,
    locales,
    defaultLocale,
    slug,
    localizations,
  }

  //const localizedPaths = getLocalizedPaths(productContext)

  return {
    props: {
      categoryContent: categoryContent,
      advertisement: advertisement,
      metadata,
      global: globalLocale.data,
      categoryContext: {
        ...categoryContext,
        //localizedPaths,
      },
    },
    revalidate: 600,
  }
}

export default DynamicCategories
