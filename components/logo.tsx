import React from "react";

import { Link } from "next-view-transitions";
import { BlurImage } from "./blur-image";

import { strapiImage } from "@/lib/strapi/strapiImage";
import { Image } from "@/types/types";

export const Logo = ({ image, alt, height, width, priority, locale }: { image?: Image, alt?:string, height?:number, width?:number, priority?: boolean, locale?: string }) => {
  if (image) {
    return (
      <Link
      href={`/${locale || 'tr'}`}
        className="flex mr-4 relative"
      >
        <BlurImage
          src={strapiImage(image?.url)}
          alt={alt || image.alternativeText}
          width={width || 200}
          height={height || 200}
          priority={priority || false}
          className=""
        />
      </Link>
    );
  }

  return;
};