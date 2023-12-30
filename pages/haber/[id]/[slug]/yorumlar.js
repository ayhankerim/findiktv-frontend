import React, { useEffect } from "react"
import { useRouter } from "next/router"
import { useDispatch } from "react-redux"
import {
  getArticleData,
  getAdsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import { updateAds } from "@/store/advertisements"
import Seo from "@/components/elements/seo"
import Breadcrumb from "@/components/elements/breadcrumb"
import ArticleComments from "@/components/elements/comments/comments"
import Layout from "@/components/layout"
import { getLocalizedPaths } from "@/utils/localize"
import ArticleSidebar from "@/components/elements/article/article-sidebar"
import Moment from "moment"
import "moment/locale/tr"

// The file is called [[...slug]].js because we're using Next's
// optional catch all routes feature. See the related docs:
// https://nextjs.org/docs/routing/dynamic-routes#optional-catch-all-routes

const DynamicArticleComments = ({
  articleContent,
  advertisement,
  metadata,
  preview,
  global,
  articleContext,
}) => {
  const router = useRouter()
  const dispatch = useDispatch()
  useEffect(() => {
    advertisement && dispatch(updateAds(advertisement))
  }, [advertisement, dispatch])
  // Check if the required data was provided
  if (!router.isFallback && !articleContent.content?.length) {
    return {
      notFound: true,
    }
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
  const breadcrumbElement = [
    {
      title:
        articleContent.category.data.attributes.title.toLocaleUpperCase("tr"),
      slug: "/kategori/" + articleContent.category.data.attributes.slug,
    },
    {
      title: articleContent.title.toLocaleUpperCase("tr"),
      slug: "/haber/" + articleContent.id + "/" + articleContext.slug,
    },
    {
      title: "YORUMLAR",
      slug:
        "/haber/" + articleContent.id + "/" + articleContext.slug + "/yorumlar",
    },
  ]
  const articleSeoData = {
    slug: "/haber/" + articleContent.id + "/" + articleContext.slug,
    datePublished: Moment(articleContent.publishedAt).toISOString(),
    dateModified: Moment(articleContent.updatedAt).toISOString(),
    tags: articleContent.tags,
  }
  return (
    <Layout global={global} pageContext={articleContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
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
            infinite={false}
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
        populate: {
          comments: {
            populate: ["id"],
            fields: ["id"],
          },
        },
        fields: ["slug", "locale", "id"],
      })
      return [...currentArticles, ...localeArticles.data]
    },
    Promise.resolve([])
  )
  const paths = articles
    .filter((item) => item.attributes.comments.data.length > 100)
    .map((article) => {
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

  return { paths, fallback: false }
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
    return {
      notFound: true,
    }
  }

  // We have the required page data, pass it to the page component
  const {
    title,
    summary,
    content,
    publishedAt,
    updatedAt,
    image,
    homepage_image,
    category,
    cities,
    tags,
    localizations,
    slug,
  } = articleData.attributes

  const metadata = {
    metaTitle: title,
    metaDescription: summary,
    shareImage: homepage_image,
    twitterUsername: "FindikTvcom",
  }

  const articleContent = {
    id: params.id,
    title,
    summary,
    content,
    publishedAt,
    updatedAt,
    image,
    category,
    cities,
    tags,
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
    revalidate: 60 * 60 * 24 * 30,
  }
}

export default DynamicArticleComments
