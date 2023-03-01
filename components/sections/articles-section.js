import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import Slider from "react-slick"
import Link from "next/link"
import Image from "next/image"
import { fetchAPI } from "@/utils/api"
import Advertisement from "@/components/elements/advertisement"
import { categoryColor } from "@/utils/category-color"
import { MdOutlineWatchLater } from "react-icons/md"
import "slick-carousel/slick/slick.css"
import styles from "@/styles/latest-articles.module.scss"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const ArticleSection = ({ data, position = "bottom" }) => {
  const [sliderposts, setSliderPosts] = useState([])
  const [mostVisiteds, setMostVisiteds] = useState([])

  useEffect(() => {
    fetchAPI("/articles", {
      filters: {
        featured: {
          $eq: data.FeaturedOnly,
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
      sort: ["id:desc"],
      pagination: {
        start: data.ArticleOffset,
        limit: data.ArticleLimit,
      },
    }).then((data) => {
      setMostVisiteds(data.data)
    })
  }, [data.ArticleLimit, data.ArticleOffset, data.FeaturedOnly])
  return (
    <div className="container gap-2 align-top pb-2">
      {data.SectionTitle && (
        <div className="flex flex-row items-center justify-between border-b relative mb-2">
          <h4 className="font-semibold text-base text-midgray">
            {data.SectionTitle}
          </h4>
          <MdOutlineWatchLater className="text-xl" />
          <span className="absolute h-[5px] w-2/5 left-0 bottom-[-5px] bg-secondary"></span>
        </div>
      )}
      <div className="flex flex-col md:flex-row w-full gap-2">
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
                    alt={
                      article.attributes.image.data.attributes.alternativeText
                    }
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

ArticleSection.propTypes = {
  data: PropTypes.shape({
    ArticleLimit: PropTypes.number,
    ArticleOffset: PropTypes.number,
    FeaturedOnly: PropTypes.bool,
    SectionTitle: PropTypes.string,
  }),
}

export default ArticleSection
