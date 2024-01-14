import useSWR, { SWRConfig } from "swr"
import Link from "next/link"
import Slider from "react-slick"
import NextImage from "@/components/elements/image"
import Moment from "moment"
import "moment/locale/tr"
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"
import { BiLoaderCircle } from "react-icons/bi"
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
  customPaging: function (i) {
    return (
      <button className="block w-full text-center border bg-secondary/10 font-bold">
        {i + 1}
      </button>
    )
  },
  dots: true,
  dotsClass:
    "slick-dots relative !grid grid-cols-10 gap-[2px] justify-between z-20 overflow-x-auto",
  speed: 500,
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  slidesToShow: 1,
  slidesToScroll: 1,
  initialSlide: 0,
  infinite: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
      },
    },
  ],
}
const fetcher = (...args) => fetch(...args).then((res) => res.json())

const SliderModule = ({ data }) => {
  const qs = require("qs")
  const refreshInterval = 1000 * 60 * 60
  const query = () => {
    const value = qs.stringify(
      {
        filters: {
          featured: {
            $eq: data.FeaturedOnly,
          },
        },
        fields: ["slug", "title", "priority", "publishedAt"],
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
          start: data.SliderOffset,
          limit: data.SlideLimit,
        },
      },
      {
        encodeValuesOnly: true,
      }
    )
    return value
  }
  const { data: sliderData, error: error } = useSWR(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/articles?` +
      query(data.date),
    fetcher,
    { refreshInterval: refreshInterval }
  )

  if (error)
    return <div>İçerik getirilemedi, lütfen daha sonra tekrar deneyiniz</div>
  if (!sliderData)
    return (
      <div className="flex justify-center items-center w-full h-[250px] lg:h-[550px]">
        <span role="status">
          <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-dark animate-spin" />
          <span className="sr-only">Lütfen bekleyiniz...</span>
        </span>
      </div>
    )
  const updatedDataArray = sliderData.data.map((item) => {
    return {
      ...item,
      attributes: {
        ...item.attributes,
        publishedAt: Moment(item.attributes.publishedAt)
          .hours(0)
          .minutes(0)
          .seconds(0)
          .milliseconds(0)
          .format(),
      },
    }
  })
  const sliderposts = updatedDataArray.sort((a, b) => {
    const priorityA = a.attributes.priority
    const priorityB = b.attributes.priority
    const publishedAtA = a.attributes.publishedAt
    const publishedAtB = b.attributes.publishedAt
    if (publishedAtA === publishedAtB) {
      if (priorityA < priorityB) {
        return -1
      }
      if (priorityA > priorityB) {
        return 1
      }
    }
    return 0
  })
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <Slider {...settings}>
        {sliderposts.map((article, i) => (
          <article className="" key={article.id}>
            <Link
              href={`/haber/${article.id}/${article.attributes.slug}`}
              title={article.attributes.publishedAt}
              target="_blank"
            >
              <NextImage
                media={article.attributes.homepage_image}
                alt={article.attributes.title}
                className="p-0"
                width="821"
                height="550"
                priority={i === 0 ? true : false}
              />
            </Link>
          </article>
        ))}
      </Slider>
    </SWRConfig>
  )
}

export default SliderModule
