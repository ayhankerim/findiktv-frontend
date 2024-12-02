import { strapiImage } from "../strapi/strapiImage";

interface ImageLoaderProps {
  src: string;
  width?: number;
  quality?: number;
}

export default function myImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const isCloudflareImage = src.startsWith("https://imagedelivery.net");

  if (isCloudflareImage) {
    const cloudflareSrc = src.substring(26).replace("/public", "");
    const params = [
      "format=auto",
      quality ? `quality=${quality}` : "",
      width ? `width=${width}` : "",
    ]
      .filter(Boolean)
      .join(",");

    return `https://www.findiktv.com/cdn-cgi/imagedelivery/${cloudflareSrc}/${params}`;
  }

  return strapiImage(src);
}
