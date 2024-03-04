import React, { useEffect } from "react"
import { getPageData, fetchAPI, getAdsData, getGlobalData } from "utils/api"
import Sections from "@/components/sections"
import Seo from "@/components/elements/seo"
import { useRouter } from "next/router"
import { useDispatch } from "react-redux"
import { updateAds } from "@/store/advertisements"
import Layout from "@/components/layout"
import { getLocalizedPaths } from "utils/localize"

const DynamicPage = ({
  sections,
  pageId,
  advertisement,
  metadata,
  preview,
  global,
  pageContext,
}) => {
  const dispatch = useDispatch()
  const router = useRouter()
  useEffect(() => {
    advertisement && dispatch(updateAds(advertisement))
  }, [advertisement, dispatch])

  if (!router.isFallback && !sections?.length) {
    return {
      notFound: true,
    }
  }

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
  const articleSeoData = {
    slug: pageContext.slug,
    datePublished: pageContext.publishedAt,
    dateModified: pageContext.updatedAt,
    tags: [],
  }
  return (
    <Layout global={global} pageContext={pageContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <Sections sections={sections} preview={preview} />
    </Layout>
  )
}

export async function getStaticPaths(context) {
  const pages = await context.locales.reduce(
    async (currentPagesPromise, locale) => {
      const currentPages = await currentPagesPromise
      const localePages = await fetchAPI("/pages", {
        locale,
        fields: ["slug", "locale"],
      })
      return [...currentPages, ...localePages.data]
    },
    Promise.resolve([])
  )

  const paths = pages.map((page) => {
    const { slug, locale } = page.attributes
    const slugArray = !slug ? false : slug.split("/")

    return {
      params: { slug: slugArray },
      locale,
    }
  })

  return { paths, fallback: true }
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale, preview = null } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()

  const pageData = await getPageData({
    slug: !params.slug ? "/" : params.slug.join("/"),
    locale,
    preview,
  })

  if (pageData == null) {
    return {
      notFound: true,
    }
  }

  const {
    contentSections,
    metadata,
    localizations,
    slug,
    publishedAt,
    updatedAt,
  } = pageData.attributes

  const pageContext = {
    locale,
    locales,
    defaultLocale,
    slug,
    localizations,
    publishedAt,
    updatedAt,
  }

  const localizedPaths = getLocalizedPaths(pageContext)

  return {
    props: {
      preview,
      pageId: pageData.id,
      sections: contentSections,
      advertisement: advertisement,
      metadata,
      global: globalLocale.data,
      pageContext: {
        ...pageContext,
        localizedPaths,
      },
    },
    revalidate: 60 * 60,
  }
}

export default DynamicPage
