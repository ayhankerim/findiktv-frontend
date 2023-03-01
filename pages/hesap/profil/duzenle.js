import { Menu, Transition } from "@headlessui/react"
import { Fragment, useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import ErrorPage from "next/error"
import { useSession } from "next-auth/react"
import { getUserData, getAdsData, fetchAPI, getGlobalData } from "@/utils/api"
import Link from "next/link"
import Image from "next/image"
import Layout from "@/components/layout"
import ArticleBlock from "@/components/elements/article/articles-block"
import ArticleSlider from "@/components/elements/article/article-slider"
import Seo from "@/components/elements/seo"
import LatestComments from "@/components/elements/comments/latest-comments"
import ArticleMostVisited from "@/components/elements/article/articles-most-visited"
import { FcApproval } from "react-icons/fc"
import { BsChevronDown } from "react-icons/bs"
import { RiEditBoxLine, RiEditBoxFill, RiSeparator } from "react-icons/ri"
import { MdOutlineLocationOn } from "react-icons/md"

const DynamicUsers = ({ userContent, advertisement, global, userContext }) => {
  const { data: session } = useSession()
  const router = useRouter()
  // Check if the required data was provided
  if (!router.isFallback && !userContent) {
    return <ErrorPage statusCode={404} />
  }

  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const metadata = {
    id: 1,
    metaTitle: `${userContent.username} | FINDIK TV`,
    metaDescription: `${userContent.about} | FINDIK TV`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  // Merge default site SEO settings with page specific SEO settings
  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  console.log(userContent)
  return (
    <Layout global={global} pageContext={userContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      {/* Display content sections */}
      {/* <Sections sections={sections} preview={preview} /> */}
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-col items-end justify-between border rounded-xl border-lightgray">
              <div className="relative w-full left-0 top-0 h-[300px] overflow-y-hidden hidden lg:flex flex-col">
                {userContent && (
                  <Image
                    src={
                      "/uploads/birch_branches_spring_14ac9638df.jpg?updated_at=2023-02-23T00:56:25.205Z"
                    }
                    alt={userContent.username}
                    className="absolute inset-0 h-full w-full object-cover rounded-t-xl"
                    priority={true}
                    fill
                  />
                )}
              </div>
              <div className="flex flex-row w-full gap-2">
                <div className="w-full md:w-4/12 relative top-[-100px]">
                  <div className="relative mx-auto w-[200px] h-[200px] overflow-hidden rounded-full transition ease-in-out hover:scale-110 transform-gpu bg-white shadow-lg">
                    {userContent.avatar.data && (
                      <Image
                        src={
                          userContent.avatar.data.attributes.formats.small.url
                        }
                        alt={userContent.avatar.data.attributes.alternativeText}
                        className="absolute inset-0 h-full w-full object-cover rounded-full p-2"
                        priority={true}
                        fill
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col w-full md:w-8/12 gap-2">
                  <div className="flex flex-row items-center justify-between mt-4">
                    <div>
                      <h1 className="font-semibold text-xl text-dark">
                        {userContent.name || userContent.surname ? (
                          <span className="text-xl">
                            {userContent.name} {userContent.surname}{" "}
                            <FcApproval className="inline-block text-base ml-2" />
                          </span>
                        ) : (
                          ""
                        )}
                      </h1>
                      <span className="block text-base text-midgray">
                        @{userContent.username}{" "}
                        <RiSeparator className="inline-block mx-2" />
                        {userContent.role.data.attributes.name}
                      </span>
                    </div>
                    {session && session.id == userContent.id && (
                      <div className="relative text-right">
                        <Menu as="div" className="relative inline-block mr-4">
                          <div>
                            <Menu.Button className="inline-flex w-full justify-center rounded-md px-4 py-2 text-xs font-medium text-secondary border">
                              Yönet
                              <BsChevronDown
                                className="ml-2 -mr-1 h-4 w-4"
                                aria-hidden="true"
                              />
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
                            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="px-1 py-1 ">
                                <Menu.Item>
                                  {({ active }) => (
                                    <a
                                      href="/"
                                      className={`${
                                        active
                                          ? "bg-secondary text-white"
                                          : "text-gray"
                                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                      {active ? (
                                        <RiEditBoxLine
                                          className="mr-2 h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      ) : (
                                        <RiEditBoxFill
                                          className="mr-2 h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      )}
                                      Düzenle
                                    </a>
                                  )}
                                </Menu.Item>
                                {/* <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      className={`${
                                        active
                                          ? "bg-violet-500 text-white"
                                          : "text-gray-900"
                                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                      {active ? (
                                        <RiEditFill
                                          className="mr-2 h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      ) : (
                                        <RiEditFill
                                          className="mr-2 h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      )}
                                      Duplicate
                                    </button>
                                  )}
                                </Menu.Item> */}
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    )}
                  </div>
                  {userContent.city.data && (
                    <p className="text-midgray">
                      <MdOutlineLocationOn className="text-sm inline-block mr-2" />
                      <Link
                        href={`/sehir/${userContent.city.data.attributes.slug}`}
                        className="inline-block text-sm bg-lightgray hover:bg-secondary hover:text-white px-3 py-1 rounded text-center"
                      >
                        {userContent.city.data.attributes.title}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <aside className="sticky top-2 flex-none w-full md:w-[336px] lg:w-[250px] xl:w-[336px]">
            <ArticleMostVisited size={10} slug={null} />
            <LatestComments size={5} position="sidebar" offset={0} />
          </aside>
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticPaths(context) {
  // Get all pages from Strapi
  const users = await context.locales.reduce(
    async (currentUsersPromise, locale) => {
      const currentUsers = await currentUsersPromise
      const localeUsers = await fetchAPI("/users", {
        fields: ["username"],
      })
      console.log("localeUsers", localeUsers)
      return [...currentUsers, ...localeUsers]
    },
    Promise.resolve([])
  )

  const paths = users.map((user) => {
    const { username } = user
    // Decompose the slug that was saved in Strapi
    const usernameArray = !username ? false : username

    return {
      params: { username: usernameArray },
    }
  })

  return { paths, fallback: "blocking" }
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()
  // Fetch pages. Include drafts if preview mode is on
  const userData = await getUserData({
    username: params.username,
  })

  if (userData == null) {
    // Giving the page no props will trigger a 404 page
    return { props: {} }
  }

  // We have the required page data, pass it to the page component
  const { username, name, surname, about, avatar, role, city } =
    userData.attributes

  const userContent = {
    id: userData.id,
    username,
    name,
    surname,
    about,
    avatar,
    role,
    city,
  }

  const userContext = {
    locale,
    locales,
    defaultLocale,
  }

  //const localizedPaths = getLocalizedPaths(productContext)

  return {
    props: {
      userContent: userContent,
      advertisement: advertisement,
      global: globalLocale.data,
      userContext: {
        ...userContext,
      },
    },
    revalidate: 600,
  }
}

export default DynamicUsers
