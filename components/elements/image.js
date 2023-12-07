import { getStrapiMedia } from "utils/media"
import Image from "next/image"
import PropTypes from "prop-types"
import { mediaPropTypes } from "utils/types"

const NextImage = ({ media, alt, ...props }) => {
  const { url, alternativeText, width, height } = media.data.attributes

  const cloudflareLoader = ({ src, width, quality }) => {
    const key = src.includes("imagedelivery.net")
    switch (key) {
      case true:
        const cloudflareSrc = src
          .substring(26)
          .replace("/Development", "")
          .replace("/public", "")
          .replace("/Test", "")
        return `https://www.findiktv.com/cdn-cgi/imagedelivery/${cloudflareSrc}/format=auto${
          quality ? `,quality=${quality}` : ""
        }${width ? `,width=${width}` : ""}`
        break
      default:
        return getStrapiMedia(src)
        break
    }
  }

  // The image has a fixed width and height
  if (props.width && props.height) {
    return (
      <Image
        loader={cloudflareLoader}
        src={url}
        alt={alt ? alt : alternativeText ? alternativeText : ""}
        style={{
          objectFit: "cover",
        }}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhZPQAIhwMsJ60FNgAAAABJRU5ErkJggg=="
        {...props}
      />
    )
  }

  // The image is responsive
  return (
    <Image
      loader={cloudflareLoader}
      width={width || "100%"}
      height={height || "100%"}
      style={{
        objectFit: "contain",
      }}
      src={url}
      alt={alt ? alt : alternativeText ? alternativeText : ""}
    />
  )
}

Image.propTypes = {
  media: mediaPropTypes,
  className: PropTypes.string,
}

export default NextImage
