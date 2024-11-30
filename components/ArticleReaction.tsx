"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { fetchAPI } from "../utils/fetch-api";
import Tooltip from "./Tooltip";

interface Session {
  id: number;
}
interface ReactionTypes {
  id: string;
  title: string;
  slug: string;
  sort: number;
  image: any;
}
interface Reactions {
  id: string;
  Value: number;
  ReactionType: {
    data: ReactionTypes;
  };
}
interface ArticleReactionProps {
  article: number;
  types: ReactionTypes[];
  data: {
    data: Reactions[];
  };
}

async function getPostReactions(id: number) {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/articles`;
  const urlParamsObject = {
    filters: {
      id: {
        $eq: id,
      },
    },
    fields: ["id"],
    populate: {
      reactions: {
        fields: ["Value"],
        populate: {
          ReactionType: { fields: ["slug"] },
        },
      },
    },
  };
  const options = { headers: { Authorization: `Bearer ${token}` } };
  const response = await fetchAPI(path, urlParamsObject, options);
  return response.data[0].reactions;
}
const ReactionButton = ({
  emoji,
  onSubmit,
}: {
  emoji: ReactionTypes;
  onSubmit: (id: string, slug: string, check: boolean) => void;
}) => {
  const [check, setCheck] = useState(false);
  const onCheck = async (id: string, slug: string) => {
    onSubmit(id, slug, check);
    setCheck((checked) => !checked);
  };
  return (
    <button
      className={`w-full ${
        check
          ? "border-secondary bg-white shadow-lg"
          : "border-midgray bg-lightgray"
      } border border-b-2 hover:bg-white rounded`}
      onClick={() => {
        onCheck(emoji.id, emoji.slug);
      }}
    >
      <Tooltip orientation="bottom" tooltipText={emoji.title}>
        <Image
          width="44"
          height="44"
          className="w-full"
          src={emoji.image.data.url}
          alt={`${emoji.title} ifade eden emoji`}
          style={{
            objectFit: "cover",
          }}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhZPQAIhwMsJ60FNgAAAABJRU5ErkJggg=="
        />
      </Tooltip>
    </button>
  );
};

const ArticleReaction: React.FC<ArticleReactionProps> = ({
  article,
  types: reactionTypes,
  data: reactionsInitial,
}: ArticleReactionProps) => {
  const { data } = useSession();
  const session = data as Session | null;
  const [reactions, setReactions] = useState(reactionsInitial);

  const onSubmit = async (id: string, slug: string, check: boolean) => {
    await fetchAPI(
      `/reactions`,
      {},
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            article: article,
            ReactionType: id,
            Value: check ? -1 : 1,
            user: session ? session.id : null,
          },
        }),
      }
    );
    const data = await getPostReactions(article);
    setReactions(data);
  };
  let total = 0;
  reactions?.data?.forEach((reaction: Reactions) => {
    total += reaction.Value;
  });

  return (
    <div className="grid grid-cols-7 md:grid-cols-9 lg:grid-cols-10 xl:grid-cols-11 xxl:grid-cols-12 gap-1 text-xs mt-1 mb-4">
      {reactionTypes.map((emoji: ReactionTypes, i: number) => {
        let sum = 0;
        reactions?.data
          ?.filter(
            (reaction: Reactions) =>
              reaction.ReactionType.data.slug === emoji.slug
          )
          .forEach((reaction: Reactions) => {
            sum += reaction.Value;
          });

        return (
          <div className="flex flex-col" key={i}>
            <div className="flex flex-col h-[50px] justify-end mx-1 lg:mx-2 text-center">
              <span className="h-[20px]">{sum}</span>
              <div
                style={{
                  height:
                    sum > 0 ? (60 * sum) / (total > 0 ? total : 1) : 1 + "px",
                }}
                className="w-full min-h-[1px] bg-success transition duration-150 ease-out md:ease-in"
              ></div>
            </div>
            <ReactionButton emoji={emoji} onSubmit={onSubmit} />
          </div>
        );
      })}
    </div>
  );
};

export default ArticleReaction;
