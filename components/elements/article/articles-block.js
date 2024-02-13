import Image from "next/image"
import Link from "next/link"
import Moment from "moment"
import { categoryColor } from "@/utils/category-color"
import "moment/locale/tr"
import styles from "@/styles/latest-articles.module.scss"

const ArticleBlock = ({ article, category, index }) => {
  return (
    <>
      {index > 2 && index % 4 === 0 && <div className="w-full">REKLAM</div>}
      <article className="w-full">
        <Link
          href={`/haber/${article.id}/${article.attributes.slug}`}
          className={`${styles.cCard} block bg-lightgray rounded overflow-hidden`}
        >
          <div className="relative h-[260px] md:h-[220px] lg:h-[264px] overflow-hidden">
            <Image
              src={
                article.attributes.image.data.attributes.formats?.small.url
                  ? article.attributes.image.data.attributes.formats.small.url
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
              <div
                className="absolute top-[-1rem] text-white right-2 rounded px-1"
                style={{
                  backgroundColor: categoryColor(category),
                }}
              >
                {Moment(article.attributes.publishedAt)
                  .fromNow(true)
                  .toLocaleUpperCase("tr")}{" "}
                ÖNCE
              </div>
              <h3 className="font-semibold">{article.attributes.title}</h3>
            </div>
          </div>
        </Link>
      </article>
    </>
  )
}

export default ArticleBlock
