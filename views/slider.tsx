"use client";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia, formatDate } from "../utils/api-helpers";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { BiLoaderCircle } from "react-icons/bi";
import Slider, { CustomArrowProps, Settings } from "react-slick";
import "slick-carousel/slick/slick.css";

interface Article {
  id: number;
  title: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  homepage_image: {
    url: string;
  };
  category: {
    name: string;
    slug: string;
  };
}
function SampleNextArrow(props: CustomArrowProps): React.JSX.Element {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${
        className?.indexOf("slick-disabled") !== -1
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
      } absolute flex z-10 items-center inset-y-0 right-0`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <BsChevronRight className="text-xxl text-white drop-shadow self-center" />
    </div>
  );
}
function SamplePrevArrow(props: CustomArrowProps): React.JSX.Element {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${
        className?.indexOf("slick-disabled") !== -1
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
      } absolute flex z-10 items-center inset-y-0 left-0`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <BsChevronLeft className="text-xxl text-white drop-shadow self-center" />
    </div>
  );
}

const settings: Settings = {
  dots: false,
  infinite: true,
  centerMode: true,
  speed: 500,
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  slidesToShow: 2,
  slidesToScroll: 1,
  initialSlide: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        centerMode: false,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: false,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: false,
      },
    },
  ],
};
export default function ArticleSlider({ data: articles }: { data: Article[] }) {
  const SliderComponent: any = Slider;
  if (articles.length === 0) return "";
  return (
    <section className="container flex flex-col justify-between gap-4 pt-2 bg-white">
      <div className="Slider md:-mx-8">
        <SliderComponent {...settings}>
          {articles.map((article, i) => {
            const imageUrl = getStrapiMedia(article.homepage_image?.url);
            return (
              <article key={article.id}>
                <Link href={`/haber/${article.id}/${article.slug}`}>
                  {imageUrl && (
                    <Image
                      alt={article.title}
                      className="px-2"
                      width="600"
                      height="350"
                      priority={i === 0 || i === 1 ? true : false}
                      src={imageUrl}
                    />
                  )}
                </Link>
              </article>
            );
          })}
        </SliderComponent>
      </div>
    </section>
  );
}
