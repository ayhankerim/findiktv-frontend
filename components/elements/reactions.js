import React, { useState, useEffect } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import { fetchAPI } from "utils/api"
import { MdOutlineEmojiEmotions } from "react-icons/md"
import Image from "next/image"
import Tooltip from "@/components/elements/tooltip"

const Reactions = ({ article }) => {
  const qs = require("qs")
  const { data: session } = useSession()
  const [reactionTypes, setReactionTypes] = useState([])
  const fetcher = (...args) =>
    fetch(...args, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
      },
    }).then((res) => res.json())

  useEffect(() => {
    fetchAPI("/reaction-types", {
      filters: {
        status: {
          $eq: true,
        },
      },
      fields: ["*"],
      populate: {
        image: {
          populate: ["*"],
        },
      },
      sort: ["sort:asc"],
    }).then((data) => {
      let NewData = data.data.map((e) => {
        e.check = false
        return e
      })
      setReactionTypes(NewData)
    })
  }, [])

  const query = qs.stringify(
    {
      sort: ["id:desc"],
      filters: {
        article: {
          id: {
            $eq: article,
          },
        },
      },
      populate: {
        ReactionType: {
          populate: ["slug"],
          fields: ["slug"],
        },
      },
      fields: ["Value"],
      pagination: {
        page: 1,
        pageSize: 1000,
      },
    },
    {
      encodeValuesOnly: true,
    }
  )

  const {
    data: reactionsData,
    mutate,
    error,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/reactions/?` + query,
    fetcher
  )

  var total = 0
  reactionsData?.data &&
    reactionsData.data.forEach(function (reaction) {
      total += reaction.attributes.Value
    })

  const onSubmit = async (id, x, checked) => {
    await fetchAPI(
      `/reactions`,
      {},
      {
        method: "POST",
        body: JSON.stringify({
          data: {
            article: article,
            ReactionType: id,
            Value: checked ? -1 : 1,
            user: session ? session.id : null,
          },
        }),
      }
    )
    let new_updated_data = reactionTypes.map((item) => {
      if (item.attributes.slug === x) {
        return {
          ...item,
          check: !item.check,
        }
      }
      return item
    })
    setReactionTypes(new_updated_data)
    mutate(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/reactions?` + query)
  }
  return (
    <section className="reactionSection mt-2">
      <div className="flex flex-row items-center justify-between border-b border-midgray">
        <h3 className="font-semibold text-base text-midgray">
          BU İÇERİĞE EMOJİYLE TEPKİ VER!
        </h3>
        <MdOutlineEmojiEmotions className="text-lg text-midgray" />
      </div>
      <div className="grid grid-cols-7 sm:grid-cols-8 md:grid-cols-9 lg:grid-cols-10 xl:grid-cols-11 xxl:grid-cols-12 gap-1 text-xs mt-1 mb-4">
        {reactionTypes.map((emoji) => {
          var sum = 0
          reactionsData?.data &&
            reactionsData.data
              .filter(
                (reaction) =>
                  reaction.attributes.ReactionType.data.attributes.slug ==
                  emoji.attributes.slug
              )
              .forEach(function (reaction) {
                sum += reaction.attributes.Value
              })
          return (
            <div className="flex flex-col" key={emoji.id}>
              <div className="flex flex-col h-[50px] justify-end mx-1 lg:mx-2 text-center">
                <span className="h-[20px]">
                  {reactionsData?.data ? sum : 0}
                </span>
                <div
                  style={{
                    height: reactionsData?.data
                      ? (60 * sum) / (total > 0 ? total : 1)
                      : 1 + "px",
                  }}
                  className="w-full min-h-[1px] bg-success transition duration-150 ease-out md:ease-in"
                ></div>
              </div>
              <Tooltip
                orientation="bottom"
                tooltipText={emoji.attributes.title}
              >
                <button
                  className={`"w-full h-full ${
                    emoji.check
                      ? "border-secondary bg-white shadow-lg"
                      : "border-midgray bg-lightgray"
                  } border border-b-2 hover:bg-white rounded`}
                  onClick={async () => {
                    onSubmit(emoji.id, emoji.attributes.slug, emoji.check)
                  }}
                >
                  <Image
                    width="64"
                    height="64"
                    src={emoji.attributes.image.data.attributes.url}
                    alt={emoji.attributes.title}
                    unoptimized={true}
                  />
                </button>
              </Tooltip>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Reactions
