import { fetchAPI } from "../utils/fetch-api";
import BlogList from "../views/blog-list";
import Advertisement from "./Advertisement";
async function fetchLatestPosts(
  current: number | null,
  product: number | null,
  city: number | null,
  count: number,
  offset: number
) {
  let arrayFiltered = [];
  if (current) {
    arrayFiltered.push({
      id: {
        $ne: current,
      },
    });
  }
  if (product) {
    arrayFiltered.push({
      products: {
        id: {
          $eq: product,
        },
      },
    });
  }
  if (city) {
    arrayFiltered.push({
      cities: {
        id: {
          $in: city,
        },
      },
    });
  }
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
      sort: { createdAt: "desc" },
      filters: arrayFiltered,
      fields: ["title", "slug", "publishedAt"],
      populate: {
        image: { fields: ["url"] },
        category: { fields: ["slug"] },
      },
      pagination: {
        start: offset,
        limit: count,
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
}

interface LatestArticlesProps {
  current: number;
  product: number | null;
  city: number | null;
  count: number;
  position: string;
  offset: number;
}
export default async function LatestArticles({
  current,
  product,
  city,
  count,
  position,
  offset = 0,
}: LatestArticlesProps) {
  const { data } =
    (await fetchLatestPosts(current, product, city, count, offset)) || [];
  return (
    <>
      <div className="-mx-6">
        <BlogList data={data} />
      </div>
      <div className="w-full h-[300px] -mx-2 sm:mx-0">
        <Advertisement
          position={
            position === "bottom"
              ? "article-bottom-desktop"
              : "sidebar-bottom-desktop"
          }
          adformat={""}
        />
      </div>
    </>
  );
}
