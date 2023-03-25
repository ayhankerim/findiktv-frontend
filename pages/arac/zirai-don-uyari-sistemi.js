import React from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { getGlobalData } from "@/utils/api"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import LatestComments from "@/components/elements/comments/latest-comments"
import ArticleMostVisited from "@/components/elements/article/articles-most-visited"
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"
import Moment from "moment"
import "moment/locale/tr"
import "slick-carousel/slick/slick.css"

const RandimanHesaplama = ({ global }) => {
  const metadata = {
    id: 1,
    metaTitle: "Zirai Don Uyarı Sistemi | FINDIK TV",
    metaDescription:
      "Beş günlük hava tahmin raporundan faydalanarak şehrinizde olası don riskini takip edebilir ve önlem alacak çalışmalar yapabilirsiniz.",
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const Slider = dynamic(() => import("react-slick"), {
    loading: () => <p>Yükleniyor...</p>,
    ssr: false,
  })

  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }

  function SampleNextArrow(props) {
    const { className, style, onClick } = props
    return (
      <div
        className={`${className} ${
          className.indexOf("slick-disabled") !== -1
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        } absolute flex z-10 items-center inset-y-0 right-0`}
        style={{ ...style, display: "flex" }}
        onClick={onClick}
      >
        <BsChevronRight className="text-xxl text-white drop-shadow self-center" />
      </div>
    )
  }

  function SamplePrevArrow(props) {
    const { className, style, onClick } = props
    return (
      <div
        className={`${className} ${
          className.indexOf("slick-disabled") !== -1
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        } absolute flex z-10 items-center inset-y-0 left-0`}
        style={{ ...style, display: "flex" }}
        onClick={onClick}
      >
        <BsChevronLeft className="text-xxl text-white drop-shadow self-center" />
      </div>
    )
  }
  const settings = {
    dots: false,
    infinite: true,
    centerMode: true,
    fade: true,
    lazyLoad: true,
    speed: 500,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 2000,
  }
  const d = new Date()
  return (
    <Layout global={global} pageContext={null}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white md:flex-row md:flex-nowrap gap-2 align-top pb-6">
        <div className="w-full md:w-8/12">
          <div className="flex flex-row items-end justify-between border-b border-midgray">
            <h1 className="font-semibold text-xl text-darkgray">
              ZIRAİ DON <span className="text-midgray">UYARI SİSTEMİ</span>
            </h1>
          </div>
          <Slider {...settings}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item}>
                <Image
                  alt={`Gün ${item}`}
                  width={790}
                  height={527}
                  className="p-0"
                  priority={true}
                  src={`https://mgm.gov.tr/FTPDATA/CBS/TAHMIN/DFT${Moment(d)
                    .add(item, "d")
                    .format("YYYYMMDD")}.png`}
                />
                <p className="text-center w-full">
                  {Moment(d).add(item, "d").format("DD-MM-YYYY")}
                </p>
              </div>
            ))}
          </Slider>
        </div>
        <div className="sticky top-2 flex-none w-full md:w-[336px] lg:w-[250px] xl:w-[336px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 w-full gap-2 md:w-4/12">
          <ArticleMostVisited size={10} slug={null} />
          <LatestComments size={5} position="sidebar" offset={0} />
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const { locale } = context
  const globalLocale = await getGlobalData(locale)

  return {
    props: {
      global: globalLocale.data,
    },
    revalidate: 24 * 60 * 60,
  }
}

export default RandimanHesaplama
