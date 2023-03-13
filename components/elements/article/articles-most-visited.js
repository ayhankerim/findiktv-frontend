import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { fetchAPI } from "@/utils/api"
import Advertisement from "@/components/elements/advertisement"
import Moment from "moment"
import "moment/locale/tr"
import { MdOutlineWhatshot } from "react-icons/md"

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
            .subtract(7, "days")
            .utcOffset(3)
            .format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      fields: ["title", "slug", "summary"],
      populate: {
        image: {
          populate: ["*"],
        },
      },
      sort: ["view:desc"],
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
      <div className="flex flex-row items-center justify-between border-b border-danger/40 relative">
        <h4 className="font-semibold text-base text-midgray">ÖNE ÇIKANLAR</h4>
        <MdOutlineWhatshot className="text-xl text-danger" />
        <span className="absolute h-[5px] w-2/5 left-0 bottom-[-5px] bg-danger/80"></span>
      </div>
      <div className="flex flex-wrap -mx-2 my-2">
        {mostVisiteds &&
          mostVisiteds.map((article, i, mostVisiteds) => (
            <div
              className="sm:w-1/2 md:w-full xl:w-full w-full p-2"
              key={article.id}
            >
              {mostVisiteds.length > 4 && i + 1 === 4 && (
                <div className="w-full min-h-[300px] -mx-4 sm:mx-0">
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
                      article.attributes.image.data.attributes.formats.thumbnail
                        .url
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
          ))}
        <div className="w-full md:w-1/2 lg:w-full min-h-[300px] -mx-4 sm:mx-0 md:mx-0">
          <Advertisement position="sidebar-bottom-desktop" />
        </div>
      </div>
    </>
  )
}

export default ArticleMostVisited
