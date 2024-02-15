import Image from "next/image"
import Link from "next/link"
import Slider from "react-slick"
import Advertisement from "@/components/elements/advertisement"
import styles from "@/styles/latest-articles.module.scss"
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"
import Moment from "moment"
import "moment/locale/tr"

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
  speed: 500,
  autoplay: true,
  autoplaySpeed: 5000,
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  slidesToShow: 3,
  slidesToScroll: 1,
  initialSlide: 0,
  infinite: false,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
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
        arrows: false,
      },
    },
  ],
}
const LatestArticles = ({ latestArticles }) => {
  return (
    <>
      <Slider {...settings}>
        {latestArticles.data.length > 0 &&
          latestArticles.data.map((article, i, latestArticles) => {
            return (
              <article className="w-full p-2" key={article.id}>
                <Link
                  href={`/haber/${article.id}/${article.attributes.slug}`}
                  className={`${styles.cCard} block bg-lightgray rounded overflow-hidden`}
                >
                  <div className="relative h-[260px] md:h-[220px] lg:h-[264px] overflow-hidden">
                    <Image
                      src={
                        article.attributes.image.data.attributes.formats?.small
                          .url
                          ? article.attributes.image.data.attributes.formats
                              .small.url
                          : article.attributes.image.data.attributes.url
                      }
                      alt={article.attributes.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      priority={false}
                      fill
                      sizes="(max-width: 768px) 100vw,
                          (max-width: 800px) 50vw,
                          33vw"
                    />
                    <div className="absolute bottom-0 bg-white/90 w-full flex items-center min-h-[55px] border-t-4 border-primary py-2 px-4">
                      <div className="absolute top-[-1rem] text-white right-2 rounded bg-primary px-1">
                        {Moment(article.attributes.publishedAt)
                          .fromNow(true)
                          .toLocaleUpperCase("tr")}{" "}
                        ÖNCE
                      </div>
                      <h3 className="font-semibold">
                        {article.attributes.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </article>
            )
          })}
      </Slider>
    </>
  )
}

export default LatestArticles
