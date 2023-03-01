import PropTypes from "prop-types"
import { signOut, useSession } from "next-auth/react"
import { mediaPropTypes, linkPropTypes, buttonLinkPropTypes } from "utils/types"
import { useLockBodyScroll } from "utils/hooks"
import { getButtonAppearance } from "utils/button"
import ButtonLink from "./button-link"
import Link from "next/link"
import NextImage from "./image"
import CustomLink from "./custom-link"
import {
  MdClose,
  MdChevronRight,
  MdLogin,
  MdLogout,
  MdForum,
  MdLibraryBooks,
} from "react-icons/md"
import { FiYoutube } from "react-icons/fi"

const MobileNavMenu = ({ navbar, closeSelf }) => {
  // Prevent window scroll while mobile nav menu is open
  const { data: session } = useSession()
  useLockBodyScroll()

  return (
    <div className="w-screen h-screen fixed top-0 left-0 overflow-y-scroll bg-white z-[21] py-6">
      <div className="container h-full flex flex-col justify-between">
        {/* Top section */}
        <div className="flex flex-row justify-between pb-2 items-center">
          {/* Company logo */}
          <NextImage width="120" height="33" media={navbar.logo} />
          {/* Close button */}
          <button onClick={closeSelf} className="py-1 px-1">
            <MdClose className="h-8 w-auto" />
          </button>
        </div>
        {/* Bottom section */}
        <div className="flex flex-col justify-end w-full mx-auto">
          <ul className="flex flex-col list-none gap-2 items-baseline text-xl mb-10">
            {navbar.links.map((navLink) => (
              <li key={navLink.id} className="block w-full">
                <CustomLink link={navLink}>
                  <div className="hover:text-gray-900 flex flex-row justify-between items-center">
                    <span>{navLink.text}</span>
                    <MdChevronRight className="h-8 w-auto" />
                  </div>
                </CustomLink>
              </li>
            ))}
          </ul>
        </div>

        <ul className="grid grid-cols-3 gap-2">
          <li className="transition duration-150 ease-out hover:ease-in hover:bg-dark shadow-sm hover:shadow-2xl hover:shadow-primary text-darkgray hover:text-white border border-darkgray rounded">
            <Link
              href="/giris-yap"
              className="flex flex-col items-center text-center"
              passHref
            >
              <MdForum className="text-xxl m-4" />
              <span className="inline-flex font-semibold m-2">Forum</span>
            </Link>
          </li>
          <li className="transition duration-150 ease-out hover:ease-in hover:bg-dark shadow-sm hover:shadow-2xl hover:shadow-primary text-darkgray hover:text-white border border-darkgray rounded">
            <Link
              href="/giris-yap"
              className="flex flex-col items-center text-center"
              passHref
            >
              <MdLibraryBooks className="text-xxl m-4" />
              <span className="inline-flex font-semibold m-2">Rehber</span>
            </Link>
          </li>
          <li className="transition duration-150 ease-out hover:ease-in hover:bg-primary shadow-sm hover:shadow-2xl hover:shadow-dark text-center text-primary hover:text-white border border-primary rounded">
            {session ? (
              <Link
                onClick={signOut}
                href="#"
                className="flex flex-col items-center"
                passHref
              >
                <MdLogout className="text-xxl m-4" />
                <span className="inline-flex font-semibold m-2">Çıkış Yap</span>
              </Link>
            ) : (
              <Link
                href="/hesap/giris-yap"
                className="flex flex-col items-center"
                passHref
              >
                <MdLogin className="text-xxl m-4" />
                <span className="inline-flex font-semibold m-2">Giriş Yap</span>
              </Link>
            )}
          </li>
        </ul>
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
