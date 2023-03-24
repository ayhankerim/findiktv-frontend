import React, { useEffect } from "react"
import ViewCounter from "@/components/elements/pageviews"
import { getPageData, fetchAPI, getAdsData, getGlobalData } from "utils/api"
import Sections from "@/components/sections"
import Seo from "@/components/elements/seo"
import { useRouter } from "next/router"
import { useSelector, useDispatch } from "react-redux"
import { updateAds } from "@/store/advertisements"
import Layout from "@/components/layout"
import { getLocalizedPaths } from "utils/localize"

// The file is called [[...slug]].js because we're using Next's
// optional catch all routes feature. See the related docs:
// https://nextjs.org/docs/routing/dynamic-routes#optional-catch-all-routes

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
  const AllAdvertisements = useSelector((state) => state.advertisement.adsData)
  const router = useRouter()
  useEffect(() => {
    advertisement && dispatch(updateAds(advertisement))
  }, [advertisement, dispatch])

  // Check if the required data was provided
  if (!router.isFallback && !sections?.length) {
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
  return (
    <Layout global={global} pageContext={pageContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      {/* Display content sections */}
      <Sections sections={sections} preview={preview} />
      <ViewCounter visible={false} page={pageId} />
    </Layout>
  )
}

export async function getStaticPaths(context) {
  // Get all pages from Strapi
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
    // Decompose the slug that was saved in Strapi
    const slugArray = !slug ? false : slug.split("/")

    return {
      params: { slug: slugArray },
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
  // Fetch pages. Include drafts if preview mode is on

  const pageData = await getPageData({
    slug: !params.slug ? "/" : params.slug.join("/"),
    locale,
    preview,
  })

  if (pageData == null) {
    // Giving the page no props will trigger a 404 page
    //return { props: {} }
    return {
      notFound: true,
    }
  }

  // We have the required page data, pass it to the page component
  const { contentSections, metadata, localizations, slug } = pageData.attributes

  const pageContext = {
    locale,
    locales,
    defaultLocale,
    slug,
    localizations,
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
    revalidate: 15,
  }
}

export default DynamicPage
