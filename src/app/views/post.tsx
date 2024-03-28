import Image from "next/image";
import dynamic from "next/dynamic";
import { getStrapiMedia } from "@/app/utils/api-helpers";
import { postRenderer } from "@/app/utils/post-renderer";
import ModuleLoader from "@/app/components/ModuleLoader";
import ArticleReaction from "../components/ArticleReaction";
import { fetchAPI } from "../utils/fetch-api";
import { Article } from "../utils/model";

const Loader = ({ cssClass }: any) => (
  <div className={`lds-ellipsis ${cssClass}`}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);
const Advertisement = dynamic(() => import("@/app/components/Advertisement"), {
  loading: () => <Loader />,
  ssr: false,
});
const Breadcrumb = dynamic(() => import("@/app/components/Breadcrumb"), {
  loading: () => <Loader />,
});
const ArticleDates = dynamic(() => import("@/app/components/ArticleDates"), {
  loading: () => <Loader />,
});
const PageView = dynamic(() => import("@/app/components/ViewCounter"), {
  loading: () => <Loader cssClass="w-[50px] lg:w-[90px] !float-right !m-0" />,
  ssr: false,
});
const ArticleShare = dynamic(() => import("@/app/components/ArticleShare"), {
  loading: () => <Loader />,
});
const ArticleRelations = dynamic(
  () => import("../components/ArticleRelations"),
  {
    loading: () => <Loader />,
  }
);
const LatestArticles = dynamic(
  () => import("@/app/components/LatestArticles"),
  {
    loading: () => <Loader cssClass="w-[315px] h-[315px]" />,
    ssr: false,
  }
);
const Comments = dynamic(() => import("@/app/components/Comments/Comments"), {
  loading: () => <Loader />,
});

async function fetchCommentCount(article: number) {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/comments`;
    const urlParamsObject = {
      filters: {
        article: {
          id: {
            $eq: article,
          },
        },
        $or: [
          {
            approvalStatus: {
              $eq: "approved",
            },
          },
          {
            approvalStatus: {
              $eq: "ignored",
            },
          },
        ],
        removed: {
          $eq: false,
        },
      },
      fields: ["id"],
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: 5000,
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
}
async function fetchReactionTypes() {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/reaction-types`;
    const urlParamsObject = {
      filters: {
        status: {
          $eq: true,
        },
      },
      fields: ["title", "slug", "sort"],
      populate: {
        image: { fields: ["url"] },
      },
      sort: ["sort:asc"],
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
}
export default async function Post({ data: article }: { data: Article }) {
  const {
    title,
    slug,
    summary,
    category,
    cities,
    tags,
    image,
    contentSections,
    content,
    publishedAt,
    updatedAt,
    view,
    comments,
    reactions,
  } = article.attributes;
  const { url: imageURL, alternativeText: imageALT } = image.data?.attributes;
  const imageUrl = getStrapiMedia(imageURL);
  const { data: reactionTypes } = (await fetchReactionTypes()) || [];
  const { data: commentCount } = (await fetchCommentCount(article.id)) || [];
  const breadcrumbElement = [
    {
      title: "FINDIK TV",
      slug: "/",
    },
    {
      title: category.data.attributes.title.toLocaleUpperCase("tr"),
      slug: "/kategori/" + category.data.attributes.slug,
    },
    {
      title: title.toLocaleUpperCase("tr"),
      slug: "/haber/" + article.id + "/" + slug,
    },
  ];
  return (
    <div className="container flex flex-col min-h-screen gap-4 pt-2 bg-white">
      <main className="w-full">
        <Breadcrumb items={breadcrumbElement} />
        <header>
          <h1 className="font-extrabold text-xl lg:text-xxl">{title}</h1>
          <p className="font-semibold text-lg text-darkgray">{summary}</p>
          <section className="flex flex-row items-center sm:items-start justify-between mt-4 mb-2">
            <ArticleDates publishedAt={publishedAt} updatedAt={updatedAt} />
            <PageView viewId={view.data.id} />
          </section>
          <ArticleShare
            position="articleTop"
            slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${article.id}/${slug}`}
            title={title}
            comment={commentCount.length}
          />
        </header>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex-auto">
            {imageUrl && (
              <figure>
                <div className="relative sm:w-full h-[300px] lg:h-[500px] -mx-4 sm:mx-0 md:mx-0 mb-2">
                  <Image
                    src={imageUrl}
                    alt={imageALT ? imageALT : title}
                    className="sm:rounded-lg"
                    priority={true}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhZPQAIhwMsJ60FNgAAAABJRU5ErkJggg=="
                    fill
                    sizes="(max-width: 768px) 100vw,
                  (max-width: 800px) 50vw,
                  33vw"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>
                <figcaption>{imageALT ? imageALT : title}</figcaption>
              </figure>
            )}
            {contentSections.map((section: any, index: number) =>
              postRenderer(section, index)
            )}
            {content && (
              <article
                className="NewsContent text-base py-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
            <div className="w-full h-[300px] lg:h-[120px] -mx-2 sm:mx-0">
              <Advertisement
                position="article-bottom-desktop"
                adformat="horizontal"
              />
            </div>
            <ArticleRelations
              cities={cities}
              tags={tags}
              title={title}
              slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${article.id}/${slug}`}
              comment={commentCount.length}
            />
            <ModuleLoader
              title="İLGİNİZİ ÇEKEBİLİR"
              theme="default"
              component="LatestArticles"
            >
              <LatestArticles
                current={article.id}
                count={3}
                position="bottom"
                product={null}
                city={null}
                offset={0}
              />
            </ModuleLoader>
            <ModuleLoader
              title="BU İÇERİĞE EMOJİYLE TEPKİ VER!"
              theme="default"
              component="ArticleReaction"
            >
              <ArticleReaction
                article={article.id}
                types={reactionTypes}
                data={reactions}
              />
            </ModuleLoader>
            <Comments
              article={article.id}
              slug={`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${article.id}/${slug}`}
              count={commentCount.length}
              data={comments}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
