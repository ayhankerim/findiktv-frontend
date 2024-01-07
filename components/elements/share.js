import React from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  FaTelegramPlane,
  FaWhatsapp,
  FaFacebookF,
  FaComment,
} from "react-icons/fa"
import { sendGTMEvent } from "@next/third-parties/google"
import { FaXTwitter } from "react-icons/fa6"
import { SiGooglenews } from "react-icons/si"

const ArticleDates = ({ position, title, slug }) => {
  const countedComment = useSelector((state) => state.comment.countedComment)
  const { locale } = useRouter()
  function scrolltoComments() {
    document.querySelector(".commentSection").scrollIntoView({
      behavior: "smooth",
    })
  }
  switch (position) {
    case "articleTop":
      return (
        <div className="flex flex-col md:flex-row justify-between text-sm gap-2 mt-4 mb-2">
          <div className="flex flex-wrap justify-center sm:justifiy-start gap-1">
            <Link
              href={`https://t.me/share/url?text=${title}${slug}&url=${slug}`}
              target="_blank"
              title="telegram ile paylaş"
              onClick={() =>
                sendGTMEvent({ event: "share", value: "telegram" })
              }
              className="flex flex-row items-center text-xs hover:bg-[#0088cc] text-[#0088cc] hover:text-white border border-[#0088cc] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
              passHref
            >
              <FaTelegramPlane className="inline-flex text-base md:mr-2" />
              <span className="hidden md:inline-block font-bold">
                Telegram ile paylaş
              </span>
            </Link>
            <Link
              href={`https://api.whatsapp.com/send?text=${title}${slug}&url=${slug}`}
              target="_blank"
              title="Whatsapp ile paylaş"
              onClick={() =>
                sendGTMEvent({ event: "share", value: "whatsapp" })
              }
              className="flex flex-row items-center text-xs hover:bg-[#075e54] text-[#075e54] hover:text-white border border-[#075e54] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
              passHref
            >
              <FaWhatsapp className="inline-flex text-base md:mr-2" />
              <span className="hidden md:inline-block font-bold">
                Whatsapp ile paylaş
              </span>
            </Link>
            <Link
              href={`https://www.facebook.com/sharer/sharer.php?u=${slug}&quote=${title}`}
              target="_blank"
              title="Facebook ile paylaş"
              onClick={() =>
                sendGTMEvent({ event: "share", value: "facebook" })
              }
              className="flex flex-row items-center text-xs hover:bg-[#4267B2] text-[#4267B2] hover:text-white border border-[#4267B2] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
              passHref
            >
              <FaFacebookF className="inline-flex text-base" />
            </Link>
            <Link
              href={`https://twitter.com/intent/tweet?text=${title}&url=${slug}`}
              target="_blank"
              title="Twitter ile paylaş"
              onClick={() => sendGTMEvent({ event: "share", value: "twitter" })}
              className="flex flex-row items-center text-xs hover:bg-[#000000] text-[#000000] hover:text-white border border-[#000000] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
              passHref
            >
              <FaXTwitter className="inline-flex text-base" />
            </Link>
            <button
              type="button"
              title="Yorumlar"
              onClick={() =>
                sendGTMEvent({ event: "share", value: "comments" })
              }
              className="flex flex-row items-center text-xs bg-[#ff9d00] hover:bg-white hover:text-[#ff9d00] text-white border border-[#ff9d00] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
            >
              <FaComment className="inline-flex text-base mr-2" />
              <span className="font-bold">{countedComment}</span>
            </button>
          </div>
          <div className="flex flex-row justify-center sm:justifiy-start items-center gap-2 text-midgray">
            <span>Abone Ol</span>
            <Link
              href="https://news.google.com/publications/CAAiEATMSmX53ZjtQ4kcyzxQ1_IqFAgKIhAEzEpl-d2Y7UOJHMs8UNfy"
              target="_blank"
              title="Google News'e Abone Ol"
              onClick={() =>
                sendGTMEvent({ event: "share", value: "googlenews" })
              }
              className="flex flex-row items-center text-xs bg-[#DB4437] hover:bg-white hover:text-[#DB4437] text-white border border-[#DB4437] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
              passHref
            >
              <SiGooglenews className="inline-flex text-base mr-1" />
              <span>Google News</span>
            </Link>
          </div>
        </div>
      )
    case "articleBottom":
      return (
        <div className="flex flex-col sm:flex-row justify-between text-sm mt-4 mb-2">
          <div className="flex flex-wrap justify-center sm:justifiy-start gap-1">
            <Link
              href={`https://t.me/share/url?text=${title}${slug}&url=${slug}`}
              target="_blank"
              title="telegram ile paylaş"
              onClick={() =>
                sendGTMEvent({ event: "share", value: "telegram" })
              }
              className="flex flex-row items-center text-xs hover:bg-[#0088cc] text-[#0088cc] hover:text-white border border-[#0088cc] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
              passHref
            >
              <FaTelegramPlane className="inline-flex text-base md:mr-2" />
              <span className="hidden md:inline-block font-bold">
                Telegram ile paylaş
              </span>
            </Link>
            <Link
              href={`https://api.whatsapp.com/send?text=${title}${slug}&url=${slug}`}
              target="_blank"
              title="Whatsapp ile paylaş"
              onClick={() =>
                sendGTMEvent({ event: "share", value: "whatsapp" })
              }
              className="flex flex-row items-center text-xs hover:bg-[#075e54] text-[#075e54] hover:text-white border border-[#075e54] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
              passHref
            >
              <FaWhatsapp className="inline-flex text-base md:mr-2" />
              <span className="hidden md:inline-block font-bold">
                Whatsapp ile paylaş
              </span>
            </Link>
            <Link
              href={`https://www.facebook.com/sharer/sharer.php?u=${slug}&quote=${title}`}
              target="_blank"
              title="Facebook ile paylaş"
              onClick={() =>
                sendGTMEvent({ event: "share", value: "facebook" })
              }
              className="flex flex-row items-center text-xs hover:bg-[#4267B2] text-[#4267B2] hover:text-white border border-[#4267B2] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
              passHref
            >
              <FaFacebookF className="inline-flex text-base" />
            </Link>
            <Link
              href={`https://twitter.com/intent/tweet?text=${title}&url=${slug}`}
              target="_blank"
              title="Twitter ile paylaş"
              onClick={() => sendGTMEvent({ event: "share", value: "twitter" })}
              className="flex flex-row items-center text-xs hover:bg-[#000000] text-[#000000] hover:text-white border border-[#000000] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
              passHref
            >
              <FaXTwitter className="inline-flex text-base" />
            </Link>
            <button
              type="button"
              title="Yorumlar"
              onClick={() =>
                sendGTMEvent({ event: "share", value: "comments" })
              }
              className="flex flex-row items-center text-xs bg-[#ff9d00] hover:bg-white hover:text-[#ff9d00] text-white border border-[#ff9d00] transition duration-150 ease-out hover:ease-in px-2 py-1 rounded"
            >
              <FaComment className="inline-flex text-base mr-2" />
              <span>{countedComment}</span>
            </button>
          </div>
        </div>
      )
    default:
      return "articleTop"
  }
}

export default ArticleDates
