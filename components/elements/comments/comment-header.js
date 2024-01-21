import React, { Fragment } from "react"
import { useSession } from "next-auth/react"
import { fetchAPI } from "utils/api"
import { useSWRConfig } from "swr"
import { useSelector } from "react-redux"
import ProfileCard from "@/components/elements/profile/profile-card"
import Tooltip from "@/components/elements/tooltip"
import { Menu, Transition } from "@headlessui/react"
import { MdClose, MdOutlineDateRange } from "react-icons/md"
import { AiOutlineDelete } from "react-icons/ai"
import { TbDots } from "react-icons/tb"
import toast from "react-hot-toast"
import Link from "next/link"
import Moment from "moment"
import "moment/locale/tr"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const CommentHeader = ({ comment, slug, address, position = "bottom" }) => {
  const { data: session } = useSession()
  const pointedComment = useSelector((state) => state.comment.pointedComment)
  const { mutate } = useSWRConfig()
  const notify = (type, message) => {
    if (type === "success") {
      toast.success(message)
    } else if (type === "error") {
      toast.error(message)
    }
  }

  async function flagComment(comment) {
    try {
      await fetchAPI(
        `/comments/${comment}`,
        {},
        {
          method: "GET",
        }
      ).then(async (data) => {
        await fetchAPI(
          `/comments/${comment}`,
          {},
          {
            method: "PUT",
            body: JSON.stringify({
              data: {
                flag: data.data.attributes.flag + 1,
              },
            }),
          }
        )
        notify("success", "Şikayetiniz alınmıştır!")
      })
    } catch (error) {
      notify("error", "Şikayetiniz alınırken bir sorunla karşılaşıldı!")
    }
  }
  async function deleteComment(comment) {
    try {
      await fetchAPI(
        `/comments/${comment}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify({
            data: {
              removed: true,
            },
          }),
        }
      ).then(async (data) => {
        mutate(address)
        notify("success", "Yorumunuz kaldırılmıştır!")
      })
    } catch (error) {
      notify("error", "Yorumunuz kaldırılırken bir sorunla karşılaşıldı!")
    }
  }
  return (
    <header className="flex justify-between items-center gap-2 mb-2">
      <div className="flex gap-2">
        <div className="flex-none">
          {comment.attributes.user.data ? (
            <ProfileCard user={comment.attributes.user.data}>
              <cite
                className={classNames(
                  pointedComment === comment.id ? "bg-point/40" : "",
                  "not-italic"
                )}
              >
                {comment.attributes.user.data.attributes.name &&
                  comment.attributes.user.data.attributes.name}{" "}
                {comment.attributes.user.data.attributes.surname &&
                  comment.attributes.user.data.attributes.surname}
              </cite>
            </ProfileCard>
          ) : (
            <span>Ziyaretçi</span>
          )}
        </div>
      </div>
      <div className="flex">
        <div
          className="text-midgray"
          title={Moment(comment.attributes.createdAt).format("LLLL")}
        >
          <Tooltip
            orientation="left"
            tooltipText={Moment(comment.attributes.createdAt).format("LLL")}
          >
            <time
              className="flex items-center"
              dateTime={Moment(comment.attributes.createdAt).format("LLLL")}
            >
              {position === "sidebar" ? (
                <>
                  <MdOutlineDateRange className="mr-2 inline-block" />
                  {Moment(comment.attributes.createdAt).format("ll")}
                </>
              ) : (
                <>
                  {Moment(comment.attributes.createdAt).fromNow(true)}
                  <span className="ml-1">önce</span>
                </>
              )}
            </time>
          </Tooltip>
        </div>
        {comment.attributes.approvalStatus != "ignored" && (
          <nav className="flex items-center">
            <Menu as="div" className="relative ml-3">
              {({ open }) => (
                <>
                  <div>
                    <Menu.Button className="flex text-sm text-darkgray hover:text-secondary">
                      <span className="sr-only">Menü aç</span>
                      <span className="flex items-center">
                        {open ? (
                          <MdClose className="text-midgray" />
                        ) : (
                          <TbDots className="text-midgray" />
                        )}
                      </span>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-52 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {session &&
                        session.id === comment.attributes.user.data?.id && (
                          <Menu.Item>
                            <button
                              onClick={() => {
                                deleteComment(comment.id)
                              }}
                              className="block w-full text-left hover:bg-lightgray px-4 py-2 text-sm text-danger"
                            >
                              <AiOutlineDelete className="inline-block align-text-bottom mr-2" />{" "}
                              Kaldır
                            </button>
                          </Menu.Item>
                        )}
                      <Menu.Item>
                        <Link
                          href={`https://api.whatsapp.com/send?text=Şu%20yoruma%20bir%20bak%20${slug}comment-${comment.id}&url=${slug}comment-${comment.id}`}
                          className="block w-full text-left hover:bg-lightgray px-4 py-2 text-sm text-midgray"
                          target="_blank"
                          rel="nofollow"
                        >
                          Facebook`ta paylaş
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={() => {
                            notify("success", "Yorum bağlantısı kopyalandı!")
                            navigator.clipboard.writeText(
                              `${slug}#comment-${comment.id}`
                            )
                          }}
                          className="block w-full text-left hover:bg-lightgray px-4 py-2 text-sm text-midgray"
                        >
                          Yorum bağlantısını kopyala
                        </button>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={() => {
                            flagComment(comment.id)
                          }}
                          className="block w-full text-left hover:bg-lightgray px-4 py-2 text-sm text-warning"
                        >
                          Şikayet et
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>
          </nav>
        )}
      </div>
    </header>
  )
}

export default CommentHeader
