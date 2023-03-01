import React, { useEffect } from "react"
import { useSelector } from "react-redux"

const Advertisement = ({ position, adformat = "auto" }) => {
  const AllAdvertisements = useSelector((state) => state.advertisement.adsData)
  useEffect(() => {
    var ads = document.getElementsByClassName("adsbygoogle").length
    for (var i = 0; i < ads; i++) {
      try {
        ;(adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {}
    }
  }, [])
  if (!AllAdvertisements && !AllAdvertisements?.length) {
    return null
  }
  const adData = AllAdvertisements.filter(
    (ads) => ads.attributes.placeholder === position
  )[0]
  if (adData) {
    if (adData.attributes.adsense) {
      if (adData.attributes.adsenseFormat === "Display") {
        return (
          <ins
            className="adsbygoogle"
            style={{ display: "block", marginBottom: "10px" }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB}
            data-ad-slot={adData.attributes.adslot}
            data-ad-format={adformat}
            data-full-width-responsive="true"
            data-adtest={process.env.NEXT_PUBLIC_ADSENSE_TEST}
          ></ins>
        )
      } else if (adData.attributes.adsenseFormat === "InFeed") {
        return (
          <ins
            className="adsbygoogle"
            style={{ display: "block", marginBottom: "10px" }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB}
            data-ad-slot={adData.attributes.adslot}
            data-ad-format="fluid"
            data-ad-layout-key="-6t+ed+2i-1n-4w"
            data-adtest={process.env.NEXT_PUBLIC_ADSENSE_TEST}
          ></ins>
        )
      } else if (adData.attributes.adsenseFormat === "InArticle") {
        return (
          <ins
            className="adsbygoogle"
            style={{
              display: "block",
              textAlign: "center",
              marginBottom: "10px",
            }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB}
            data-ad-slot={adData.attributes.adslot}
            data-ad-format="fluid"
            data-ad-layout="in-article"
            data-adtest={process.env.NEXT_PUBLIC_ADSENSE_TEST}
          ></ins>
        )
      } else if (adData.attributes.adsenseFormat === "Multiplex") {
        return (
          <ins
            className="adsbygoogle"
            style={{ display: "block", marginBottom: "10px" }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB}
            data-ad-slot={adData.attributes.adslot}
            data-ad-format="autorelaxed"
            data-adtest={process.env.NEXT_PUBLIC_ADSENSE_TEST}
          ></ins>
        )
      }
    } else {
      return (
        <div dangerouslySetInnerHTML={{ __html: adData.attributes.code }} />
      )
    }
  }
}

export default Advertisement
