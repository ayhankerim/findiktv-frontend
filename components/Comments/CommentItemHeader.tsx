"use client";
import React, { Fragment } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import toast, { Toaster } from "react-hot-toast";
import Moment from "moment";
import "moment/locale/tr";
import Tooltip from "../Tooltip";
import ProfileCard from "./ProfileCard";
import { TbDots } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import { MdClose, MdOutlineDateRange, MdCalendarMonth } from "react-icons/md";
import { fetchAPI } from "@/utils/fetch-api";
import { CommentsProp, Session } from "@/utils/model";

const notify = (type: string, message: string) => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  }
};

const flagComment = (comment: number, flag: number) => {
  try {
    fetchAPI(
      `/comments/${comment}`,
      {
        fields: ["flag"],
      },
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    ).then((data) => {
      try {
        fetchAPI(
          `/comments/${comment}`,
          {},
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                flag: data.data.flag + 1,
              },
            }),
          }
        ).then((result) => {
          notify("success", "Şikayetiniz alınmıştır!");
        });
      } catch (error) {
        console.log(error);
        notify("error", "Şikayetiniz alınırken bir sorunla karşılaşıldı!");
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const deleteComment = (comment: number) => {
  try {
    fetchAPI(
      `/comments/${comment}`,
      {
        fields: ["id"],
      },
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            removed: true,
          },
        }),
      }
    ).then((result) => {
      notify("success", "Yorumunuz kaldırılmıştır!");
    });
  } catch (error) {
    notify("error", "Yorumunuz kaldırılırken bir sorunla karşılaşıldı!");
  }
};

const CommentItemHeader: React.FC<
  CommentsProp & { slug: string; position: string }
> = (comment: CommentsProp & { slug: string; position: string }) => {
  const { data } = useSession();
  const session = data as Session | null;
  const { reply_to, user } = comment;
  //const { user } = userData.data;
  return (
    <header className="flex flex-col">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2">
          <div className="flex-none">
            {user ? (
              <ProfileCard comment={comment}>
                <cite className="not-italic">
                  {user.data.name && user.data.name}{" "}
                  {user.data.surname && user.data.surname}
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
            title={Moment(comment.createdAt).format("LLLL")}
          >
            <Tooltip
              orientation="left"
              tooltipText={Moment(comment.createdAt).format("LLL")}
            >
              <time
                className="flex items-center"
                dateTime={Moment(comment.createdAt).format("LLLL")}
              >
                {comment.position === "sidebar" ? (
                  <>
                    <MdOutlineDateRange className="mr-2 inline-block" />
                    {Moment(comment.createdAt).format("ll")}
                  </>
                ) : (
                  <>
                    {Moment(comment.createdAt).fromNow(true)}
                    <span className="ml-1">önce</span>
                    <MdCalendarMonth className="ml-2 inline-block" />
                  </>
                )}
              </time>
            </Tooltip>
          </div>
          {comment.approvalStatus != "ignored" && (
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
                        {session && session.id === comment.user.data?.id && (
                          <Menu.Item>
                            <button
                              onClick={() => {
                                deleteComment(comment.id);
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
                            href={`https://api.whatsapp.com/send?text=Şu%20yoruma%20bir%20bak%20${comment.slug}?comment=${comment.id}&url=${comment.slug}?comment=${comment.id}`}
                            className="block w-full text-left hover:bg-lightgray px-4 py-2 text-sm text-midgray"
                            target="_blank"
                            rel="nofollow"
                          >
                            Whatsapp`ta paylaş
                          </Link>
                        </Menu.Item>
                        <Menu.Item>
                          <button
                            onClick={() => {
                              notify("success", "Yorum bağlantısı kopyalandı!");
                              navigator.clipboard.writeText(
                                `${comment.slug}?comment=${comment.id}`
                              );
                            }}
                            className="block w-full text-left hover:bg-lightgray px-4 py-2 text-sm text-midgray"
                          >
                            Yorum bağlantısını kopyala
                          </button>
                        </Menu.Item>
                        <Menu.Item>
                          <button
                            onClick={() => {
                              flagComment(comment.id, comment.flag);
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
      </div>
      {reply_to && (
        <div className="text-midgray">
          <span className="font-medium">
            {reply_to.data.user.data.name + " " || ""}
            {reply_to.data.user.data.surname || ""}
          </span>{" "}
          tarafından yapılan yoruma cevap olarak:
        </div>
      )}
    </header>
  );
};

export default CommentItemHeader;
