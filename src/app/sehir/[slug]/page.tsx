import PageHeader from "@/app/components/PageHeader";
import { Metadata } from "next";
import { fetchAPI } from "@/app/utils/fetch-api";
import { FALLBACK_SEO } from "@/app/utils/constants";
import BlogList from "@/app/views/blog-list";
import { notFound } from "next/navigation";

type Props = {
  params: {
    lang: string;
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPostsByCity(params.slug);

  if (!page?.data[0]?.attributes?.cities.data[0]?.attributes.metadata)
    return FALLBACK_SEO;
  const metadata = page.data[0].attributes.cities.data[0]?.attributes.metadata;

  return {
    title: metadata.metaTitle,
    description: metadata.metaDescription,
  };
}
async function fetchPostsByCity(filter: string) {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
      sort: { createdAt: "desc" },
      filters: {
        cities: {
          slug: {
            $eq: filter,
          },
        },
      },
      populate: {
        image: { fields: ["url"] },
        cities: {
          filters: {
            slug: {
              $eq: filter,
            },
          },
          populate: ["title", "slug", "content", "metadata"],
        },
        category: {
          populate: ["title", "slug"],
        },
      },
      pagination: {
        page: 1,
        pageSize: 2,
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
}

export default async function CityRoute({
  params,
}: {
  params: { slug: string };
}) {
  const filter = params.slug;
  const { data } = (await fetchPostsByCity(filter)) || [];
  if (data.length === 0) return notFound();

  const { title, content } = data[0]?.attributes.cities.data[0].attributes;

  return (
    <div>
      <PageHeader heading={title} text={content} />
      <BlogList data={data} />
    </div>
  );
}

export async function generateStaticParams() {
  return [];
}
