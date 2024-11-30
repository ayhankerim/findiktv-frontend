"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { fetchAPI } from "./fetch-api";
import { CommentFormValues } from "./model";

export const commentLimits: { limits: number[] } = {
  limits: [10, 20, 30, 50, 100],
};
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

export const fetchComments = (article: number, commentLimit: number) => {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/comments/`;
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
        thread_of: {
          id: {
            $null: true,
          },
        },
        reply_to: {
          id: {
            $null: true,
          },
        },
        user: {
          id: {
            $notNull: true,
          },
        },
      },
      fields: [
        "blockedThread",
        "content",
        "createdAt",
        "dislike",
        "like",
        "flag",
        "approvalStatus",
      ],
      populate: {
        user: {
          fields: [
            "about",
            "name",
            "surname",
            "username",
            "blocked",
            "confirmed",
          ],
          populate: {
            avatar: {
              populate: "*",
            },
            SystemAvatar: {
              populate: {
                image: {
                  populate: "*",
                },
              },
              fields: ["*"],
            },
            city: {
              populate: ["title"],
            },
            role: {
              populate: ["name"],
            },
          },
        },
        thread_ons: {
          field: ["id"],
          populate: {
            user: {
              fields: [
                "about",
                "name",
                "surname",
                "username",
                "blocked",
                "confirmed",
              ],
              populate: {
                avatar: {
                  populate: "*",
                },
                SystemAvatar: {
                  populate: {
                    image: {
                      populate: "*",
                    },
                  },
                  fields: ["*"],
                },
                city: {
                  populate: ["title"],
                },
                role: {
                  populate: ["name"],
                },
              },
            },
            reply_to: {
              field: ["id"],
              populate: {
                user: {
                  fields: ["name", "surname", "username"],
                },
              },
            },
          },
        },
      },
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: commentLimit,
      },
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const responseData = fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
};
export const reactionComment = async (
  comment: string,
  type: string,
  checked: boolean
) => {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/comments/${comment}`;
  const urlParamsObjectOld = {
    fields: [type],
  };
  const optionsOld = { headers: { Authorization: `Bearer ${token}` } };
  const old = await fetchAPI(path, urlParamsObjectOld, optionsOld);
  const result = await fetchAPI(
    path,
    {
      fields: [type],
    },
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          [type]: old.data[type] + (checked ? -1 : 1),
        },
      }),
    }
  );
  return result.data[type];
};

export const registerUser = (values: CommentFormValues) => {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = "/auth/local/register";
    const urlParamsObject = {};
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: Math.random().toString(36).slice(5),
        email: values.email,
        name: values.name,
        surname: values.surname,
        role: 3,
        confirmed: false,
        password: values.password
          ? values.password
          : Math.random().toString(36).slice(2) +
            Math.random().toString(36).slice(2),
      }),
    };
    const responseData = fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
};

export const addComments = (
  values: CommentFormValues,
  article: number,
  product: number | null,
  city: number | null,
  threadOf: number | null,
  replyto: number | null,
  user: number | null,
  ip: string | ""
) => {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = "/comments";
    const urlParamsObject = {};
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          article: article,
          product: product,
          city: city,
          thread_of: threadOf ? threadOf : null,
          reply_to: replyto ? replyto : null,
          user: user,
          content: values.content,
          approvalStatus: "approved",
          ip: ip,
        },
      }),
    };
    const responseData = fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error) {
    console.error(error);
  }
};
