import React, { useEffect } from "react"
import ErrorPage from "next/error"
import {
  getArticleData,
  getAdsData,
  //getCommentsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import Seo from "@/components/elements/seo"
import NextImage from "@/components/elements/image"
import Breadcrumb from "@/components/elements/breadcrumb"
import Advertisement from "@/components/elements/advertisement"
import ArticleDates from "@/components/elements/date"
import ViewCounter from "@/components/elements/pageviews"
import ArticleShare from "@/components/elements/share"
import ArticleReactions from "@/components/elements/reactions"
import ArticleComments from "@/components/elements/comments/comments-infinite"
import ArticleSidebar from "@/components/elements/article/article-sidebar"
import { useRouter } from "next/router"
import Layout from "@/components/layout"
import { getLocalizedPaths } from "@/utils/localize"

// The file is called [[...slug]].js because we're using Next's
// optional catch all routes feature. See the related docs:
// https://nextjs.org/docs/routing/dynamic-routes#optional-catch-all-routes

const DynamicArticle = ({
  articleContent,
  advertisement,
  metadata,
  preview,
  global,
  articleContext,
}) => {
  const router = useRouter()
  // Check if the required data was provided
  if (!router.isFallback && !articleContent.content?.length) {
    return <ErrorPage statusCode={404} />
  }

  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  // Merge default site SEO settings with page specific SEO settings
  if (metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const advertisementFunc = (position) => {
    switch (position) {
      case "article-top-desktop":
        return advertisement.filter(
          (placeholder) => placeholder.attributes.placeholder === position
        )[0].attributes.code
      case "article-inline-desktop":
        return advertisement.filter(
          (placeholder) => placeholder.attributes.placeholder === position
        )[0].attributes.code
      case "article-bottom-desktop":
        return advertisement.filter(
          (placeholder) => placeholder.attributes.placeholder === position
        )[0].attributes.code
      default:
        return "articleTop"
    }
  }
  const createFullPostMarkup = () => {
    let paraArray = articleContent.content.split("</p>")
    let NewsContentText = ""
    paraArray.forEach(myFunction)
    function myFunction(item, index) {
      if (
        Number((paraArray.length / 2).toFixed(0)) - 1 === index ||
        index === 6
      ) {
        NewsContentText +=
          item +
          `<div class="adsInline"><div class="band"><span>REKLAM</span></div>${advertisementFunc(
            "article-inline-desktop"
          )}<div class="band"></div></div>`
      } else {
        NewsContentText += item
      }
    }
    return {
      __html: `<div class="w-[336px] h-[280px] float-left mr-4 mb-4">${advertisementFunc(
        "article-top-desktop"
      )}</div>${NewsContentText}`,
    }
  }
  const breadcrumbElement = [
    {
      title: articleContent.category.data.attributes.title.toLocaleUpperCase(
        articleContent.locale
      ),
      slug: "/kategori/" + articleContent.category.data.attributes.slug,
    },
    {
      title: articleContent.title.toLocaleUpperCase(articleContent.locale),
      slug: "/haber/" + articleContent.id + "/" + articleContext.slug,
    },
    {
      title: "YORUMLAR",
      slug:
        "/haber/" + articleContent.id + "/" + articleContext.slug + "/yorumlar",
    },
  ]
  return (
    <Layout global={global} pageContext={articleContext}>
      <Seo metadata={metadataWithDefaults} />
      <main className="container flex flex-row items-start justify-between gap-2 pt-2 bg-white">
        <div className="flex-1 mt-2">
          <Breadcrumb items={breadcrumbElement} />
          <h1 className="font-extrabold text-xxl">
            {articleContent.title}{" "}
            <span className="text-midgray">
              haberi için yapılan tüm yorumlar
            </span>
          </h1>
          <ArticleComments
            article={articleContent.id}
            product={null}
            slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${articleContent.id}/${articleContext.slug}`}
            infinite={true}
          />
        </div>
        <ArticleSidebar articleId={articleContent.id} />
      </main>
    </Layout>
  )
}

export async function getStaticPaths(context) {
  // Get all pages from Strapi
  const articles = await context.locales.reduce(
    async (currentArticlesPromise, locale) => {
      const currentArticles = await currentArticlesPromise
      const localeArticles = await fetchAPI("/articles", {
        locale,
        fields: ["slug", "locale", "id"],
      })
      return [...currentArticles, ...localeArticles.data]
    },
    Promise.resolve([])
  )

  const paths = articles.map((article) => {
    const { id } = article
    const { slug, locale } = article.attributes
    // Decompose the slug that was saved in Strapi
    const slugArray = !slug ? false : slug
    const idArray = !id ? "" : id

    return {
      params: { id: JSON.stringify(idArray), slug: slugArray },
      // Specify the locale to render
      locale,
    }
  })

  return { paths, fallback: true }
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale, preview = null } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()
  //const comments = params ? await getCommentsData(params.id) : null
  //console.log(JSON.stringify(comments))
  // Fetch pages. Include drafts if preview mode is on
  const articleData = await getArticleData({
    slug: params.slug,
    id: params.id,
    locale,
    preview,
  })

  if (articleData == null) {
    // Giving the page no props will trigger a 404 page
    return { props: {} }
  }

  // We have the required page data, pass it to the page component
  const {
    title,
    summary,
    content,
    publishedAt,
    updatedAt,
    image,
    category,
    cities,
    tags,
    reaction,
    metadata,
    localizations,
    slug,
  } = articleData.attributes

  const articleContent = {
    id: articleData.id,
    title,
    summary,
    content,
    publishedAt,
    updatedAt,
    image,
    category,
    cities,
    tags,
    //comments,
    reaction,
  }

  const articleContext = {
    locale,
    locales,
    defaultLocale,
    slug,
    localizations,
  }

  const localizedPaths = getLocalizedPaths(articleContext)

  return {
    props: {
      preview,
      articleContent: articleContent,
      advertisement: advertisement,
      metadata,
      global: globalLocale.data,
      articleContext: {
        ...articleContext,
        localizedPaths,
      },
    },
    revalidate: 60,
  }
}

export default DynamicArticle
