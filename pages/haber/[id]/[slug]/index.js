import React, { useEffect } from "react"
import ErrorPage from "next/error"
import Image from "next/image"
import { useRouter } from "next/router"
import { useDispatch } from "react-redux"
import {
  getArticleData,
  getAdsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import { updateAds } from "@/store/advertisements"
import { contentWithAds } from "@/utils/content-with-ads"
import Seo from "@/components/elements/seo"
import Breadcrumb from "@/components/elements/breadcrumb"
import Advertisement from "@/components/elements/advertisement"
import ArticleDates from "@/components/elements/date"
import ViewCounter from "@/components/elements/pageviews"
import ArticleShare from "@/components/elements/share"
import ArticleReactions from "@/components/elements/reactions"
import ArticleComments from "@/components/elements/comments/comments"
import Layout from "@/components/layout"
import { getLocalizedPaths } from "@/utils/localize"
import ArticleRelations from "@/components/elements/article/article-relations"
import LatestArticles from "@/components/elements/latest-articles"
import ArticleSidebar from "@/components/elements/article/article-sidebar"

const DynamicArticle = ({
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
  ]
  return (
    <Layout global={global} pageContext={articleContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container gap-4 pt-2 bg-white">
        <div className="w-full">
          <Breadcrumb items={breadcrumbElement} />
          <h1 className="font-extrabold text-xl lg:text-xxl">
            {articleContent.title}
          </h1>
          <article className="font-semibold text-lg text-darkgray">
            {articleContent.summary}
          </article>
          <div className="flex flex-row items-center sm:items-start justify-between mt-4 mb-2">
            <ArticleDates
              publishedAt={articleContent.publishedAt}
              updatedAt={articleContent.updatedAt}
            />
            <ViewCounter articleId={articleContent.id} pageType="articles" />
          </div>
          <ArticleShare
            position="articleTop"
            title={articleContent.title}
            slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${articleContent.id}/${articleContext.slug}`}
          />
        </div>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex-1">
            {/* Featured Image or Video Section*/}
            <div className="relative sm:w-full h-[300px] lg:h-[500px] -mx-4 sm:mx-0 md:mx-0 mb-2">
              <Image
                src={
                  articleContent.image.data.attributes.formats.large
                    ? articleContent.image.data.attributes.formats.large.url
                    : articleContent.image.data.attributes.formats.medium.url
                }
                alt={articleContent.image.data.attributes.alternativeText}
                className="sm:rounded-lg"
                priority={true}
                fill
                sizes="(max-width: 768px) 100vw,
                  (max-width: 800px) 50vw,
                  33vw"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
            <article
              className="NewsContent text-base"
              dangerouslySetInnerHTML={contentWithAds(
                articleContent.content,
                advertisement
              )}
              // preview={preview}
            />
            <div className="w-full h-[300px] lg:h-[120px] -mx-4 sm:mx-0">
              <Advertisement position="article-bottom-desktop" />
            </div>
            <ArticleRelations
              cities={articleContent.cities}
              tags={articleContent.tags}
              title={articleContent.title}
              slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${articleContent.id}/${articleContext.slug}`}
            />
            <LatestArticles
              current={articleContent.id}
              count={3}
              position="bottom"
            />
            <ArticleReactions article={articleContent.id} />
            <ArticleComments
              article={articleContent.id}
              product={null}
              slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${articleContent.id}/${articleContext.slug}`}
              infinite={false}
            />
          </div>
          <ArticleSidebar articleId={articleContent.id} />
        </div>
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
    //metadata,
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
    revalidate: 60,
  }
}

export default DynamicArticle
