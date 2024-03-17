"use client";
import React, { useEffect, useState } from "react";
import { fetchAPI } from "@/app/utils/fetch-api";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { BiLoaderCircle } from "react-icons/bi";

export default function PageView({ viewId }: { viewId: number }) {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(300);
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        await fetchAPI(`/views/${viewId}`, {}).then(async (data) => {
          if (data && data.data) {
            try {
              await fetchAPI(
                `/views/${viewId}`,
                {},
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    data: {
                      view: data.data.attributes.view + 1,
                    },
                  }),
                }
              ).then((data) => {
                setView(data.data.attributes.view + 1);
              });
            } catch (error) {
              console.log(error);
            }
          }
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewId, setLoading, setView]);
  return (
    <div className="flex flex-col md:flex-row items-center md:gap-1 text-xs text-midgray">
      <span className="flex flex-col md:flex-row items-center md:gap-1">
        <MdOutlineRemoveRedEye className="inline-block" />
        {loading ? (
          <BiLoaderCircle className="mr-2 inline-block align-middle w-4 h-4 text-gray-200 animate-spin" />
        ) : view > 300 ? (
          view
        ) : (
          300
        )}
      </span>
      <span>gösterim</span>
    </div>
  );
}
