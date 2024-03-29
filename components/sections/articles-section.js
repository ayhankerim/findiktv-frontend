import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import useSWR, { SWRConfig } from "swr"
import Link from "next/link"
import Image from "next/image"
import { BiLoaderCircle } from "react-icons/bi"
import { categoryColor } from "@/utils/category-color"
import styles from "@/styles/latest-articles.module.scss"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}
const fetcher = (...args) => fetch(...args).then((res) => res.json())

const ArticleSection = ({ data, type = "page", position = "bottom" }) => {
  const qs = require("qs")
  const refreshInterval = 1000 * 60 * 60
  const query = () => {
    const value = qs.stringify(
      {
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
            fields: [
              "alternativeText",
              "url",
              "width",
              "height",
              "formats",
              "mime",
            ],
          },
          category: {
            fields: ["title", "slug"],
          },
        },
        sort: ["id:desc"],
        pagination: {
          start: data.ArticleOffset,
          limit: data.ArticleLimit,
        },
      },
      {
        encodeValuesOnly: true,
      }
    )
    return value
  }
  const { data: mostVisiteds, error: error } = useSWR(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/articles?` + query(),
    fetcher,
    { refreshInterval: refreshInterval }
  )

  if (error)
    return <div>İçerik getirilemedi, lütfen daha sonra tekrar deneyiniz</div>
  if (!mostVisiteds)
    return (
      <div className="flex justify-center items-center w-full h-[250px] lg:h-[550px]">
        <span role="status">
          <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-dark animate-spin" />
          <span className="sr-only">Lütfen bekleyiniz...</span>
        </span>
      </div>
    )
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
          mostVisiteds.data.map((article, i) => (
            <div
              className={classNames(position === "bottom" ? "" : "", "w-full")}
              key={article.id}
            >
              <Link
                href={`/haber/${article.id}/${article.attributes.slug}`}
                className={classNames(
                  position === "bottom" ? "h-full" : "",
                  `${styles.cCard} block bg-lightgray rounded overflow-hidden`
                )}
              >
                <div className="relative h-[260px] md:h-[220px] lg:h-[264px] overflow-hidden">
                  <Image
                    src={
                      article.attributes.image.data.attributes.formats?.small
                        .url
                        ? article.attributes.image.data.attributes.formats.small
                            .url
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
                    <h3 className="font-semibold">
                      {article.attributes.title}
                    </h3>
                  </div>
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
