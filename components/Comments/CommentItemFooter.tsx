"use client";
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import dynamic from "next/dynamic";
import {
  MdThumbDown,
  MdThumbDownOffAlt,
  MdThumbUp,
  MdThumbUpOffAlt,
  MdOutlineReplyAll,
  MdClose,
} from "react-icons/md";
import Tooltip from "../Tooltip";
import { fetchAPI } from "@/utils/fetch-api";
import { CommentsProp } from "@/utils/model";
import Loader from "@/components/Loader";

const CommentForm = dynamic(
  () => import("@/components/Comments/CommentForm"),
  {
    loading: () => <Loader cssClass="h-[250px] w-full" />,
    ssr: false,
  }
);

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
];
const reactionComment = async (
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
          [type]: old.data.attributes[type] + (checked ? -1 : 1),
        },
      }),
    }
  );
  return result.data.attributes[type];
};

const CommentReaction = ({ item, comment }: { item: any; comment: any }) => {
  const [checked, setChecked] = useState(false);
  const [count, setCount] = useState([]);

  const commentReact = async (type: string) => {
    const result = reactionComment(comment.id, type, checked);
    setCount(await result);
    setChecked((checked) => !checked);
  };
  useEffect(() => {
    setCount(comment.attributes[item.id]);
  }, [setCount]);

  return (
    <Tooltip key={item.id} orientation="bottom" tooltipText={item.title}>
      <button
        onClick={() => commentReact(item.id)}
        type="button"
        className={classNames(
          checked ? "text-white border-dark font-semibold bg-dark" : "",
          "flex justify-between items-center gap-2 py-1 px-2 border rounded min-w-[55px]"
        )}
      >
        {checked ? item.iconFull : item.icon}
        <span className={item.class}>{count}</span>
      </button>
    </Tooltip>
  );
};

const CommentItemFooter = ({
  comment,
  parent,
  article,
  commentLimit,
  commentLimitFunc,
}: {
  comment: CommentsProp;
  parent: number | null;
  article: number;
  commentLimit: number;
  commentLimitFunc: (limit: number) => void;
}) => {
  const [reply, setReply] = useState<boolean>(false);
  const commentReply = () => {
    setReply((reply) => !reply);
  };
  return (
    <>
      <section className="flex items-center justify-between gap-2 text-midgray mb-2">
        {comment.attributes.approvalStatus != "ignored" &&
          comment.attributes.blockedThread != true && (
            <button
              type="button"
              className="flex items-center gap-1 hover:underline"
              onClick={() => commentReply()}
            >
              {reply ? (
                <>
                  <MdClose /> Vazgeç
                </>
              ) : (
                <>
                  <MdOutlineReplyAll /> Yanıtla
                </>
              )}
            </button>
          )}
        {comment.attributes.approvalStatus != "ignored" && (
          <div className="flex gap-2">
            {commentReactions.map((item, i) => (
              <CommentReaction key={i} item={item} comment={comment} />
            ))}
          </div>
        )}
      </section>
      {reply && (
        <div className="-ml-12">
          <CommentForm
            cancelButton={false}
            article={article}
            product={null}
            city={null}
            replyto={comment.id}
            threadOf={parent || comment.id}
            commentLimit={commentLimit}
            commentLimitFunc={commentLimitFunc}
            commentReply={commentReply}
          />
        </div>
      )}
    </>
  );
};

export default CommentItemFooter;
