import PageHeader from "@/app/components/PageHeader";
import { fetchAPI } from "@/app/utils/fetch-api";
import BlogList from "@/app/views/blog-list";

async function fetchPostsByCity(filter: string) {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
      sort: { createdAt: "desc" },
      filters: {
        tags: {
          slug: filter,
        },
      },
      populate: {
        image: { fields: ["url"] },
        tags: {
          populate: ["title", "slug", "content"],
        },
        category: {
          populate: ["title", "slug"],
        },
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
  const { data } = await fetchPostsByCity(filter);

  //TODO: CREATE A COMPONENT FOR THIS
  if (data.length === 0) return <div>Not Posts In this category</div>;

  const { title, content } = data[0]?.attributes.tags.data[0].attributes;

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
