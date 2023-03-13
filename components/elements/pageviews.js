import { fetchAPI } from "@/utils/api"
import useSWR from "swr"
import { MdOutlineRemoveRedEye } from "react-icons/md"

async function fetcher(...args) {
  const res = await fetch(...args)
  return res.json()
}

export default function ViewCounter({ articleId, pageType = "articles" }) {
  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/${
      pageType ? pageType : "articles"
    }/${articleId}?fields[0]=view`,
    fetcher
  )
  const views = new Number(data?.data.attributes.view)

  const registerView = async () =>
    await fetchAPI(
      `/${pageType ? pageType : "articles"}/${articleId}`,
      {},
      {
        method: "PUT",
        body: JSON.stringify({
          data: {
            view: data.data.attributes.view ? data.data.attributes.view + 1 : 1,
          },
        }),
      }
    )
  if (data) {
    registerView()
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center md:gap-1 text-xs text-midgray">
        <span className="flex flex-col md:flex-row items-center md:gap-1">
          <MdOutlineRemoveRedEye className="inline-block" />{" "}
          {views > 0 ? (views < 300 ? 300 : views.toLocaleString()) : "–––"}
        </span>
        <span>gösterim</span>
      </div>
    </>
  )
}
