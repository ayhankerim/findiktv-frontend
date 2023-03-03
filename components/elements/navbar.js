import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/router"
import { signOut, useSession } from "next-auth/react"
import { useSelector, useDispatch } from "react-redux"
import { updateUser } from "@/store/user"
import { getButtonAppearance } from "utils/button"
import { mediaPropTypes, linkPropTypes, buttonLinkPropTypes } from "utils/types"
import {
  MdMenu,
  MdLogin,
  MdOutlineAccountCircle,
  MdForum,
  MdOutlineSearch,
  MdLibraryBooks,
} from "react-icons/md"
import MobileNavMenu from "./mobile-nav-menu"
import ButtonLink from "./button-link"
import NextImage from "./image"
import Image from "next/image"
import CustomLink from "./custom-link"
import LocaleSwitch from "../locale-switch"
import Advertisement from "@/components/elements/advertisement"

const Navbar = ({ navbar, pageContext }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState([])
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user.userData)
  const [mobileMenuIsShown, setMobileMenuIsShown] = useState(false)

  useEffect(() => {
    if (session === null) {
      dispatch(updateUser({}))
      return
    }
    userData &&
      Object.entries(userData).length === 0 &&
      (async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/users/me?populate=avatar,city`,
            {
              headers: {
                Authorization: `Bearer ${session.jwt}`,
              },
            }
          )
          dispatch(updateUser(response.data))
        } catch (error) {
          setError(error.message)
        } finally {
          setLoaded(true)
        }
      })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, session])
  return (
    <>
      {/* The actual navbar */}
      <header>
        <div className="container flex flex-row items-center justify-between gap-1 lg:gap-2 py-2 bg-white">
          {/* Content aligned to the left */}
          <div className="flex w-5/12 md:w-4/12 lg:w-3/12 xl:w-2/12">
            <Link href="/" className="" passHref>
              <NextImage
                width={navbar.logo.data.attributes.width}
                height={navbar.logo.data.attributes.height}
                media={navbar.logo}
              />
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
            {/* Hamburger menu on mobile */}
            <button
              onClick={() => setMobileMenuIsShown(true)}
              className="p-1 block md:hidden"
            >
              <MdMenu className="h-8 w-auto" />
            </button>
            {/* CTA button on desktop */}
            {navbar.button && (
              <div className="hidden md:block">
                <ul className="flex gap-2">
                  <li className="flex items-center transition duration-150 ease-out hover:ease-in hover:bg-dark shadow-sm hover:shadow-2xl hover:shadow-primary text-darkgray hover:text-white border border-darkgray rounded">
                    <Link
                      href="/urunler"
                      className="flex flex-col items-center text-center"
                      passHref
                    >
                      <MdForum className="text-lg lg:text-xl xxl:text-xxl m-4" />
                      <span className="inline-flex font-semibold m-2">
                        Forum
                      </span>
                    </Link>
                  </li>
                  <li className="flex items-center transition duration-150 ease-out hover:ease-in hover:bg-dark shadow-sm hover:shadow-2xl hover:shadow-primary text-darkgray hover:text-white border border-darkgray rounded">
                    <Link
                      href="/giris-yap"
                      className="flex flex-col items-center text-center"
                      passHref
                    >
                      <MdLibraryBooks className="text-lg lg:text-xl xxl:text-xxl m-4" />
                      <span className="inline-flex font-semibold m-2">
                        Rehber
                      </span>
                    </Link>
                  </li>
                  <li className="flex items-center">
                    {session ? (
                      <div className="flex flex-col gap-1">
                        <Link
                          onClick={signOut}
                          href="#"
                          className="flex items-center justify-center p-2 transition duration-150 ease-out hover:ease-in hover:bg-danger shadow-sm hover:shadow-2xl hover:shadow-dark text-xs text-center text-danger hover:text-white border border-danger rounded"
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
                        className="flex flex-col items-center transition duration-150 ease-out hover:ease-in hover:bg-primary shadow-sm hover:shadow-2xl hover:shadow-dark text-center text-primary hover:text-white border border-primary rounded"
                        passHref
                      >
                        <MdLogin className="text-lg lg:text-xl xxl:text-xxl m-4" />
                        <span className="inline-flex font-semibold m-2">
                          Giriş Yap
                        </span>
                      </Link>
                    )}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <nav className="container flex flex-row items-center justify-between border-b-2 border-gray bg-white">
          {/* Content aligned to the left */}
          <div className="flex flex-row items-center relative bottom-[-2px]">
            {/* List of links on desktop */}
            <ul className="hidden list-none md:flex flex-row gap-2 xl:gap-4 items-baseline">
              {navbar.links.map((navLink) => (
                <li
                  className="border-b-2 border-transparent hover:border-b-2 hover:border-b-secondary hover:bg-lightgray transition duration-150 ease-out md:ease-in"
                  key={navLink.id}
                >
                  <CustomLink link={navLink} locale={router.locale}>
                    <div className="text-base font-bold hover:text-secondary px-2 py-1">
                      {navLink.text}
                    </div>
                  </CustomLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-row items-center relative bottom-[-2px]">
            <ul className="hidden list-none md:flex flex-row gap-2 lg:gap-4 items-baseline">
              <li className="border-b-2 border-transparent">
                <Link title="Ara" href="#" passHref>
                  <div className="text-xl font-bold hover:text-secondary px-2 py-1">
                    <MdOutlineSearch />
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="container flex flex-row items-center justify-center gap-2 py-2">
          <div className="w-full h-[300px] -mx-4 sm:mx-0">
            <Advertisement position="masthead" />
          </div>
        </div>
      </header>

      {/* Mobile navigation menu panel */}
      {mobileMenuIsShown && (
        <MobileNavMenu
          navbar={navbar}
          closeSelf={() => setMobileMenuIsShown(false)}
        />
      )}
    </>
  )
}

Navbar.propTypes = {
  navbar: PropTypes.shape({
    logo: PropTypes.shape({
      image: mediaPropTypes,
      url: PropTypes.string,
    }),
    links: PropTypes.arrayOf(linkPropTypes),
    button: buttonLinkPropTypes,
  }),
  initialLocale: PropTypes.string,
}

export default Navbar
