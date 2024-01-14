import useSWR, { SWRConfig } from "swr"
import Image from "next/image"
import Link from "next/link"
import { BiLoaderCircle } from "react-icons/bi"
import styles from "@/styles/latest-articles.module.scss"
import { categoryColor } from "@/utils/category-color"
import Moment from "moment"
import "moment/locale/tr"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}
const fetcher = (...args) => fetch(...args).then((res) => res.json())
const ArticleMostVisited = ({ size, offset, position, slug }) => {
  const qs = require("qs")
  const refreshInterval = 1000 * 60 * 60
  const query = () => {
    const value = qs.stringify(
      {
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
          view: {
            populate: ["view"],
          },
        },
        sort: ["view.view:desc", "id:desc"],
        pagination: {
          start: offset,
          limit: size,
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
    <div className="flex flex-col sm:flex-row lg:flex-col h-full justify-between content-between gap-2">
      <SWRConfig value={{ provider: () => new Map() }}>
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
      </SWRConfig>
    </div>
  )
}

export default ArticleMostVisited
