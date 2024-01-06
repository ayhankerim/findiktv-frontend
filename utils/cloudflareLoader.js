export function cloudflareLoader(src, width, quality) {
  if (src) {
    const key = src.includes("imagedelivery.net")
    switch (key) {
      case true:
        const cloudflareSrc = src.substring(26).replace("/public", "")
        return `https://www.findiktv.com/cdn-cgi/imagedelivery/${cloudflareSrc}/format=auto,quality=${quality},width=${width}`
        break
      default:
        return src
        break
    }
  } else {
    return process.env.NEXT_PUBLIC_DEFAULT_IMAGE
  }
}
