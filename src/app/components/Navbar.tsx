"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Dialog } from "@headlessui/react";
import classNames from "classnames";
import Logo from "./Logo";
import Advertisement from "@/app/components/Advertisement";
import Linker from "./Linker";
import {
  MdMenu,
  MdLogin,
  MdOutlineAccountCircle,
  MdForum,
  MdOutlineSearch,
  MdLibraryBooks,
  MdStoreMallDirectory,
  MdStar,
  MdClose,
  MdChevronRight,
} from "react-icons/md";
interface MainNavLink {
  id: number;
  url: string;
  newTab: boolean;
  text: string;
  marked: boolean;
}
interface NavButton {
  url: string;
  newTab: boolean;
  text: string;
  type: string;
}
interface Session {
  user: {
    data: {
      username: string;
    };
  };
  expires: string;
  id: number;
  jwt: string;
}
interface MobileNavLinkProps {
  navLink: MainNavLink;
  closeMenu: () => void;
}
interface SpecialButtonsProps {
  button: Array<NavButton>;
  closeMenu: () => void;
}
const CssClass = "text-xxl md:text-xl xxl:text-xxl m-4";

function MobileNavLink({ navLink, closeMenu }: MobileNavLinkProps) {
  const path = usePathname();
  const handleClick = () => {
    closeMenu();
  };
  return (
    <li className="block w-full" onClick={handleClick}>
      <Linker link={navLink}>
        <div
          className={classNames(
            navLink.marked === true &&
              "bg-lightgray border-t border-b border-t-secondary border-b-secondary",
            navLink.url === path && "text-primary",
            "hover:text-gray-900 flex flex-row justify-between items-center"
          )}
        >
          <span>{navLink.text}</span>
          <MdChevronRight className="h-8 w-auto" />
        </div>
      </Linker>
    </li>
  );
}

