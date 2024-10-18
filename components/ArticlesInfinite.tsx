"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchAPI } from "@/utils/fetch-api";
import Loader from "@/components/Loader";
import Blog from "@/views/blog-list";

interface Meta {
  pagination: {
    start: number;
    limit: number;
    total: number;
  };
}
export default function ArticlesInfinite({
  slug,
  offset,
}: {
  slug: string;
  offset: any;
}) {
  const [meta, setMeta] = useState<Meta | undefined>();
  const [data, setData] = useState<any>([]);
  const [isLoading, setLoading] = useState(true);

  const fetchData = useCallback(async (start: number, limit: number) => {
    setLoading(true);
    try {
      const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
      const path = `/articles`;
      const urlParamsObject = {
        sort: { createdAt: "desc" },
        filters: {
          id: {
            $notIn: offset,
          },
          cities: {
            slug: {
              $eq: slug,
            },
          },
        },
        populate: {
          image: { fields: ["url"] },
          category: {
            populate: ["title", "slug"],
          },
        },
        pagination: {
          start: start,
          limit: limit,
        },
      };
      const options = { headers: { Authorization: `Bearer ${token}` } };
      const responseData = await fetchAPI(path, urlParamsObject, options);

      if (start === 0) {
        setData(responseData.data);
      } else {
        setData((prevData: any[]) => [...prevData, ...responseData.data]);
      }

      setMeta(responseData.meta);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  function loadMorePosts(): void {
    const nextPosts = meta!.pagination.start + meta!.pagination.limit;
    fetchData(nextPosts, Number(process.env.NEXT_PUBLIC_PAGE_LIMIT));
  }

  useEffect(() => {
    fetchData(0, 3);
  }, [fetchData]);
  if (data.length === 0 && isLoading) return <Loader />;
  if (data.length === 0) return "";
  return (
    <div>
      <Blog data={data} position="bottom">
        {meta!.pagination.start + meta!.pagination.limit <
          meta!.pagination.total && (
          <div className="flex justify-center">
            <button
              type="button"
              className="px-6 py-3 text-sm rounded-lg hover:underline dark:bg-gray-900 dark:text-gray-400"
              onClick={loadMorePosts}
            >
              Daha fazla haber...
            </button>
          </div>
        )}
      </Blog>
    </div>
  );
}
