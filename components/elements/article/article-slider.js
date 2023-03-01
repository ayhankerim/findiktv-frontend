import React, { useState, useEffect } from "react"
import Slider from "react-slick"
import Link from "next/link"
import Image from "next/image"
import { fetchAPI } from "@/utils/api"
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"
import "slick-carousel/slick/slick.css"

const ArticleSlider = ({ slug, size }) => {
  const [sliderposts, setSliderPosts] = useState([])

  useEffect(() => {
    fetchAPI("/articles", {
      filters: {
        category: {
          slug: {
            $eq: slug,
          },
        },
      },
      fields: ["slug", "title"],
      populate: ["homepage_image"],
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: size,
      },
    }).then((data) => {
      setSliderPosts(data.data)
    })
  }, [size, slug])

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
  return (
    <Slider {...settings}>
      {sliderposts.map((article) => (
        <article className="" key={article.id}>
          <Link href={`/haber/${article.id}/${article.attributes.slug}`}>
            <Image
              src={
                article.attributes.homepage_image.data.attributes.formats.small
                  .url
              }
              alt={
                article.attributes.homepage_image.data.attributes
                  .alternativeText
              }
              className="px-2"
              width="600"
              height="350"
              priority={true}
            />
          </Link>
        </article>
      ))}
    </Slider>
  )
}

export default ArticleSlider
