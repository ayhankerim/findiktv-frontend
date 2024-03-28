"use client";
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import {
  MdThumbDown,
  MdThumbDownOffAlt,
  MdThumbUp,
  MdThumbUpOffAlt,
} from "react-icons/md";
import Tooltip from "../Tooltip";
import { fetchAPI } from "@/app/utils/fetch-api";

interface City {
  attributes: {
    title: string;
  };
}
interface CommentsProp {
  id: string;
  slug: string;
  position: string;
  attributes: {
    blockedThread: boolean;
    content: string;
    createdAt: Date;
    dislike: number;
    like: number;
    flag: number;
    approvalStatus: string;
    user: {
      data: {
        id: number;
        attributes: {
          about: string;
          name: string;
          surname: string;
          username: string;
          blocked: boolean;
          confirmed: Boolean;
          avatar: any;
          SystemAvatar: any;
          role: {
            data: {
              attributes: {
                name: string;
              };
            };
          };
          city: {
            data: City;
          };
        };
      };
    };
  };
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

  const commentReact = async (e: any, type: string) => {
    const result = reactionComment(comment.id, type, checked);
    setCount(await result);
    setChecked((checked) => !checked);
  };
  useEffect(() => {
    setCount(comment.attributes[item.id]);
  }, []);

  return (
    <Tooltip key={item.id} orientation="bottom" tooltipText={item.title}>
      <button
        onClick={(e) => commentReact(e, item.id)}
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

const CommentItemFooter: React.FC<
  CommentsProp & { slug: string; position: string }
> = (comment: CommentsProp & { slug: string; position: string }) => {
  const [reply, setReply] = useState(false);
  return (
    <section
      className={classNames(
        reply ? "" : "",
        "flex items-center justify-between gap-2 text-midgray"
      )}
    >
      {comment.attributes.approvalStatus != "ignored" &&
        comment.attributes.blockedThread != true && (
          <button type="button" onClick={() => console.log(0)}>
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
  );
};

export default CommentItemFooter;
