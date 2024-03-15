import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "../utils/api-helpers";
import { categoryColor } from "@/app/utils/category-color";
import styles from "@/app/styles/latest-articles.module.scss";
import Advertisement from "@/app/components/Advertisement";
import Moment from "moment";
import "moment/locale/tr";

interface Article {
  id: number;
  attributes: {
    title: string;
    description: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    category: {
      data: {
        attributes: {
          name: string;
          slug: string;
        };
      };
    };
  };
}

export default function PostList({
  data: articles,
  children,
}: {
  data: Article[];
  children?: React.ReactNode;
}) {
  return (
    <section className="container p-6 mx-auto space-y-6 sm:space-y-12 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 w-full gap-2">
        {articles.map((article, index) => {
          const imageUrl = getStrapiMedia(
            article.attributes.image.data?.attributes.url
          );

          const category = article.attributes.category.data?.attributes;

          return (
            <React.Fragment key={index}>
              {index > 2 && index < 12 && index % 4 === 0 && (
                <div className="flex-1 h-[300px] lg:h-full">
                  <Advertisement
                    position="header-top-desktop"
                    adformat="horizontal"
                  />
                </div>
              )}
              <article className="flex-1">
                <Link
                  href={`/haber/${article.id}/${article.attributes.slug}`}
                  className={`${styles.cCard} block bg-lightgray rounded overflow-hidden`}
                >
                  <div className="relative h-[260px] md:h-[220px] lg:h-[264px] overflow-hidden">
                    {imageUrl && (
                      <Image
                        alt={article.attributes.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        priority={false}
                        fill
                        sizes="(max-width: 768px) 100vw,
                                (max-width: 800px) 50vw,
                                33vw"
                        src={imageUrl}
                      />
                    )}
                    <div className="absolute bottom-0 bg-white/90 w-full flex items-center min-h-[55px] border-t-4 border-primary py-2 px-4">
                      <div
                        className="absolute top-[-1rem] text-white right-2 rounded px-1"
                        style={{
                          backgroundColor: categoryColor(category.slug),
                        }}
                      >
                        {Moment(article.attributes.publishedAt)
                          .fromNow(true)
                          .toLocaleUpperCase("tr")}{" "}
                        ÖNCE
                      </div>
                      <h3 className="font-semibold">
                        {article.attributes.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </article>
            </React.Fragment>
          );
        })}
      </div>
      {children && children}
    </section>
  );
}
