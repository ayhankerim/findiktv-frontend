import PropTypes from "prop-types"
import { signOut, useSession } from "next-auth/react"
import { useSelector } from "react-redux"
import { mediaPropTypes, linkPropTypes, buttonLinkPropTypes } from "utils/types"
import { useLockBodyScroll } from "utils/hooks"
import { getButtonAppearance } from "utils/button"
import ButtonLink from "./button-link"
import Link from "next/link"
import NextImage from "./image"
import classNames from "classnames"
import CustomLink from "./custom-link"
import {
  MdClose,
  MdChevronRight,
  MdLogin,
  MdOutlineAccountCircle,
  MdForum,
  MdLibraryBooks,
} from "react-icons/md"
import { FiYoutube } from "react-icons/fi"

const MobileNavMenu = ({ navbar, closeSelf }) => {
  // Prevent window scroll while mobile nav menu is open
  const { data: session } = useSession()
  const userData = useSelector((state) => state.user.userData)
  useLockBodyScroll()

  return (
    <div className="w-screen h-screen fixed top-0 left-0 overflow-y-scroll bg-white z-[21] py-6">
      <div className="container h-full flex flex-col justify-start gap-10">
        {/* Top section */}
        <div className="flex flex-row justify-between my-2 items-center">
          {/* Company logo */}
          <NextImage width="180" height="50" media={navbar.logo} />
          {/* Close button */}
          <button onClick={closeSelf} className="py-1 px-1">
            <MdClose className="h-8 w-auto" />
          </button>
        </div>

        <ul className="grid grid-cols-3 gap-2">
          <li className="flex items-center transition duration-150 ease-out hover:ease-in hover:bg-dark shadow-sm hover:shadow-2xl hover:shadow-primary text-darkgray hover:text-white border border-darkgray rounded">
            <Link
              href="/forum"
              className="flex flex-col w-full items-center text-center"
              passHref
            >
              <MdForum className="text-xxl m-4" />
              <span className="inline-flex font-semibold m-2">Forum</span>
            </Link>
          </li>
          <li className="flex items-center transition duration-150 ease-out hover:ease-in hover:bg-dark shadow-sm hover:shadow-2xl hover:shadow-primary text-darkgray hover:text-white border border-darkgray rounded">
            <Link
              href="/rehber"
              className="flex flex-col w-full items-center text-center"
              passHref
            >
              <MdLibraryBooks className="text-xxl m-4" />
              <span className="inline-flex font-semibold m-2">Rehber</span>
            </Link>
          </li>
          <li className="flex items-center">
            {session ? (
              <div className="flex w-full flex-col gap-1">
                <Link
                  onClick={signOut}
                  href="#"
                  className="flex w-full items-center justify-center p-2 transition duration-150 ease-out hover:ease-in hover:bg-warning shadow-sm hover:shadow-2xl hover:shadow-dark text-center text-warning hover:text-white border border-warning rounded"
                  passHref
                >
                  <span className="inline-flex font-semibold">Çıkış Yap</span>
                </Link>
                <Link
                  href={`/hesap/profil/${userData.username}`}
                  className="flex w-full flex-col p-2 transition duration-150 ease-out hover:ease-in hover:bg-primary shadow-sm hover:shadow-2xl hover:shadow-dark text-center text-primary hover:text-white items-center border border-primary rounded"
                >
                  <MdOutlineAccountCircle className="text-xl" />
                  <span className="inline-flex font-semibold">Hesabım</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/hesap/giris-yap"
                className="flex flex-col w-full items-center transition duration-150 ease-out hover:ease-in hover:bg-primary shadow-sm hover:shadow-2xl hover:shadow-dark text-center text-primary hover:text-white border border-primary rounded"
                passHref
              >
                <MdLogin className="text-xxl m-4" />
                <span className="inline-flex font-semibold m-2">Giriş Yap</span>
              </Link>
            )}
          </li>
        </ul>
        {/* Bottom section */}
        <div className="flex flex-col justify-end w-full mx-auto">
          <ul className="flex flex-col list-none gap-2 items-baseline text-xl">
            {navbar.links.map((navLink) => (
              <li key={navLink.id} className="block w-full">
                <CustomLink link={navLink}>
                  <div
                    className={classNames(
                      navLink.marked === true
                        ? "bg-lightgray border-t border-b border-t-secondary border-b-secondary"
                        : "",
                      "hover:text-gray-900 flex flex-row justify-between items-center"
                    )}
                  >
                    <span>{navLink.text}</span>
                    <MdChevronRight className="h-8 w-auto" />
                  </div>
                </CustomLink>
              </li>
            ))}
          </ul>
        </div>
        {/* <ButtonLink
          button={navbar.button}
          appearance={getButtonAppearance(navbar.button.type, "light")}
        /> */}
      </div>
    </div>
  )
}

MobileNavMenu.propTypes = {
  navbar: PropTypes.shape({
    logo: mediaPropTypes,
    links: PropTypes.arrayOf(linkPropTypes),
    button: buttonLinkPropTypes,
  }),
  closeSelf: PropTypes.func,
}

export default MobileNavMenu
