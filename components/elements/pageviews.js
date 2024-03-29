import React, { useEffect, useState } from "react"
import { fetchAPI } from "@/utils/api"
import { MdOutlineRemoveRedEye } from "react-icons/md"
import { BiLoaderCircle } from "react-icons/bi"

const ViewCounter = ({ article }) => {
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState(300)
  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        await fetchAPI("/views", {
          filters: {
            article: {
              id: {
                $eq: article,
              },
            },
          },
          pagination: {
            start: 0,
            limit: 1,
          },
        }).then(async (data) => {
          if (data && data.data[0]) {
            try {
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
              })
            } catch (console) {
              console.log(error)
            }
          }
        })
      } catch (console) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [article, setLoading, setView])
  return (
    <>
      <div className="flex flex-col md:flex-row items-center md:gap-1 text-xs text-midgray">
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
