import React, { useState, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { useSelector, useDispatch } from "react-redux"
import { replyComment, countComment } from "@/store/comment"
import axios from "axios"
import useSWR, { useSWRConfig } from "swr"
import useSWRInfinite from "swr/infinite"
import Image from "next/image"
import CommentsHeader from "./comments-header"
import CommentHeader from "./comment-header"
import CommentFooter from "./comment-footer"
import CommentForm from "./comment-form"
import { Toaster } from "react-hot-toast"
import { MdPerson, MdOutlineReportProblem } from "react-icons/md"
import { TbLoader } from "react-icons/tb"
function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Comments = ({ article, slug }) => {
  const dispatch = useDispatch()
  const reply = useSelector((state) => state.comment.reply)
  const [commentLimit, setCommentLimit] = useState(100)
  const countedComment = useSelector((state) => state.comment.countedComment)
  const userData = useSelector((state) => state.user.userData)
  const { data: session } = useSession()
  const { mutate } = useSWRConfig()
  const address = `${process.env.NEXT_PUBLIC_SITE_URL}/api/comments?populate[user][populate]=%2A&populate[threadOf][fields][0]=id&populate[reply_to][fields][0]=id&filters[article][id][$eq]=${article}&filters[removed][$eq]=false&filters[$or][0][approvalStatus][$eq]=approved&filters[$or][1][approvalStatus][$eq]=ignored&sort[0]=id%3Adesc`
  const fetcher = async (url) =>
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
        },
      })
      .then((res) => res.data.data)
  //const { data: commentArray, error } = useSWR(address, fetcher)
  const {
    data: commentArray,
    error,
    size,
    setSize,
    isValidating,
  } = useSWRInfinite(
    (index) =>
      `${address}&pagination[pageSize]=${commentLimit}&pagination[page]=${
        index + 1
      }`,
    fetcher
  )
  const issues = commentArray ? [].concat(...commentArray) : []
  const isLoadingInitialData = !commentArray && !error
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && commentArray && typeof commentArray[size - 1] === "undefined")
  const isEmpty = commentArray?.[0]?.length === 0
  const isReachingEnd =
    isEmpty ||
    (commentArray &&
      commentArray[commentArray.length - 1]?.length < commentLimit)
  const isRefreshing =
    isValidating && commentArray && commentArray.length === size

  const arrayToTree = (arr, parent = undefined) =>
    arr &&
    arr
      .filter((item) => item.attributes.threadOf.data?.id === parent)
      .map((child) => ({ ...child, children: arrayToTree(arr, child.id) }))
  const commentsAsTree = arrayToTree(issues)
  useEffect(() => {
    axios
      .get(address, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
        },
      })
      .then((res) => dispatch(countComment(res.data.meta.pagination.total)))
  }, [address, dispatch])

  const CommentItems = (comments) => {
    return comments.map((comment) => (
      <article
        key={comment.id}
        id={`comment-${comment.id}`}
        className={classNames(
          comment.attributes.user.data.attributes.blocked
            ? "line-through text-danger/50"
            : "",
          "flex items-start gap-2 transition duration-400 ease-in ease-out"
        )}
      >
        <div className="flex-none w-[55px] h-[55px] relative">
          {comment.attributes.user.data.attributes.avatar.data ? (
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
              alt={
                comment.attributes.user.data.attributes.avatar.data.attributes
                  .alternativeText
              }
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
                reply === comment.id ? "border-b mb-2 pb-2" : "",
                ""
              )}
            >
              <CommentForm
                userData={userData}
                article={article}
                product={null}
                city={null}
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
            {comment.children.length > 0 ? CommentItems(comment.children) : ""}
          </div>
        </div>
      </article>
    ))
  }
  return (
    <section className="commentSection mb-4">
      <Toaster position="top-right" reverseOrder={false} />
      <CommentsHeader />
      <CommentForm
        userData={userData}
        article={article}
        commentId="0"
        onNewComment={() => mutate(address)}
      />
      {issues ? (
        countedComment > 0 ? (
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex justify-between items-center border-b border-midgray">
              <h4 className="font-semibold text-base text-midgray">Yorumlar</h4>
              <div className="flex">
                <div className="font-semibold text-sm text-midgray">
                  {countedComment} yorum
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {CommentItems(commentsAsTree)}
            </div>
            {issues && countedComment > commentLimit && (
              <div className="flex flex-col items-end gap-2 text-center">
                <button
                  className="text-secondary hover:underline"
                  disabled={isLoadingMore || isReachingEnd}
                  onClick={() => setSize(size + 1)}
                >
                  {isLoadingMore
                    ? "Yükleniyor..."
                    : !isReachingEnd && "Daha fazla yorum yükle"}
                </button>
                {isReachingEnd && (
                  <div className="text-midgray">Daha fazla yorum yok</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 mt-4 text-center">
            <Image
              width="72"
              height="72"
              src="/uploads/writing_hand_512d1ac033.gif"
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
