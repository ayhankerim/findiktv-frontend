import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAPI } from "@/utils/fetch-api";
import { FALLBACK_SEO } from "@/utils/constants";
import BlogList from "@/views/blog-list";
import ArticleSlider from "@/views/slider";
import PageHeader from "@/components/PageHeader";
import ArticlesInfinite from "@/components/ArticlesInfinite";

type Props = {
  params: {
    lang: string;
    slug: string;
  };
};
const SLIDER_SIZE = 5;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPostsByTag(params.slug, []);

  if (!page?.data[0]?.attributes?.tags.data[0]?.attributes.metadata)
    return FALLBACK_SEO;
  const metadata = page.data[0].attributes.tags.data[0]?.attributes.metadata;

  return {
    title: metadata.metaTitle + " Haberleri | " + FALLBACK_SEO.siteName,
    description: metadata.metaDescription,
  };
}
async function fetchSliderByTag(filter: string) {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
      sort: { createdAt: "desc" },
      filters: {
        tags: {
          slug: {
            $eq: filter,
          },
        },
        featured: {
          $eq: true,
        },
      },
      fields: ["title", "slug", "publishedAt"],
      populate: {
        homepage_image: { fields: ["url"] },
        category: { fields: ["slug"] },
      },
      pagination: {
        page: 1,
        pageSize: SLIDER_SIZE,
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
}
async function fetchPostsByTag(filter: string, sliderPosts: any) {
  const notFeatured = sliderPosts.map((item: any) => item.id);
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
      sort: { createdAt: "desc" },
      filters: {
        id: {
          $notIn: notFeatured,
        },
        tags: {
          slug: {
            $eq: filter,
          },
        },
      },
      populate: {
        image: { fields: ["url"] },
        tags: {
          filters: {
            slug: {
              $eq: filter,
            },
          },
          populate: ["title", "slug"],
        },
        category: {
          populate: ["title", "slug"],
        },
      },
      pagination: {
        page: 1,
        pageSize: process.env.NEXT_PUBLIC_PAGE_LIMIT,
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
}

export default async function TagRoute({
  params,
}: {
  params: { slug: string };
}) {
  const filter = params.slug;
  const { data: sliderPosts } = (await fetchSliderByTag(filter)) || [];
  const { data } =
    (await fetchPostsByTag(
      filter,
      sliderPosts.length > 1 ? sliderPosts : []
    )) || [];
  if (data.length === 0) return notFound();
  const used = sliderPosts.concat(data).map((item: any) => item.id);
  const { title } = data[0]?.attributes.tags.data[0].attributes;
  return (
    <main>
      <PageHeader
        heading={`${title.toLocaleUpperCase("tr-TR")} HABERLERİ`}
        text=""
      />
      {sliderPosts.length > 1 && <ArticleSlider data={sliderPosts} />}
      <BlogList data={data} position="bottom" />
      <ArticlesInfinite slug={params.slug} offset={used} />
    </main>
  );
}

export async function generateStaticParams() {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/tags`;
  const options = { headers: { Authorization: `Bearer ${token}` } };
  const tagsResponse = await fetchAPI(
    path,
    {
      filters: {
        articles: {
          id: {
            $notNull: true,
          },
        },
      },
      fields: ["slug"],
    },
    options
  );

  return tagsResponse.data.map(
    (tag: {
      attributes: {
        slug: string;
      };
    }) => ({ slug: tag.attributes.slug })
  );
}
