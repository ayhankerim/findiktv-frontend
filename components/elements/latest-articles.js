import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { isMobile } from "react-device-detect"
import { fetchAPI } from "@/utils/api"
import { categoryColor } from "@/utils/category-color"
import Advertisement from "@/components/elements/advertisement"
import { MdOutlineArticle } from "react-icons/md"
import styles from "@/styles/latest-articles.module.scss"
import { any } from "prop-types"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}
const LatestArticles = ({
  current,
  product,
  city,
  count,
  position,
  offset = 0,
}) => {
  const [latestArticles, setLatestArticles] = useState([])

  useEffect(() => {
    let arrayFiltered = []
    if (current) {
      arrayFiltered.push({
        id: {
          $ne: current,
        },
      })
    }
    if (product) {
      arrayFiltered.push({
        products: {
          id: {
            $eq: product,
          },
        },
      })
    }
    if (city) {
      arrayFiltered.push({
        cities: {
          id: {
            $in: city,
          },
        },
      })
    }

    fetchAPI("/articles", {
      filters: arrayFiltered,
      fields: ["title", "slug"],
      populate: {
        image: {
          populate: ["*"],
        },
        category: {
          populate: ["slug", "title"],
        },
      },
      sort: ["id:desc"],
      pagination: {
        start: offset,
        limit: count,
      },
    }).then((data) => {
      setLatestArticles(data.data)
    })
  }, [city, count, current, offset, product])
  return (
    <>
      {/* <div className="flex flex-row items-center justify-between border-b border-secondary/20 relative">
        <h3 className="font-semibold text-base text-midgray">
          {headTitle ? headTitle : "İLGİNİZİ ÇEKEBİLİR"}
        </h3>
        <MdOutlineArticle className="text-lg text-midgray" />
        <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
      </div> */}
      <div className="flex flex-wrap -mx-2 my-2">
        {latestArticles &&
          latestArticles.map((article, i, latestArticles) => {
            if (isMobile)
              return (
                <div
                  className="sm:w-1/2 md:w-full xl:w-full w-full p-2"
                  key={article.id}
                >
                  {latestArticles.length > 4 && i + 1 === 4 && (
                    <div className="w-full min-h-[300px] -mx-2 sm:mx-0">
                      <Advertisement position="sidebar-bottom-desktop" />
                    </div>
                  )}
                  <Link
                    href={`/haber/${article.id}/${article.attributes.slug}`}
                    className="flex flex-col px-2 hover:bg-lightgray"
                  >
                    <div className="flex items-center justify-start py-1 gap-2">
                      <Image
                        src={
                          article.attributes.image.data.attributes.formats
                            .thumbnail.url
                        }
                        alt={article.attributes.title}
                        className="h-[auto] w-3/12"
                        width={91}
                        height={58}
                      />
                      <h3 className="w-9/12 font-semibold">
                        {article.attributes.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              )
            else
              return (
                <div
                  className={classNames(
                    position === "bottom"
                      ? "sm:w-1/2 md:w-1/2 xl:w-1/3"
                      : "sm:w-1/2 md:w-full xl:w-full",
                    "w-full p-2"
                  )}
                  key={article.id}
                >
                  {latestArticles.length > 4 && i + 1 === 4 && (
                    <div className="w-full min-h-[300px] -mx-2 sm:mx-0">
                      <Advertisement position="sidebar-bottom-desktop" />
                    </div>
                  )}
                  <Link
                    href={`/haber/${article.id}/${article.attributes.slug}`}
                    className={classNames(
                      position === "bottom" ? "h-full" : "",
                      `${styles.cCard} block bg-lightgray rounded border border-b-2 overflow-hidden`
                    )}
                  >
                    <div className="relative border-b-4 border-primary pb-36 overflow-hidden">
                      <Image
                        src={
                          article.attributes.image.data.attributes.formats
                            .thumbnail.url
                        }
                        alt={article.attributes.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhZPQAIhwMsJ60FNgAAAABJRU5ErkJggg=="
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
                      <h3 className="font-semibold">
                        {article.attributes.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              )
          })}
        <div className="w-full md:w-1/2 lg:w-full min-h-[300px] -mx-2 sm:mx-0 md:mx-0">
          <Advertisement
            position={
              position === "bottom"
                ? "article-bottom-desktop"
                : "sidebar-bottom-desktop"
            }
          />
        </div>
      </div>
    </>
  )
}

export default LatestArticles
