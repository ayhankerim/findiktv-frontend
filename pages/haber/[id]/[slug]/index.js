import React, { useEffect } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { NewsArticleJsonLd } from "next-seo"
import { useRouter } from "next/router"
import { useDispatch } from "react-redux"
import { isMobile } from "react-device-detect"
import { getLocalizedPaths } from "@/utils/localize"
import { updateAds } from "@/store/advertisements"
import { contentWithAds } from "@/utils/content-with-ads"
import {
  getArticleData,
  getAdsData,
  fetchAPI,
  getGlobalData,
} from "@/utils/api"
import Layout from "@/components/layout"
import Sections from "@/components/sections-articles"
import Seo from "@/components/elements/seo"
import ArticleSidebar from "@/components/elements/article/article-sidebar"
import ModuleLoader from "@/components/elements/module-loader"
import Moment from "moment"
import "moment/locale/tr"

const Loader = ({ cssClass }) => (
  <div className={`lds-ellipsis ${cssClass}`}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)
const Advertisement = dynamic(
  () => import("@/components/elements/advertisement"),
  {
    loading: () => <Loader />,
    ssr: false,
  }
)
const Breadcrumb = dynamic(() => import("@/components/elements/breadcrumb"), {
  loading: () => <Loader />,
})
const ViewCounter = dynamic(() => import("@/components/elements/pageviews"), {
  loading: () => <Loader />,
  ssr: false,
})
const ArticleDates = dynamic(() => import("@/components/elements/date"), {
  loading: () => <Loader />,
})
const ArticleShare = dynamic(() => import("@/components/elements/share"), {
  loading: () => <Loader />,
})
const ArticleReactions = dynamic(
  () => import("@/components/elements/reactions"),
  {
    loading: () => <Loader />,
    ssr: false,
  }
)
const ArticleComments = dynamic(
  () => import("@/components/elements/comments/comments"),
  {
    loading: () => <Loader />,
    ssr: false,
  }
)
const ArticleRelations = dynamic(
  () => import("@/components/elements/article/article-relations"),
  {
    loading: () => <Loader />,
  }
)
const LatestArticles = dynamic(
  () => import("@/components/elements/latest-articles"),
  {
    loading: () => <Loader />,
    ssr: false,
  }
)

const DynamicArticle = ({
  sections,
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
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }
  if (metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const breadcrumbElement = [
    {
      title: (articleContent.category.data
        ? articleContent.category.data.attributes.title
        : "Gündem"
      ).toLocaleUpperCase("tr"),
      slug:
        "/kategori/" +
        (articleContent.category.data
          ? articleContent.category.data.attributes.slug
          : "gundem"),
    },
    {
      title: articleContent.title.toLocaleUpperCase("tr"),
      slug: "/haber/" + articleContent.id + "/" + articleContext.slug,
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
      <main className="container gap-4 pt-2 bg-white">
        <div className="w-full">
          <Breadcrumb items={breadcrumbElement} />
          <h1 className="font-extrabold text-xl lg:text-xxl">
            {articleContent.title}
          </h1>
          <NewsArticleJsonLd
            url={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${articleContent.id}/${articleContext.slug}`}
            title={articleContent.title}
            images={[
              `${articleContent.homepage_image.data.attributes.url}`,
              `${articleContent.image.data.attributes.url}`,
            ]}
            section={
              articleContent.category.data
                ? articleContent.category.data.attributes.title
                : "Gündem"
            }
            keywords={articleContent.tags.data[0]?.attributes.title}
            datePublished={Moment(articleContent.publishedAt).toISOString()}
            dateModified={Moment(articleContent.updatedAt).toISOString()}
            authorName="Kerim Ayhan"
            publisherName="FINDIK TV"
            publisherLogo={`${process.env.NEXT_PUBLIC_SITE_URL}/uploads/small_logo_findiktv_2000_92bc7df5ca.png`}
            description={articleContent.summary}
            body={articleContent.content.replace(/(<([^>]+)>)/gi, "")}
            isAccessibleForFree={true}
          />
          <article className="font-semibold text-lg text-darkgray">
            {articleContent.summary}
          </article>
          <div className="flex flex-row items-center sm:items-start justify-between mt-4 mb-2">
            <ArticleDates
              publishedAt={articleContent.publishedAt}
              updatedAt={articleContent.updatedAt}
            />
            <ViewCounter article={articleContent.id} />
          </div>
          {!isMobile && (
            <ArticleShare
              position="articleTop"
              title={articleContent.title}
              slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${articleContent.id}/${articleContext.slug}`}
            />
          )}
        </div>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex-1">
            <div className="relative sm:w-full h-[300px] lg:h-[500px] -mx-4 sm:mx-0 md:mx-0 mb-2">
              <Image
                src={articleContent.image.data.attributes.url}
                alt={articleContent.title}
                className="sm:rounded-lg"
                priority={true}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhZPQAIhwMsJ60FNgAAAABJRU5ErkJggg=="
                fill
                sizes="(max-width: 768px) 100vw,
                  (max-width: 800px) 50vw,
                  33vw"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
            <Sections sections={sections} preview={preview} />
            <article
              className="NewsContent text-base"
              dangerouslySetInnerHTML={contentWithAds(
                articleContent.content,
                advertisement
              )}
              // preview={preview}
            />
            <div className="w-full h-[300px] lg:h-[120px] -mx-2 sm:mx-0">
              <Advertisement position="article-bottom-desktop" />
            </div>
            <ArticleRelations
              cities={articleContent.cities}
              tags={articleContent.tags}
              title={articleContent.title}
              slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${articleContent.id}/${articleContext.slug}`}
            />
            <ModuleLoader
              title="İLGİNİZİ ÇEKEBİLİR"
              theme="default"
              component="LatestArticles"
            >
              <LatestArticles
                current={articleContent.id}
                count={3}
                position="bottom"
                product={null}
                city={null}
              />
            </ModuleLoader>
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
    const slugArray = !slug ? false : slug
    const idArray = !id ? "" : id

    return {
      params: { id: JSON.stringify(idArray), slug: slugArray },
      locale,
    }
  })

  return { paths, fallback: true }
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale, preview = null } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()
  const articleData = await getArticleData({
    slug: params.slug,
    id: params.id,
    locale,
    preview,
  })

  if (articleData == null) {
    return {
      notFound: true,
    }
  }

  const {
    title,
    summary,
    content,
    contentSections,
    publishedAt,
    updatedAt,
    image,
    homepage_image,
    category,
    cities,
    tags,
    localizations,
    slug,
    products,
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
    homepage_image,
    category,
    cities,
    tags,
    products,
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
      sections: contentSections,
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

export default DynamicArticle
