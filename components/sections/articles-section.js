import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import Link from "next/link"
import Image from "next/image"
import { fetchAPI } from "@/utils/api"
import { categoryColor } from "@/utils/category-color"
import "slick-carousel/slick/slick.css"
import styles from "@/styles/latest-articles.module.scss"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const ArticleSection = ({ data, type = "page", position = "bottom" }) => {
  const [mostVisiteds, setMostVisiteds] = useState([])
  useEffect(() => {
    fetchAPI("/articles", {
      filters: {
        $or: [
          {
            ignoreHome: {
              $eq: false,
            },
          },
          {
            ignoreHome: {
              $null: true,
            },
          },
        ],
        featured: {
          $eq: data.FeaturedOnly,
        },
      },
      fields: ["title", "slug", "summary"],
      populate: {
        image: {
          populate: "*",
        },
        category: {
          populate: "*",
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
    <div
      className={`${
        type === "articles" ? "" : "container gap-2"
      } align-top pb-2`}
    >
      {data.SectionTitle && (
        <div className="flex flex-row items-center justify-between border-b border-secondary/20 relative mb-2">
          <h4 className="font-semibold text-base text-midgray">
            {data.SectionTitle}
          </h4>
          <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 w-full gap-2">
        {mostVisiteds &&
          mostVisiteds.map((article, i) => (
            <div
              className={classNames(position === "bottom" ? "" : "", "w-full")}
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

ArticleSection.propTypes = {
  data: PropTypes.shape({
    ArticleLimit: PropTypes.number,
    ArticleOffset: PropTypes.number,
    FeaturedOnly: PropTypes.bool,
    SectionTitle: PropTypes.string,
  }),
}

export default ArticleSection
