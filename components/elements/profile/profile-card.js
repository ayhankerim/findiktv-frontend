import React, { useState, useEffect, Fragment, useRef } from "react"
import { Popover, Transition } from "@headlessui/react"
import { fetchAPI } from "utils/api"
import Link from "next/link"
import Image from "next/image"
import { getStrapiMedia } from "utils/media"
import { MdFlag, MdClose } from "react-icons/md"
import { FcApproval } from "react-icons/fc"
import { GoCommentDiscussion } from "react-icons/go"
import { CgProfile } from "react-icons/cg"
import { BsDot } from "react-icons/bs"

async function fetcher(...args) {
  const res = await fetch(...args)
  return res.json()
}

const loader = ({ src, width }) => {
  return getStrapiMedia(src)
}

export default function ProfileCard({ children, user }) {
  const [total, setTotal] = useState(0)
  let timeout
  const timeoutDuration = 400

  const buttonRef = useRef(null)
  const [openState, setOpenState] = useState(false)

  const toggleMenu = (open) => {
    setOpenState((openState) => !openState)
    buttonRef?.current?.click()
  }

  const onHover = (open, action) => {
    fetchAPI(`/comments?populate=user&filters[user][id][$eq]=${user.id}`).then(
      (data) => setTotal(data.meta.pagination.total)
    )
    if (
      (!open && !openState && action === "onMouseEnter") ||
      (open && openState && action === "onMouseLeave")
    ) {
      clearTimeout(timeout)
      timeout = setTimeout(() => toggleMenu(open), timeoutDuration)
    }
  }
  const handleClickOutside = (event) => {
    if (buttonRef.current && !buttonRef.current.contains(event.target)) {
      event.stopPropagation()
    }
  }
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  return (
    <>
      <div className="font-bold">
        {user.attributes.confirmed === true ? (
          <Popover className="relative">
            {({ open }) => (
              <div
                //onMouseEnter={() => onHover(open, "onMouseEnter")}
                //onMouseLeave={() => onHover(open, "onMouseLeave")}
                className="flex flex-col"
              >
                <Popover.Button
                  ref={buttonRef}
                  className={`
                ${open ? "" : "text-opacity-90"}
                flex items-center font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                >
                  {children}
                  {open ? (
                    <MdClose className="ml-2 text-midgray" />
                  ) : user.attributes.blocked != true ? (
                    <FcApproval className="ml-2" />
                  ) : (
                    ""
                  )}
                </Popover.Button>
                <Transition
                  show={open}
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute z-10 inline-block text-sm font-light text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 w-80 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600 shadow-lg">
                    <div className="p-3">
                      <div className="flex">
                        <div className="w-full">
                          <p className="mb-1 text-base font-semibold leading-none text-gray-900 dark:text-white">
                            {user.attributes.name && user.attributes.name}{" "}
                            {user.attributes.surname && user.attributes.surname}
                          </p>
                          <p className="flex items-center gap-1 mb-3 text-sm font-normal">
                            {user.attributes.city.data && (
                              <>
                                <span className="not-italic">
                                  {user.attributes.city.data.attributes.title}
                                </span>
                                <BsDot />
                              </>
                            )}
                            <span>
                              {user.attributes.role?.data.attributes.name}
                            </span>
                          </p>
                          <p className="mb-4 text-sm font-light">
                            {user.attributes.about}
                          </p>
                          <p className="flex items-center mb-4 text-sm font-light">
                            <span className="mr-1 font-semibold text-gray-400">
                              <GoCommentDiscussion className="mr-1" />
                            </span>
                            <span>
                              toplam{" "}
                              <strong className="font-semibold">{total}</strong>{" "}
                              yorum ve etkileşim
                            </span>
                          </p>
                          <div className="flex">
                            <Link
                              href={`/hesap/profil/${
                                user.attributes.username
                                  ? user.attributes.username
                                  : user.id
                              }`}
                              passHref
                              rel="nofollow"
                              className="inline-flex items-center justify-center w-full px-5 py-2 mr-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            >
                              <CgProfile className="w-4 h-4 mr-2" />
                              Profile Git
                            </Link>
                            <button
                              className="inline-flex items-center px-2 py-2 text-sm font-medium text-danger bg-white border border-gray-200 rounded-lg shrink-0 focus:outline-none hover:bg-danger hover:text-white focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                              type="button"
                            >
                              <MdFlag className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div data-popper-arrow></div>
                  </Popover.Panel>
                </Transition>
              </div>
            )}
          </Popover>
        ) : user.attributes.name ? (
          user.attributes.name + " " + user.attributes.surname
        ) : (
          "Ziyaretçi"
        )}
      </div>
    </>
  )
}
