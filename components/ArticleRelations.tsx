import Link from "next/link";
import ArticleShare from "./ArticleShare";
import { MdOutlineLocationOn, MdOutlineTag } from "react-icons/md";
interface Tags {
  id: string;
  title: string;
  slug: string;
}
interface Cities {
  id: string;
  title: string;
  slug: string;
}
interface ArticleRelationProps {
  cities: {
    data: Cities[];
  };
  tags: {
    data: Tags[];
  };
  title: string;
  slug: string;
  comment: number;
}
export default function ArticleRelations({
  cities,
  tags,
  title,
  slug,
  comment,
}: ArticleRelationProps) {
  return (
    <footer className={`flex flex-col`}>
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
              {cities.data.map((city: Cities) => (
                <li key={city.id}>
                  <Link
                    className="font-semibold text-secondary hover:underline"
                    href={`/sehir/${city.slug}`}
                    title={city.title}
                  >
                    {city.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ArticleShare
          position="articleBottom"
          title={title}
          slug={slug}
          comment={comment}
        />
      </div>
      {tags.data.length > 0 && (
        <div className="flex flex-col my-4">
          <h3 className="flex items-center font-semibold text-base text-midgray">
            <MdOutlineTag className="text-sm inline-block mr-2" /> İLİŞKİLİ
            İÇERİKLER
          </h3>
          <ul className="flex flex-wrap my-2 gap-2">
            {tags.data.map((tag: Tags) => (
              <li key={tag.id}>
                <Link
                  className="block border border-lightgray hover:border-secondary hover:text-white hover:bg-secondary rounded px-2 py-1"
                  href={`/etiket/${tag.slug}`}
                  title={tag.title}
                >
                  {tag.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </footer>
  );
}
