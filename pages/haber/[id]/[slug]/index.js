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
import { getCitiesPrice, getDefaultPriceValues } from "@/utils/api-prices"
import Layout from "@/components/layout"
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
const CityPriceList = dynamic(
  () => import("@/components/elements/price/city-price-list-new"),
  {
    loading: () => <Loader cssClass="h-[60px]" />,
  }
)

const DynamicArticle = ({
  articleContent,
  advertisement,
  metadata,
  global,
  articleContext,
  priceCitiesData,
  priceDefaultsData,
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
            {/* Featured Image or Video Section*/}
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
            <article
              className="NewsContent text-base"
              dangerouslySetInnerHTML={contentWithAds(
                articleContent.content,
                advertisement
              )}
              // preview={preview}
            />
            {articleContent.AddPricesComponent &&
              articleContent.products.data[0] && (
                <CityPriceList
                  product={articleContent.products.data[0].attributes.slug}
                  priceData={priceCitiesData}
                  defaultPriceData={priceDefaultsData}
                />
              )}
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
    AddPricesComponent,
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
    AddPricesComponent,
    products,
  }

  const articleContext = {
    locale,
    locales,
    defaultLocale,
    slug,
    localizations,
  }

  const priceType = "stockmarket"
  const priceQualities = ["Sivri", "Levant", "Giresun"]
  const priceCities =
    products.data.length > 0 &&
    AddPricesComponent &&
    (await getCitiesPrice({
      product: products.data[0].attributes.slug,
      priceType: priceType,
      priceQualities: priceQualities,
    }))
  const priceDefaults =
    products.data.length > 0 &&
    AddPricesComponent &&
    (await getDefaultPriceValues({
      product: products.data[0].attributes.slug,
      type: priceType,
      priceQualities: priceQualities,
    }))

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
      priceCitiesData: priceCities,
      priceDefaultsData: priceDefaults,
    },
    revalidate: 60 * 60 * 24 * 30,
  }
}

export default DynamicArticle
