"use client";
import { useState } from "react";
import classNames from "classnames";
import CommentItemHeader from "./CommentItemHeader";
import CommentItemFooter from "./CommentItemFooter";
import CommentSubView from "./CommentSubView";
import CommentAvatar from "./CommentAvatar";
import { fetchAPI } from "@/app/utils/fetch-api";
import { scrollToComment, pointedComment } from "@/app/utils/comment-api";
import { CommentsProp } from "@/app/utils/model";

const fetchComments = (article: number) => {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/comments/`;
    const urlParamsObject = {
      filters: {
        article: {
          id: {
            $eq: 120,
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
          },
        },
        reply_froms: {
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
          },
        },
      },
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: 25,
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
  console.log(0, type, checked);
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/comments/${comment}`;
  const urlParamsObjectOld = {
    fields: [type],
  };
  const optionsOld = { headers: { Authorization: `Bearer ${token}` } };
  const old = await fetchAPI(path, urlParamsObjectOld, optionsOld);
  console.log(1, type, checked);

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
          [type]: old.data.attributes[type] + (checked ? -1 : 1),
        },
      }),
    }
  );
  console.log(
    2,
    type,
    checked,
    old.data.attributes[type],
    result.data.attributes[type]
  );
  return result.data.attributes[type];
};
const CommentView = ({
  commentsInitial,
  slug,
  article,
}: {
  commentsInitial: CommentsProp[];
  slug: string;
  article: number;
}) => {
  const [comment, setComments] = useState(commentsInitial);
  const commentListUpdate = async (article: number) => {
    console.log(article);
    const { data: fetchedComments } = (await fetchComments(article)) || [];
    setComments(fetchedComments);
  };
  const pointedCommentId = pointedComment();
  pointedCommentId && scrollToComment(pointedCommentId);
  return (
    <div className="flex flex-col divide-y mt-4">
      {comment.map((comment: CommentsProp, i: number) => {
        const { user } = comment.attributes;
        return (
          <div
            key={i}
            className="flex flex-col"
            //onClick={() => commentListUpdate(article)}
          >
            <article
              id={`comment-${comment.id}`}
              className={classNames(
                user.data?.attributes.blocked
                  ? "line-through text-danger/50"
                  : "",
                pointedCommentId == comment.id ? "bg-point/20 py-4" : "py-2",
                "flex items-start gap-2 transition duration-400 ease-in ease-out"
              )}
            >
              <CommentAvatar {...comment} />
              <div className="flex-auto">
                <CommentItemHeader {...comment} slug={slug} position="footer" />
                {comment.attributes.approvalStatus === "ignored" ? (
                  <div
                    className="line-through text-darkgray/60 text-base mb-1"
                    dangerouslySetInnerHTML={{
                      __html: "BU YORUM KALDIRILMIŞTIR!",
                    }}
                  />
                ) : (
                  <div
                    className="text-darkgray text-base mb-1"
                    dangerouslySetInnerHTML={{
                      __html: comment.attributes.content,
                    }}
                  />
                )}
                <CommentItemFooter {...comment} slug={slug} position="footer" />
                {comment.attributes.thread_ons.data.length > 0 && (
                  <div className="flex flex-col divide-y border-t mt-4">
                    {comment.attributes.thread_ons.data.map(
                      (item: CommentsProp, b: number) => (
                        <CommentSubView key={b} {...item} slug={comment.slug} />
                      )
                    )}
                  </div>
                )}
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
};

export default CommentView;
