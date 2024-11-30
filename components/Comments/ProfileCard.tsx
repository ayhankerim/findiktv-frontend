"use client";
import React, { Fragment } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Popover, Transition } from "@headlessui/react";
import { MdClose, MdFlag } from "react-icons/md";
import { FcApproval } from "react-icons/fc";
import { BsDot } from "react-icons/bs";
import { GoCommentDiscussion } from "react-icons/go";
import { CgProfile } from "react-icons/cg";
import { CommentsProp } from "@/utils/model";

const UserInteractions = dynamic(() => import("./UserInteractions"), {
  loading: () => <span>...</span>,
  ssr: false,
});
interface ProfileCardProp {
  comment: CommentsProp;
  children: React.ReactNode;
}
const ProfileCard = async ({ comment, children }: ProfileCardProp) => {
  const { data: user } = comment.user;
  return (
    <div className="font-bold">
      {user.confirmed === true ? (
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button
                className={`${open ? "text-dark" : "text-dark/90"}
              flex items-center font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
              >
                {children}
                {open ? (
                  <MdClose className="ml-2 text-midgray" />
                ) : user.blocked != true ? (
                  <FcApproval className="ml-2" />
                ) : (
                  ""
                )}
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute z-10 inline-block text-sm font-light text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-s w-80 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600 shadow-lg">
                  <div className="p-3">
                    <div className="flex">
                      <div className="w-full">
                        <p className="mb-1 text-base font-semibold leading-none text-gray-900 dark:text-white">
                          {user.name && user.name}{" "}
                          {user.surname && user.surname}
                        </p>
                        <p className="flex items-center gap-1 mb-3 text-sm font-normal">
                          {user.city.data && (
                            <>
                              <span className="not-italic">
                                {user.city.data.title}
                              </span>
                              <BsDot />
                            </>
                          )}
                          <span>{user.role?.data.name}</span>
                        </p>
                        <p className="mb-4 text-sm font-light">{user.about}</p>
                        <div className="flex items-center mb-4 text-sm font-light">
                          <span className="mr-1 font-semibold text-gray-400">
                            <GoCommentDiscussion className="mr-1" />
                          </span>
                          <div>
                            toplam{" "}
                            <strong className="font-semibold">
                              {open && <UserInteractions user={user.id} />}
                            </strong>{" "}
                            yorum ve etkileşim
                          </div>
                        </div>
                        <div className="flex">
                          <Link
                            href={`/hesap/profil/${
                              user.username ? user.username : comment.id
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
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      ) : user.name ? (
        user.name + " " + user.surname
      ) : (
        "Ziyaretçi"
      )}
    </div>
  );
};

export default ProfileCard;
