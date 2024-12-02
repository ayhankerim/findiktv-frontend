"use client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/elements/button";
import { NavbarItem } from "./navbar-item";
import { cn } from "@/lib/utils";
import {
  MdMenu,
  MdLogin,
  MdOutlineAccountCircle,
  MdForum,
  MdOutlineSearch,
  MdLibraryBooks,
} from "react-icons/md"
import Link from "next/link";
import { Container } from "../container";
import { Advertisement } from "../advertisements";

type Props = {
  leftNavbarItems: {
    url: string;
    text: string;
    target?: string;
  }[];
  rightNavbarItems: {
    url: string;
    text: string;
    target?: string;
  }[];
  logo: any;
  locale: string;
};

export const DesktopNavbar = ({
  leftNavbarItems,
  rightNavbarItems,
  logo,
  locale,
}: Props) => {
  return (
    <header>
      <Container className="flex flex-row items-center justify-between gap-1 lg:gap-2 py-2 bg-white">
        <div className="flex w-5/12 md:w-4/12 lg:w-3/12 xl:w-2/12">
          <Link title="Ana Sayfa" href="/" className="" passHref>
            <Logo locale={locale} image={logo} priority={true} />
          </Link>
        </div>
        <div className="hidden lg:flex lg:w-6/12">
          <div className="w-full h-[120px]">
            <Advertisement
              position="header-top-desktop"
              adformat="horizontal"
            />
          </div>
        </div>
        <div className="flex justify-end w-7/12 lg:w-auto">
          {rightNavbarItems && (
            <div className="hidden md:block">
              <ul className="flex gap-2">
                <li className="flex items-center transition duration-150 ease-out hover:ease-in hover:bg-dark shadow-sm hover:shadow-2xl hover:shadow-primary text-darkgray hover:text-white border border-darkgray rounded">
                  <Link
                    href="/forum"
                    className="flex flex-col items-center text-center"
                    passHref
                  >
                    <MdForum className="text-lg lg:text-xl xxl:text-xxl m-4" />
                    <span className="inline-flex font-semibold m-2">Forum</span>
                  </Link>
                </li>
                <li className="flex items-center transition duration-150 ease-out hover:ease-in hover:bg-dark shadow-sm hover:shadow-2xl hover:shadow-primary text-darkgray hover:text-white border border-darkgray rounded">
                  <Link
                    href="/rehber"
                    className="flex flex-col items-center text-center"
                    passHref
                  >
                    <MdLibraryBooks className="text-lg lg:text-xl xxl:text-xxl m-4" />
                    <span className="inline-flex font-semibold m-2">
                      Rehber
                    </span>
                  </Link>
                </li>
                {/* <li className="flex items-center">
                  {session ? (
                    <div className="flex flex-col gap-1">
                      <Link
                        onClick={signOut({ callbackUrl: 'http://localhost:3000/foo' })}
                        href="#"
                        className="flex items-center justify-center p-2 transition duration-150 ease-out hover:ease-in hover:bg-warning shadow-sm hover:shadow-2xl hover:shadow-dark text-xs text-center text-warning hover:text-white border border-warning rounded"
                        passHref
                      >
                        <span className="inline-flex font-semibold">
                          Çıkış Yap
                        </span>
                      </Link>
                      <Link
                        href={`/hesap/profil/${userData.username}`}
                        className="flex flex-col p-2 transition duration-150 ease-out hover:ease-in hover:bg-primary shadow-sm hover:shadow-2xl hover:shadow-dark text-center text-primary hover:text-white items-center border border-primary rounded"
                      >
                        <MdOutlineAccountCircle className="text-xl" />
                        <span className="inline-flex font-semibold">
                          Hesabım
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href="/hesap/giris-yap"
                      className="flex flex-col items-center transition duration-150 ease-out hover:ease-in bg-dark hover:bg-primary shadow-sm hover:shadow-2xl hover:shadow-dark text-center text-white border border-dark hover:border-primary rounded"
                      passHref
                    >
                      <MdLogin className="text-lg lg:text-xl xxl:text-xxl m-4" />
                      <span className="inline-flex font-semibold m-2">
                        Giriş Yap
                      </span>
                    </Link>
                  )}
                </li> */}
              </ul>
            </div>
          )}
        </div>







        <div className="flex flex-row gap-2 items-center">
          <div className="flex items-center gap-1.5">
            {leftNavbarItems.map((item) => (
              <NavbarItem
                href={`/${item.url}` as never}
                key={item.text}
                target={item.target}
              >
                {item.text}
              </NavbarItem>
            ))}
          </div>
        </div>
        <div className="flex space-x-2 items-center">
          {rightNavbarItems.map((item, index) => (
            <Button
              key={item.text}
              variant={
                index === rightNavbarItems.length - 1 ? "primary" : "simple"
              }
              as={Link}
              href={`/${locale}${item.url}`}
            >
              {item.text}
            </Button>
          ))}
        </div>
      </Container>
    </header>
  );
};
