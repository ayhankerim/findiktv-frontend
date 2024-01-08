import Link from "next/link"
import ArticleShare from "../share"
import { MdOutlineLocationOn, MdOutlineTag } from "react-icons/md"

const ArticleRelations = ({ cities, tags, title, slug }) => {
  return (
    <section className={`flex flex-col`}>
      <div
        className={`flex ${
          cities.data.length > 3
            ? "flex-col"
            : "flex-col sm:flex-row sm:items-center"
        } flex-col-reverse justify-between gap-4`}
      >
        {cities.data.length > 0 && (
          <div
            className={`flex ${
              cities.data.length > 3 ? "flex-col" : "items-center"
            } gap-4`}
          >
            <h3 className="flex items-center font-semibold text-base text-midgray">
              <MdOutlineLocationOn className="text-sm inline-block mr-2" />{" "}
              ŞEHİRLER
            </h3>
            <ul className="flex flex-wrap my-2 gap-2">
              {cities.data.map((city) => (
                <li key={city.id}>
                  <Link
                    className="font-semibold text-secondary hover:underline"
                    href={`/sehir/${city.attributes.slug}`}
                    title={city.attributes.title}
                  >
                    {city.attributes.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ArticleShare position="articleBottom" title={title} slug={slug} />
      </div>
      {tags.data.length > 0 && (
        <div className="flex flex-col my-4">
          <h3 className="flex items-center font-semibold text-base text-midgray">
            <MdOutlineTag className="text-sm inline-block mr-2" /> İLİŞKİLİ
            İÇERİKLER
          </h3>
          <ul className="flex flex-wrap my-2 gap-2">
            {tags.data.map((tag) => (
              <li key={tag.id}>
                <Link
                  className="block border border-lightgray hover:border-secondary hover:text-white hover:bg-secondary rounded px-2 py-1"
                  href={`/etiket/${tag.attributes.slug}`}
                  title={tag.attributes.title}
                >
                  {tag.attributes.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default ArticleRelations
