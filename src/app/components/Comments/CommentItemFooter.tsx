"use client";
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import dynamic from "next/dynamic";
import {
  MdThumbDown,
  MdThumbDownOffAlt,
  MdThumbUp,
  MdThumbUpOffAlt,
} from "react-icons/md";
import Tooltip from "../Tooltip";
import { fetchAPI } from "@/app/utils/fetch-api";
import { CommentsProp } from "@/app/utils/model";
import Loader from "@/app/components/Loader";
//import CommentForm from "./CommentForm";

const CommentForm = dynamic(
  () => import("@/app/components/Comments/CommentForm"),
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
          checked ? "text-dark border-dark font-semibold" : "",
          "flex justify-between items-center gap-2 py-1 px-2 border rounded hover:text-dark"
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
  article,
  commentLimit,
  commentLimitFunc,
}: {
  comment: CommentsProp;
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
            <button type="button" onClick={() => commentReply()}>
              {reply ? "Vazgeç" : "Yanıtla"}
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
        <CommentForm
          cancelButton={false}
          article={article}
          product={null}
          city={null}
          replyto={comment.id}
          threadOf={comment.id}
          commentLimit={commentLimit}
          commentLimitFunc={commentLimitFunc}
        />
      )}
    </>
  );
};

export default CommentItemFooter;
