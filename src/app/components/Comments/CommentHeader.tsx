"use client";
import React, { Fragment } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import {
  MdComment,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";

interface Session {
  user: {
    data: {
      username: string;
      name: string;
      surname: string;
      email: string;
    };
  };
  expires: string;
  id: number;
  jwt: string;
}
const CommentHeader = () => {
  const { data } = useSession();
  const session = data as Session | null;
  return (
    <div className="flex flex-col md:flex-row text-center md:text-left items-center justify-between border-b relative">
      <h3 className="font-semibold text-base text-midgray">
        YORUM YAZIN!{" "}
        {session ? (
          ""
        ) : (
          <span className="block lg:inline-block">
            (Üye olmadan da yorum yazabilirsiniz)
          </span>
        )}
      </h3>
      <div className="inline-flex gap-2">
        {session ? (
          <Menu as="div" className="relative ml-3">
            {({ open }) => (
              <>
                <div>
                  <Menu.Button className="flex text-sm text-darkgray hover:text-secondary">
                    <span className="sr-only">Menü aç</span>
                    <span className="flex items-center">
                      {session.user.data.name || session.user.data.surname
                        ? session.user.data.name +
                          " " +
                          session.user.data.surname
                        : session.user.data.email}
                      {open ? (
                        <MdKeyboardArrowUp className="ml-1" />
                      ) : (
                        <MdKeyboardArrowDown className="ml-1" />
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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href={`/hesap/profil/${
                            session.user.data.username
                              ? session.user.data.username
                              : session.id
                          }`}
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block w-full text-left px-4 py-2 text-sm text-midgray"
                          )}
                        >
                          Profilim
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/hesap/ayarlar"
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block w-full text-left px-4 py-2 text-sm text-midgray"
                          )}
                        >
                          Ayarlar
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="#"
                          onClick={() => {
                            signOut();
                          }}
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block w-full text-left px-4 py-2 text-sm text-midgray"
                          )}
                        >
                          Çıkış yap
                        </Link>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
        ) : (
          <div className="flex gap-1">
            <Link className="text-secondary" href="/hesap/kayit-ol">
              Üye Ol
            </Link>
            veya
            <Link className="text-secondary" href="/hesap/giris-yap">
              Giriş Yap
            </Link>
          </div>
        )}
        <MdComment className="text-lg text-midgray" />
      </div>
      <span className="border-secondary/20 bg-secondary/60 absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px]"></span>
    </div>
  );
};

export default CommentHeader;
