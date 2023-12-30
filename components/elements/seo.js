import { NextSeo } from "next-seo"
import PropTypes from "prop-types"
import { getStrapiMedia } from "utils/media"
import { mediaPropTypes } from "utils/types"

const Seo = ({ metadata, others }) => {
  if (!metadata) return null
  return (
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
        ...(metadata.twitterCardType && { cardType: metadata.twitterCardType }),
        ...(metadata.twitterUsername && { handle: metadata.twitterUsername }),
      }}
    />
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
