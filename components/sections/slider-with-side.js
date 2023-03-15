import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import Slider from "react-slick"
import Link from "next/link"
import Image from "next/image"
import NextImage from "@/components/elements/image"
import { fetchAPI } from "@/utils/api"
import { categoryColor } from "@/utils/category-color"
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"
import "slick-carousel/slick/slick.css"
import styles from "@/styles/latest-articles.module.scss"
import Moment from "moment"
import "moment/locale/tr"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const SliderWithSide = ({ data, position = "sidebar" }) => {
  const [sliderposts, setSliderPosts] = useState([])
  const [mostVisiteds, setMostVisiteds] = useState([])

  useEffect(() => {
    fetchAPI("/articles", {
      filters: {
        featured: {
          $eq: data.FeaturedOnly,
        },
      },
      fields: ["slug", "title"],
      populate: ["homepage_image"],
      sort: ["id:desc"],
      pagination: {
        start: data.SliderOffset,
        limit: data.SlideLimit,
      },
    }).then((data) => {
      setSliderPosts(data.data)
    })
    fetchAPI("/articles", {
      filters: {
        publishedAt: {
          $gte: Moment(new Date())
            .subtract(3, "days")
            .utcOffset(3)
            .format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      fields: ["title", "slug", "summary"],
      populate: {
        image: {
          populate: ["*"],
        },
        category: {
          populate: ["*"],
        },
      },
      sort: ["view:desc"],
      pagination: {
        start: data.SideArticleOffset,
        limit: data.SideArticleLimit,
      },
    }).then((data) => {
      setMostVisiteds(data.data)
    })
  }, [
    data.FeaturedOnly,
    data.SideArticleLimit,
    data.SideArticleOffset,
    data.SlideLimit,
    data.SliderOffset,
  ])

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
        <button className="block w-full text-center border px-[4px] sm:px-[8px] md:px-[5px] lg:px-[10px] xl:px-3 bg-secondary/10 font-bold">
          {i + 1}
        </button>
      )
    },
    dots: true,
    dotsClass: "slick-dots relative !flex justify-between z-20 overflow-x-auto",
    speed: 500,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    slidesToShow: 1,
    slidesToScroll: 1,
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
        },
      },
    ],
  }
  return (
    <div className="container flex flex-col md:flex-row md:flex-nowrap gap-2 align-top pb-6">
      <div className="w-full md:w-8/12">
        <Slider {...settings}>
          {sliderposts.map((article, i) => (
            <article className="" key={article.id}>
              <Link
                href={`/haber/${article.id}/${article.attributes.slug}`}
                title={article.attributes.title}
              >
                <Image
                  src={
                    article.attributes.homepage_image.data.attributes.formats
                      .medium.url
                  }
                  alt={article.attributes.title}
                  className="p-0"
                  width="821"
                  height="550"
                  //priority={i === 0 ? true : false}
                  priority={true}
                />
              </Link>
            </article>
          ))}
        </Slider>
      </div>
      <div className="flex flex-col w-full md:w-4/12">
        {mostVisiteds &&
          mostVisiteds.map((article, i) => (
            <div
              className={classNames(
                position === "bottom"
                  ? "sm:w-1/2 md:w-1/2 xl:w-1/3"
                  : "sm:w-1/2 md:w-full xl:w-full",
                "w-full pb-2"
              )}
              key={article.id}
            >
              <Link
                href={`/haber/${article.id}/${article.attributes.slug}`}
                className={classNames(
                  position === "bottom" ? "h-full" : "",
                  `${styles.cCard} block bg-lightgray rounded border border-b-2 overflow-hidden`
                )}
              >
                <div className="relative border-b-4 border-primary pb-52 overflow-hidden">
                  <Image
                    src={
                      article.attributes.image.data.attributes.formats.thumbnail
                        .url
                    }
                    alt={article.attributes.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    priority={false}
                    fill
                    sizes="(max-width: 768px) 100vw,
                        (max-width: 800px) 50vw,
                        33vw"
                  />
                </div>
                <div className="relative p-4">
                  {article.attributes.category.data && (
                    <div
                      className="absolute top-[-1rem] text-white right-2 rounded px-1"
                      style={{
                        backgroundColor: categoryColor(
                          article.attributes.category.data.attributes.slug
                        ),
                      }}
                    >
                      {article.attributes.category.data.attributes.title}
                    </div>
                  )}
                  <h3 className="font-semibold">{article.attributes.title}</h3>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </div>
  )
}

SliderWithSide.propTypes = {
  data: PropTypes.shape({
    SlideLimit: PropTypes.number,
    SliderOffset: PropTypes.number,
    SideArticleLimit: PropTypes.number,
    SideArticleOffset: PropTypes.number,
    FeaturedOnly: PropTypes.bool,
  }),
}

export default SliderWithSide
