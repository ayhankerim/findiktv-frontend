export function cloudflareLoader(src: string, width: number, quality: number): string {
  if (src) {
    const key = src.includes("imagedelivery.net");
    switch (key) {
      case true:
        const cloudflareSrc = src.substring(26).replace("/public", "");
        return `https://www.findiktv.com/cdn-cgi/imagedelivery/${cloudflareSrc}/format=auto,quality=${quality},width=${width}`;
      default:
        return src;
    }
  } else {
    return process.env.NEXT_PUBLIC_DEFAULT_IMAGE || "";
  }
}
