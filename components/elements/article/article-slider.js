import useSWR, { SWRConfig } from "swr"
import Link from "next/link"
import NextImage from "@/components/elements/image"
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"
import { BiLoaderCircle } from "react-icons/bi"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"

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
  lazyLoad: true,
  speed: 500,
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  slidesToShow: 2,
  slidesToScroll: 1,
  initialSlide: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
}
const fetcher = (...args) => fetch(...args).then((res) => res.json())

const ArticleSlider = ({ slug, size }) => {
  const qs = require("qs")
  const refreshInterval = 1000 * 60 * 60
  const query = () => {
    const value = qs.stringify(
      {
        filters: {
          category: {
            slug: {
              $eq: slug,
            },
          },
          featured: {
            $eq: true,
          },
        },
        fields: ["slug", "title"],
        populate: {
          homepage_image: {
            fields: [
              "alternativeText",
              "url",
              "width",
              "height",
              "formats",
              "mime",
            ],
          },
        },
        sort: ["id:desc"],
        pagination: {
          start: 0,
          limit: size,
        },
      },
      {
        encodeValuesOnly: true,
      }
    )
    return value
  }
  const { data: sliderposts, error: error } = useSWR(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/articles?` + query(),
    fetcher,
    { refreshInterval: refreshInterval }
  )

  if (error)
    return <div>İçerik getirilemedi, lütfen daha sonra tekrar deneyiniz</div>
  if (!sliderposts)
    return (
      <div className="flex justify-center items-center w-full h-[250px] lg:h-[360px]">
        <span role="status">
          <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-dark animate-spin" />
          <span className="sr-only">Lütfen bekleyiniz...</span>
        </span>
      </div>
    )
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <Slider {...settings}>
        {sliderposts.data.map((article, i) => (
          <article className="" key={article.id}>
            <Link href={`/haber/${article.id}/${article.attributes.slug}`}>
              <NextImage
                media={article.attributes.homepage_image}
                alt={article.attributes.title}
                className="px-2"
                width="600"
                height="350"
                priority={i === 0 || i === 1 ? true : false}
              />
            </Link>
          </article>
        ))}
      </Slider>
    </SWRConfig>
  )
}

export default ArticleSlider
