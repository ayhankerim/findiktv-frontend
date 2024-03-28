"use client";
import { fetchAPI } from "@/app/utils/fetch-api";
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
const UserInteractions = async ({ user }: { user: number }) => {
  const data = (await fetchUserActions(user)) || [];
  return <>{data.comments.length + data.reactions.length}</>;
};

export default UserInteractions;
