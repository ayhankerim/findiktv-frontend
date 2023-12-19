export function contentWithAds(content, advertisement) {
  let paraArray = content.split("</p>")
  let NewsContentText = ""
  paraArray.forEach(myFunction)

  function myFunction(item, index) {
    paraArray.length > 2 &&
    index > 1 &&
    index % 2 &&
    index < 8 &&
    paraArray.length - 1 != index
      ? (NewsContentText +=
          `<div class="adsInline"><div class="w-full h-[280px] -mx-2 sm:mx-0"><ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client=${process.env.NEXT_PUBLIC_ADSENSE_PUB}
     data-ad-slot=${
       advertisement.filter(
         (ads) => ads.attributes.placeholder === "article-inline-desktop"
       )[0].attributes.adslot
     }
     data-adtest=${process.env.NEXT_PUBLIC_ADSENSE_TEST}></ins></div></div>` +
          item)
      : (NewsContentText += item)
  }

  return {
    __html: `<div class="w-full sm:w-[336px] h-[280px] float-left sm:float-none -mx-4 sm:ml-0 sm:mr-4 mb-4"><ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client=${process.env.NEXT_PUBLIC_ADSENSE_PUB}
     data-ad-slot=${
       advertisement.filter(
         (ads) => ads.attributes.placeholder === "article-top-desktop"
       )[0].attributes.adslot
     }
     data-adtest=${
       process.env.NEXT_PUBLIC_ADSENSE_TEST
     }></ins></div>${NewsContentText}`,
  }
}
