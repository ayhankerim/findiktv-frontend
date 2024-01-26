import { NextSeo, CorporateContactJsonLd } from "next-seo"
import Script from "next/script"
import PropTypes from "prop-types"
import { getStrapiMedia } from "utils/media"
import { mediaPropTypes } from "utils/types"

const Seo = ({ metadata, others }) => {
  if (!metadata) return null
  return (
    <>
      <NextSeo
        title={metadata.metaTitle}
        description={metadata.metaDescription}
        openGraph={{
          type: "article",
          locale: "tr_TR",
          title: metadata.metaTitle,
          description: metadata.metaDescription,
          article: {
            publishedTime: others?.datePublished || "2023-02-21T21:16:43.786Z",
            modifiedTime: others?.dateModified || "2023-02-21T21:16:43.786Z",
            authors: ["https://www.findiktv.com/hesap/profil/kerimayhan"],
            tags: [
              others?.tags?.data?.map(
                (item) => "'" + item.attributes.title + "'"
              ) || "['fındık']",
            ],
          },
          url: process.env.NEXT_PUBLIC_SITE_URL + others?.slug,
          ...(metadata.shareImage && {
            images: Object.values(
              metadata.shareImage.data.attributes.formats
            ).map((image) => {
              return {
                url: getStrapiMedia(image.url),
                width: image.width,
                height: image.height,
                alt: image.alt,
              }
            }),
          }),
          site_name: "FINDIK TV",
        }}
        twitter={{
          ...(metadata.twitterCardType && {
            cardType: metadata.twitterCardType,
          }),
          ...(metadata.twitterUsername && { handle: metadata.twitterUsername }),
        }}
      />
      <CorporateContactJsonLd
        url="http://www.findiktv.com"
        logo="https://www.findiktv.com/cdn-cgi/imagedelivery/A_vnS-Tfmrf1TT32XC1EgA/30cb3624-f5bf-4764-62cf-b67bbad27e00/format=auto,width=640"
        contactPoint={[
          {
            telephone: "+90-554-973-8998",
            contactType: "customer service",
            email: "info@findiktv.com",
            areaServed: "TR",
            availableLanguage: ["English", "Turkish"],
          },
        ]}
      />
    </>
  )
}

Seo.propTypes = {
  metadata: PropTypes.shape({
    metaTitle: PropTypes.string.isRequired,
    metaDescription: PropTypes.string.isRequired,
    shareImage: mediaPropTypes,
    twitterCardType: PropTypes.string,
    twitterUsername: PropTypes.string,
  }),
}

export default Seo
