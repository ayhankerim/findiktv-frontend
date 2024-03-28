"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { fetchAPI } from "./fetch-api";

export const scrollToComment = (comment: string) => {
  useEffect(() => {
    const scrollToTarget = () => {
      const element = document.querySelector(`#comment-${comment}`);
      if (element instanceof HTMLElement) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    };

    scrollToTarget();
  }, []);
};
export const pointedComment = () => {
  const searchParams = useSearchParams();
  const pointedComment = searchParams.get("comment") || null;
  return pointedComment;
};
/*
const fetchUserActions = (user: number) => {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/users/${user}`;
    const urlParamsObject = {
      fields: ["id"],
      populate: {
        comments: {
          fields: ["id"],
        },
        reactions: {
          fields: ["id"],
        },
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
};
export const UserActionsCount: React.FC<CommentsProp> = (user: CommentsProp) => {
  //const data = (await fetchUserActions(id)) || [];
  console.log(user);
  return <div>120</div>;
};
*/
