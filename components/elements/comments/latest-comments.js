import { useState, useEffect } from "react"
import { fetchAPI } from "@/utils/api"
import Link from "next/link"
import Image from "next/image"
import CommentHeader from "./comment-header"
import CommentFooter from "./comment-footer"
import Advertisement from "@/components/elements/advertisement"
import { MdPerson, MdExpandMore } from "react-icons/md"
import { AiOutlineComment } from "react-icons/ai"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const LatestComments = ({ size, position, offset = 0 }) => {
  const [Comments, setComments] = useState([])
  const [CommentVisible, setCommentVisible] = useState(0)
  useEffect(() => {
    fetchAPI("/comments", {
      filters: {
        approvalStatus: {
          $eq: "approved",
        },
        removed: {
          $eq: false,
        },
      },
      fields: ["*"],
      populate: {
        user: {
          populate: ["id", "city", "role"],
        },
        user: {
          populate: {
            avatar: {
              populate: "*",
            },
            SystemAvatar: {
              populate: "*",
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
        article: {
          populate: ["id", "slug"],
        },
        city: {
          populate: ["slug"],
        },
        product: {
          populate: ["slug"],
        },
      },
      sort: ["id:desc"],
      pagination: {
        start: offset,
        limit: size,
      },
    }).then((data) => {
      setComments(data)
    })
  }, [offset, size])

  return (
    <>
      <div className="flex flex-wrap pt-2 my-2">
        {Comments &&
          Comments.data &&
          Comments.data.map((comment, i) => (
            <div className="flex flex-col w-full mb-8" key={comment.id}>
              {i > 2 && i % 3 === 0 && (
                <Advertisement position="comment-ad-1" />
              )}
              <article
                id={`comment-${comment.id}`}
                className={classNames(
                  comment.attributes.user.data?.attributes.blocked
                    ? "line-through text-danger/50"
                    : "",
                  "flex items-start gap-2 transition duration-400 ease-in ease-out"
                )}
              >
                <div className="flex-none w-[25px] h-[25px] relative">
                  {comment.attributes.user.data?.attributes.avatar.data ? (
                    <Image
                      className="rounded"
                      fill
                      sizes="100vw"
                      style={{
                        objectFit: "cover",
                      }}
                      src={
                        comment.attributes.user.data.attributes.avatar.data
                          .attributes.formats.thumbnail.url
                      }
                      alt={comment.attributes.user.data.attributes.username}
                    />
                  ) : comment.attributes.user.data?.attributes.SystemAvatar
                      .data ? (
                    <Image
                      className="rounded"
                      fill
                      sizes="100vw"
                      style={{
                        objectFit: "cover",
                      }}
                      src={
                        comment.attributes.user.data.attributes.SystemAvatar
                          .data?.attributes.image.data.attributes.url
                      }
                      alt={comment.attributes.user.data.attributes.username}
                    />
                  ) : (
                    <MdPerson style={{ width: 25, height: 25 }} />
                  )}
                </div>
                <div className="flex-auto">
                  <CommentHeader
                    position="sidebar"
                    comment={comment}
                    slug={
                      (comment.attributes.article.data &&
                        `/haber/${comment.attributes.article.data.id}/${comment.attributes.article.data.attributes.slug}`) ||
                      (comment.attributes.city.data &&
                        `/urunler/${comment.attributes.product.data.attributes.slug}/${comment.attributes.city.data.attributes.slug}/fiyati`) ||
                      (comment.attributes.product.data &&
                        `/urunler/${comment.attributes.product.data.attributes.slug}/fiyatlari`)
                    }
                    address={null}
                  />
                  <>
                    <div
                      className={classNames(
                        CommentVisible === comment.id
                          ? ""
                          : "max-h-[110px] text-ellipsis overflow-hidden",
                        "text-darkgray text-sm border-b-2 border-dashed pb-2"
                      )}
                      dangerouslySetInnerHTML={{
                        __html: comment.attributes.content,
                      }}
                    />
                    <div
                      className="flex justify-between relative z-1"
                      style={{
                        boxShadow:
                          comment.attributes.content.split(" ").length > 20
                            ? CommentVisible === 0 ||
                              CommentVisible != comment.id
                              ? "rgba(0, 0, 0, 0.3) 0px -16px 10px -6px"
                              : ""
                            : "",
                      }}
                    >
                      <Link
                        href={
                          (comment.attributes.article.data &&
                            `/haber/${comment.attributes.article.data.id}/${comment.attributes.article.data.attributes.slug}#comment-${comment.id}`) ||
                          (comment.attributes.city.data &&
                            `/urunler/${comment.attributes.product.data.attributes.slug}/${comment.attributes.city.data.attributes.slug}/fiyati#comment-${comment.id}`) ||
                          (comment.attributes.product.data &&
                            `/urunler/${comment.attributes.product.data.attributes.slug}/fiyatlari#comment-${comment.id}`)
                        }
                        className="text-secondary hover:underline"
                      >
                        Yoruma git
                      </Link>

                      {comment.attributes.content.split(" ").length > 20 &&
                        CommentVisible != comment.id && (
                          <button
                            onClick={() =>
                              setCommentVisible(
                                CommentVisible === comment.id ? 0 : comment.id
                              )
                            }
                          >
                            Hepsini göster{" "}
                            <MdExpandMore className="inline-block" />
                          </button>
                        )}
                    </div>
                  </>
                </div>
              </article>
            </div>
          ))}
        <div className="w-full md:w-1/2 lg:w-full min-h-[300px] -mx-2 sm:mx-0 md:mx-0">
          <Advertisement
            position={
              position === "bottom"
                ? "article-bottom-desktop"
                : "sidebar-bottom-desktop"
            }
          />
        </div>
      </div>
    </>
  )
}

export default LatestComments
