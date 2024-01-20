import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { fetchAPI } from "@/utils/api"
import Advertisement from "@/components/elements/advertisement"
import Moment from "moment"
import "moment/locale/tr"

const ArticleMostVisited = ({ size, slug }) => {
  const [mostVisiteds, setMostVisiteds] = useState([])

  useEffect(() => {
    fetchAPI("/articles", {
      filters: {
        slug: {
          $ne: slug,
        },
        publishedAt: {
          $gte: Moment(new Date())
            .subtract(process.env.NEXT_PUBLIC_MOST_VISITED_LIMIT, "days")
            .utcOffset(3)
            .format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      fields: ["title", "slug", "summary"],
      populate: {
        image: {
          populate: "*",
        },
        view: {
          populate: ["view"],
        },
      },
      sort: ["view.view:desc", "id:desc"],
      pagination: {
        start: 0,
        limit: size,
      },
    }).then((data) => {
      setMostVisiteds(data.data)
    })
  }, [size, slug])
  return (
    <>
      <div className="flex flex-wrap -mx-2 my-2">
        {mostVisiteds &&
          mostVisiteds.map((article, i, mostVisiteds) => (
            <div
              className="sm:w-1/2 md:w-full xl:w-full w-full p-2"
              key={article.id}
            >
              {mostVisiteds.length > 4 && i + 1 === 4 && (
                <div className="w-full min-h-[300px] -mx-2 sm:mx-0">
                  <Advertisement position="sidebar-bottom-desktop" />
                </div>
              )}
              <Link
                href={`/haber/${article.id}/${article.attributes.slug}`}
                className="flex flex-col px-2 group"
              >
                <div className="flex items-center justify-start py-1 gap-2">
                  <div className="relative w-[80px] h-[50px]">
                    <Image
                      className="rounded"
                      src={
                        article.attributes.image.data.attributes.formats
                          .thumbnail.url
                      }
                      alt={article.attributes.title}
                      fill
                      style={{
                        objectFit: "cover",
                        objectPosition: "50% 50%",
                      }}
                      sizes="(max-width: 768px) 100vw,
                        (max-width: 1200px) 50vw,
                        33vw"
                    />
                  </div>
                  <h3 className="w-9/12 font-semibold group-hover:underline">
                    {article.attributes.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        <div className="w-full md:w-1/2 lg:w-full min-h-[300px] -mx-2 sm:mx-0 md:mx-0">
          <Advertisement position="sidebar-bottom-desktop" />
        </div>
      </div>
    </>
  )
}

export default ArticleMostVisited
