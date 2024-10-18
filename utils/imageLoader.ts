import { getStrapiMedia } from "./api-helpers";

interface MyImageLoaderProps {
  src: string;
  width?: number;
  quality?: number;
}

export default function myImageLoader({ src, width, quality }: MyImageLoaderProps) {
  const key = src.includes("imagedelivery.net");
  switch (key) {
    case true:
      const cloudflareSrc = src
        .substring(26)
        .replace("/Development", "")
        .replace("/public", "")
        .replace("/Test", "");
      return `https://www.findiktv.com/cdn-cgi/imagedelivery/${cloudflareSrc}/format=auto${
        quality ? `,quality=${quality}` : ""
      }${width ? `,width=${width}` : ""}`;
    default:
      return getStrapiMedia(src);
  }
}
