import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSelector, useDispatch } from "react-redux"
import { replyComment, countComment } from "@/store/comment"
import axios from "axios"
import useSWR, { useSWRConfig } from "swr"
import Image from "next/image"
import Link from "next/link"
import CommentsHeader from "./comments-header"
import CommentHeader from "./comment-header"
import CommentFooter from "./comment-footer"
import CommentForm from "./comment-form"
import Advertisement from "@/components/elements/advertisement"
import { Toaster } from "react-hot-toast"
import { MdPerson, MdOutlineReportProblem } from "react-icons/md"
import { TbPoint, TbLoader } from "react-icons/tb"
function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Comments = ({ article, product, slug, city }) => {
  const dispatch = useDispatch()
  const reply = useSelector((state) => state.comment.reply)
  const [commentLimit, setCommentLimit] = useState(15)
  const userData = useSelector((state) => state.user.userData)
  const { data: session } = useSession()
  const { mutate } = useSWRConfig()
  const qs = require("qs")
  const articleQuery = qs.stringify(
    {
      filters: {
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
        article: {
          id: {
            $eq: article,
          },
        },
        removed: {
          $eq: false,
        },
      },
      fields: [
        "blockedThread",
        "content",
        "createdAt",
        "dislike",
        "like",
        "flag",
      ],
      populate: {
        user: {
          populate: ["about", "name", "surname", "username"],
        },
        user: {
          populate: {
            avatar: {
              populate: ["*"],
            },
            SystemAvatar: {
              populate: ["*"],
              populate: {
                image: {
                  populate: ["*"],
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
        threadOf: {
          populate: ["id"],
        },
        reply_to: {
          populate: ["id"],
        },
      },
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: commentLimit,
      },
    },
    {
      encodeValuesOnly: true,
    }
  )
  const productQuery = qs.stringify(
    {
      filters: {
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
        product: {
          id: {
            $eq: product,
          },
        },
        removed: {
          $eq: false,
        },
      },
      fields: [
        "blockedThread",
        "content",
        "createdAt",
        "dislike",
        "like",
        "flag",
      ],
      populate: {
        user: {
          populate: ["about", "name", "surname", "username"],
        },
        user: {
          populate: {
            avatar: {
              populate: ["*"],
            },
            SystemAvatar: {
              populate: ["*"],
              populate: {
                image: {
                  populate: ["*"],
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
        threadOf: {
          populate: ["id"],
        },
        reply_to: {
          populate: ["id"],
        },
      },
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: commentLimit,
      },
    },
    {
      encodeValuesOnly: true,
    }
  )
  const cityQuery = city
    ? qs.stringify(
        {
          filters: {
            city: {
              id: {
                $eq: city,
              },
            },
          },
        },
        {
          encodeValuesOnly: true,
        }
      )
    : qs.stringify(
        {
          filters: {
            city: {
              id: {
                $null: true,
              },
            },
          },
        },
        {
          encodeValuesOnly: true,
        }
      )
  const address = article
    ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/comments?${articleQuery}`
    : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/comments?${cityQuery}&${productQuery}`
  const fetcher = async (url) =>
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
        },
      })
      .then((res) => res.data)
  const { data: commentArray, error } = useSWR(address, fetcher)

  const arrayToTree = (arr, parent = undefined) =>
    arr &&
    arr.data &&
    arr.data
      .filter((item) => item.attributes.threadOf.data?.id === parent)
      .map((child) => ({ ...child, children: arrayToTree(arr, child.id) }))
  const commentsAsTree = arrayToTree(commentArray)

  useEffect(() => {
    commentArray &&
      commentArray.data &&
      dispatch(countComment(commentArray.meta.pagination.total))
  }, [commentArray, dispatch])
  const CommentItems = (comments) => {
    return comments.map((comment, i, comments) => (
      <div className="flex flex-col" key={comment.id}>
        {i > 4 && i % 5 === 0 && <Advertisement position="comment-ad-1" />}
        <article
          id={`comment-${comment.id}`}
          className={classNames(
            comment.attributes.user.data?.attributes.blocked
              ? "line-through text-danger/50"
              : "",
            "flex items-start gap-2 transition duration-400 ease-in ease-out"
          )}
        >
          <div className="flex-none w-[55px] h-[55px] relative">
            {comment.attributes.user.data?.attributes.avatar.data ? (
              <Image
                className="rounded"
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
                src={
                  comment.attributes.user.data.attributes.avatar.data.attributes
                    .formats.thumbnail.url
                }
                alt={comment.attributes.user.data.attributes.username}
              />
            ) : comment.attributes.user.data?.attributes.SystemAvatar.data ? (
              <Image
                className="rounded"
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
                src={
                  comment.attributes.user.data.attributes.SystemAvatar.data
                    ?.attributes.image.data.attributes.url
                }
                alt={comment.attributes.user.data.attributes.username}
              />
            ) : (
              <MdPerson style={{ width: 55, height: 55 }} />
            )}
          </div>
          <div className="flex-auto">
            <CommentHeader comment={comment} slug={slug} address={address} />
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
            <CommentFooter comment={comment} address={address} />
            {reply === comment.id && (
              <div
                className={classNames(
                  reply === comment.id
                    ? "border-b -ml-12 sm:ml-0 mb-2 pb-2"
                    : "",
                  ""
                )}
              >
                <CommentForm
                  userData={userData}
                  article={article}
                  product={product}
                  city={city}
                  replyto={comment.id}
                  threadOf={comment.id}
                  commentId={reply}
                  onNewComment={() => mutate(address)}
                >
                  <button
                    className="w-full border border-midgray hover:border-dark text-midgray hover:text-dark  rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                    type="button"
                    onClick={() => dispatch(replyComment(0))}
                  >
                    Vazgeç
                  </button>
                </CommentForm>
              </div>
            )}
            <div className="subComment-container -ml-8">
              {comment.children.length > 0
                ? CommentItems(comment.children)
                : ""}
            </div>
          </div>
        </article>
      </div>
    ))
  }

  useEffect(() => {
    if (!commentArray) return
  }, [commentArray])
  return (
    <section className="commentSection mb-4">
      <Toaster position="top-right" reverseOrder={false} />
      <CommentsHeader />
      <CommentForm
        userData={userData}
        article={article}
        product={product}
        city={city}
        commentId="0"
        onNewComment={() => mutate(address)}
      />
      {commentArray ? (
        commentArray.meta.pagination.total > 0 ? (
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-midgray">
              <h4 className="font-semibold text-base text-midgray">Yorumlar</h4>
              <div className="flex flex-col md:flex-row text-center">
                {commentArray.meta.pagination.total > 15 && (
                  <div className="flex flex-row gap-2 mr-4 font-light text-sm text-midgray">
                    Son
                    <ul className="flex items-center gap-1 text-secondary">
                      {[15, 25, 50, 100]
                        .filter(
                          (limits) =>
                            commentArray.meta.pagination.total >= limits
                        )
                        .map((limit, i, limits) => (
                          <li className="flex items-center gap-2" key={limit}>
                            <button
                              className={classNames(
                                commentLimit === limit ? "font-semibold" : "",
                                "hover:underline"
                              )}
                              onClick={() => setCommentLimit(limit)}
                            >
                              {limit}
                            </button>
                            {i + 1 != limits.length && (
                              <TbPoint className="text-midgray" />
                            )}
                          </li>
                        ))}
                      {commentArray.meta.pagination.total > 100 && (
                        <li className="flex items-center gap-2">
                          <TbPoint className="text-midgray" />
                          <Link
                            className="hover:underline"
                            href={`${slug}/yorumlar`}
                          >
                            Tümü
                          </Link>
                        </li>
                      )}
                    </ul>
                    yorum göster
                  </div>
                )}
                <div className="font-semibold text-sm text-midgray">
                  {commentArray.meta.pagination.total} yorum
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {CommentItems(commentsAsTree)}
            </div>
            {commentArray &&
              commentArray.meta.pagination.total > commentLimit && (
                <div className="flex flex-col items-end gap-2 text-center">
                  <Link
                    className="text-secondary hover:underline"
                    href={`${slug}/yorumlar`}
                  >
                    Tüm yorumları gör
                  </Link>
                </div>
              )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 mt-4 text-center">
            <Image
              width="72"
              height="72"
              src={`${process.env.NEXT_PUBLIC_CLOUD_IMAGE_CORE_URL}8980237d-c760-48b3-c06d-baec1e74e700/public`}
              alt="İlk Yorumu sen yaz"
            />
            <h4 className="text-base">İlk yorumu siz yapın!</h4>
          </div>
        )
      ) : error ? (
        <div className="flex flex-col items-center gap-2 mt-4 text-center">
          <MdOutlineReportProblem className="text-xxl text-danger" />
          <h4>Yorumlar gertirilirken bir sorunla karşılaşıldı!</h4>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 mt-4 text-center">
          <TbLoader className="animate-spin text-xxl text-warning" />
          <h4>Yorumlar getiriliyor, lütfen bekleyiniz...</h4>
        </div>
      )}
    </section>
  )
}

export default Comments
