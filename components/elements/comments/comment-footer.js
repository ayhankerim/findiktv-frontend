import React, { useState } from "react"
import { useSWRConfig } from "swr"
import { fetchAPI } from "utils/api"
import { useSelector, useDispatch } from "react-redux"
import { replyComment } from "@/store/comment"
import Tooltip from "@/components/elements/tooltip"
import {
  MdThumbUpOffAlt,
  MdThumbDownOffAlt,
  MdThumbUp,
  MdThumbDown,
} from "react-icons/md"
function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

let commentReactions = [
  {
    id: "dislike",
    title: "Katılmıyorum",
    icon: <MdThumbDownOffAlt />,
    iconFull: <MdThumbDown />,
    class: "text-danger",
  },
  {
    id: "like",
    title: "Katılıyorum",
    icon: <MdThumbUpOffAlt />,
    iconFull: <MdThumbUp />,
    class: "text-success",
  },
]

const CommentFooter = ({ comment, address }) => {
  const dispatch = useDispatch()
  const { mutate } = useSWRConfig()
  const reply = useSelector((state) => state.comment.reply)
  const [check, setCheck] = useState([])

  async function updateCommentReaction(comment, type, value, add) {
    const newItem =
      type === "like" && add > 0
        ? { id: comment, like: true, dislike: false }
        : type === "dislike" && add > 0
        ? { id: comment, like: false, dislike: true }
        : { id: comment, like: false, dislike: false }
    const index = check.findIndex((object) => object.id === newItem.id)

    if (index === -1) {
      setCheck((check) => [...check, newItem])
    } else {
      setCheck((check) =>
        check.map((obj) => {
          if (obj.id === comment) {
            return { ...obj, [type]: add > 0 ? true : false }
          }

          return obj
        })
      )
    }
    await fetchAPI(
      `/comments/${comment}`,
      {},
      {
        method: "PUT",
        body: JSON.stringify({
          data: {
            [type]: value + add,
          },
        }),
      }
    )
    mutate(address)
  }
  return (
    <div
      className={classNames(
        reply === comment.id ? "" : "border-b pb-2 mb-2",
        "flex items-center justify-between flex-row-reverse gap-2 text-midgray"
      )}
    >
      {comment.attributes.approvalStatus != "ignored" && (
        <div className="flex gap-2">
          {commentReactions.map((item) => {
            return (
              <Tooltip
                key={item.id}
                orientation="bottom"
                tooltipText={item.title}
              >
                <button
                  onClick={() => {
                    updateCommentReaction(
                      comment.id,
                      item.id,
                      comment.attributes[item.id],
                      check.findIndex(
                        (object) =>
                          object.id === comment.id && object[item.id] === true
                      ) > -1
                        ? -1
                        : 1
                    )
                  }}
                  className={classNames(
                    check.findIndex(
                      (object) =>
                        object.id === comment.id && object[item.id] === true
                    ) > -1
                      ? "text-dark border-dark font-semibold"
                      : "",
                    "flex justify-between items-center gap-2 py-1 px-2 border rounded hover:text-dark"
                  )}
                >
                  {check.findIndex(
                    (object) =>
                      object.id === comment.id && object[item.id] === true
                  ) > -1
                    ? item.iconFull
                    : item.icon}
                  <span className={item.class}>
                    {comment.attributes[item.id]}
                  </span>
                </button>
              </Tooltip>
            )
          })}
        </div>
      )}
      {comment.attributes.approvalStatus != "ignored" &&
        comment.attributes.blockedThread != true && (
          <button
            type="button"
            onClick={() =>
              dispatch(replyComment(reply === comment.id ? 0 : comment.id))
            }
          >
            {reply === comment.id ? "Vazgeç" : "Yanıtla"}
          </button>
        )}
    </div>
  )
}

export default CommentFooter