function MenuIcon({ url }: NavButton) {
  switch (url) {
    case "/firma/rehberi":
      return <MdStoreMallDirectory className={CssClass} />;
    case "/uretici/rehberi":
      return <MdLibraryBooks className={CssClass} />;
    case "/forum":
      return <MdForum className={CssClass} />;
    default:
      return <MdStar className={CssClass} />;
  }
}
const SpecialButtons = ({ button, closeMenu }: SpecialButtonsProps) => {
  const { data } = useSession();
  const session = data as Session;
  const handleClick = () => {
    closeMenu();
  };
  return (
    <ul className="flex gap-2">
      {button.map((item, i) => (
        <li
          key={i}
          className={`flex w-1/${
            button.length + 1
          } md:max-w-[80px] items-center transition duration-150 ease-out hover:ease-in hover:bg-dark shadow-sm hover:shadow-2xl hover:shadow-primary text-darkgray hover:text-white border border-darkgray rounded`}
        >
          <Link
            href={item.url}
            target={item.newTab ? "_blank" : "_self"}
            className="flex flex-col h-full items-center text-center"
            passHref
            onClick={handleClick}
          >
            <MenuIcon {...item} />
            <span className="inline-flex font-semibold m-2">{item.text}</span>
          </Link>
        </li>
      ))}
      <li
        className={`flex w-1/${button.length + 1} md:max-w-[80px] items-center`}
      >
        {session ? (
          <div className="flex flex-col gap-1">
            <Link
              onClick={(e) => {
                e.preventDefault();
                handleClick;
                signOut();
              }}
              href="#"
              className="flex items-center justify-center p-2 transition duration-150 ease-out hover:ease-in hover:bg-warning shadow-sm hover:shadow-2xl hover:shadow-dark text-xs text-center text-warning hover:text-white border border-warning rounded"
              passHref
            >
              <span className="inline-flex font-semibold">Çıkış Yap</span>
            </Link>
            <Link
              href={`/hesap/profil/${session.user.data.username}`}
              onClick={handleClick}
              className="flex flex-col p-2 transition duration-150 ease-out hover:ease-in hover:bg-primary shadow-sm hover:shadow-2xl hover:shadow-dark text-center text-primary hover:text-white items-center border border-primary rounded"
            >
              <MdOutlineAccountCircle className="text-xl" />
              <span className="inline-flex font-semibold">Hesabım</span>
            </Link>
          </div>
        ) : (
          <Link
            href="/hesap/giris-yap"
            onClick={handleClick}
            className="flex flex-col h-full w-full items-center transition duration-150 ease-out hover:ease-in bg-dark hover:bg-primary shadow-sm hover:shadow-2xl hover:shadow-dark text-center text-white border border-dark hover:border-primary rounded"
            passHref
          >
            <MdLogin className={CssClass} />
            <span className="inline-flex font-semibold m-2">
              Kullanıcı Girişi
            </span>
          </Link>
        )}
      </li>
    </ul>
  );
};
const TopBar = ({
  logoUrl,
  button,
  setMobileMenuOpen,
}: {
  setMobileMenuOpen: any;
  logoUrl: string | null;
  button: Array<NavButton>;
}) => {
  const closeMenu = () => {
    setMobileMenuOpen(false);
  };
  return (
    <div className="container flex flex-row items-center justify-between gap-1 lg:gap-2 py-2 bg-white">
      <div className="flex w-5/12 md:w-4/12 lg:w-3/12 xl:w-2/12">
        <Logo src={logoUrl} />
      </div>
      <div className="hidden lg:flex lg:w-6/12">
        <div className="w-full h-[120px]">
          <Advertisement position="header-top-desktop" adformat="horizontal" />
        </div>
      </div>
      <div className="flex justify-end w-7/12 lg:w-auto">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-1 block md:hidden"
          aria-label="Mobile Hamburger Menu"
        >
          <MdMenu className="h-8 w-auto" />
        </button>
        <div className="hidden md:block">
          {button && <SpecialButtons button={button} closeMenu={closeMenu} />}
        </div>
      </div>
    </div>
  );
};
const MenuBar = ({ menuLinks }: { menuLinks: Array<MainNavLink> }) => {
  const path = usePathname();
  return (
    <nav className="container flex flex-row items-center justify-between border-b-2 border-gray gap-4 bg-white">
      <div className="flex flex-row w-full items-center relative bottom-[-2px]">
        <ul className="hidden list-none w-full md:flex flex-row justify-between gap-2 xl:gap-4 items-center">
          {menuLinks.map((navLink) => (
            <li
              className={classNames(
                navLink.marked
                  ? "bg-secondary border-b-dark hover:border-b-danger hover:bg-danger"
                  : "hover:border-b-secondary hover:bg-lightgray",
                navLink.url === path && "border-b-secondary text-secondary",
                "border-b-2 border-transparent hover:border-b-2 transition duration-150 ease-out md:ease-in"
              )}
              key={navLink.id}
            >
              <Linker link={navLink}>
                <div
                  className={classNames(
                    navLink.marked
                      ? "bg-secondary text-white hover:bg-danger"
                      : "hover:text-secondary",
                    "text-base font-bold px-2 py-1"
                  )}
                >
                  {navLink.text}
                </div>
              </Linker>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-row items-center relative bottom-[-2px]">
        <ul className="hidden list-none md:flex flex-row gap-2 lg:gap-4 items-baseline">
          <li className="border-b-2 border-transparent">
            <Link title="Ara" href="/arac/arama">
              <div className="text-xl font-bold hover:text-secondary px-2 py-1">
                <MdOutlineSearch />
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
const AddSpace = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);
  return (
    <div className="container flex flex-row items-center justify-center gap-2 py-2">
      {isMobile ? (
        <div className="w-full h-[100px] -mx-2 sm:mx-0">
          <Advertisement position="masthead-mobile" adformat={""} />
        </div>
      ) : (
        <div className="w-full h-[300px] -mx-2 sm:mx-0">
          <Advertisement position="masthead" adformat={""} />
        </div>
      )}
    </div>
  );
};

export default function Navbar({
  links,
  logoUrl,
  button,
}: {
  links: Array<MainNavLink>;
  logoUrl: string | null;
  button: Array<NavButton>;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => {
    setMobileMenuOpen(false);
  };
  return (
    <header>
      <TopBar
        logoUrl={logoUrl}
        button={button}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MenuBar menuLinks={links} />
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75" />
        <Dialog.Panel className="fixed inset-y-0 rtl:left-0 ltr:right-0 z-50 w-full overflow-y-auto px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-inset sm:ring-white/10 bg-white">
          <div className="w-screen h-screen fixed top-0 left-0 bg-white z-[21] py-6">
            <div className="container h-[calc(100%-4rem)] flex flex-col justify-start gap-4">
              <div className="grow-0 flex flex-row justify-between my-2 items-center">
                <Logo src={logoUrl} />
                <button onClick={closeMenu} className="py-1 px-1">
                  <MdClose className="h-8 w-auto" />
                </button>
              </div>
              {button && (
                <SpecialButtons button={button} closeMenu={closeMenu} />
              )}
              <ul className="grow flex flex-col list-none gap-2 items-baseline text-xl overflow-y-scroll">
                {links.map((item) => (
                  <MobileNavLink
                    key={item.id}
                    closeMenu={closeMenu}
                    navLink={item}
                  />
                ))}
              </ul>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
      <AddSpace />
    </header>
  );
}
