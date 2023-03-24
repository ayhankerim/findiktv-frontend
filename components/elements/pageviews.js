import React, { useEffect, useState } from "react"
import { fetchAPI } from "@/utils/api"
import { MdOutlineRemoveRedEye } from "react-icons/md"
import { BiLoaderCircle } from "react-icons/bi"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}
const ViewCounter = ({
  visible = true,
  article,
  city,
  tag,
  merchant,
  page,
  product,
}) => {
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState(300)

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      await fetchAPI("/views", {
        filters: {
          article: {
            id: {
              $eq: article,
            },
          },
          city: {
            id: {
              $eq: city,
            },
          },
          merchant: {
            id: {
              $eq: merchant,
            },
          },
          page: {
            id: {
              $eq: page,
            },
          },
          product: {
            id: {
              $eq: product,
            },
          },
          tag: {
            id: {
              $eq: tag,
            },
          },
        },
        pagination: {
          start: 0,
          limit: 1,
        },
      }).then(async (data) => {
        if (data.data.length > 0) {
          await fetchAPI(
            `/views/${data.data[0].id}`,
            {},
            {
              method: "PUT",
              body: JSON.stringify({
                data: {
                  view: data.data[0].attributes.view + 1,
                },
              }),
            }
          ).then((data) => {
            setView(data.data.attributes.view + 1)
            setLoading(false)
          })
        } else {
          setLoading(false)
          await fetchAPI(
            `/views`,
            {},
            {
              method: "POST",
              body: JSON.stringify({
                data: {
                  view: 1,
                  article: article,
                  city: city,
                  merchant: merchant,
                  page: page,
                  product: product,
                  tag: tag,
                },
              }),
            }
          )
        }
      })
    }

    fetchData()
  }, [article, city, merchant, page, product, setLoading, setView, tag])
  return (
    <>
      <div
        className={classNames(
          visible ? "" : "hidden",
          "flex flex-col md:flex-row items-center md:gap-1 text-xs text-midgray"
        )}
      >
        <span className="flex flex-col md:flex-row items-center md:gap-1">
          <MdOutlineRemoveRedEye className="inline-block" />
          {loading ? (
            <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
          ) : view > 300 ? (
            view
          ) : (
            300
          )}
        </span>
        <span>gösterim</span>
      </div>
    </>
  )
}

export default ViewCounter
