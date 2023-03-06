import { getStrapiMedia } from "utils/media"

export default function myImageLoader({ src, width, quality }) {
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
