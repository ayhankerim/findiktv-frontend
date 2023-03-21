import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import ErrorPage from "next/error"
import { useSession } from "next-auth/react"
import { getUserData, getAdsData, fetchAPI, getGlobalData } from "@/utils/api"
import Link from "next/link"
import Image from "next/image"
import Layout from "@/components/layout"
import Tooltip from "@/components/elements/tooltip"
import Seo from "@/components/elements/seo"
import LatestComments from "@/components/elements/comments/latest-comments"
import ArticleMostVisited from "@/components/elements/article/articles-most-visited"
import { FcApproval } from "react-icons/fc"
import { Tab } from "@headlessui/react"
import { RiEditBoxLine, RiSeparator } from "react-icons/ri"
import { MdOutlineLocationOn } from "react-icons/md"
import {
  FaTelegramPlane,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa"
import Avatar from "@/components/elements/profile/avatar"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const reactionsList = (reactionData) => {
  let limit = 10
  return (
    <>
      <ul className="flex flex-col gap-2">
        {reactionData.data.slice(0, limit).map((reaction, i) => (
          <li className="leading-[30px]" key={i}>
            <Link
              href={`/haber/${reaction.attributes.article.data.id}/${reaction.attributes.article.data.attributes.slug}`}
              title={reaction.attributes.article.data.attributes.title}
              className="text-secondary hover:underline"
            >
              {reaction.attributes.article.data.attributes.title}
            </Link>{" "}
            isimli içeriğe{" "}
            <Image
              src={
                reaction.attributes.ReactionType.data.attributes.image.data
                  .attributes.url
              }
              alt={reaction.attributes.ReactionType.data.attributes.title}
              width={30}
              height={30}
              className="inline-block"
            />{" "}
            {reaction.attributes.Value > 0
              ? "ifadesi bıraktınız."
              : "şeklinde bıraktığınız ifadeyi kaldırdınız."}
          </li>
        ))}
      </ul>
      {reactionData.data.length > limit && (
        <p className="mt-2 text-midgray">
          Son {limit} etkileşim listelenmiştir.
        </p>
      )}
    </>
  )
}

const commentList = (commentData) => {
  let limit = 10
  return (
    <>
      <ul className="flex flex-col gap-2">
        {commentData.data.slice(0, limit).map((comment, i) => (
          <li className="leading-[30px]" key={i}>
            <Link
              href={
                (comment.attributes.article.data &&
                  `/haber/${comment.attributes.article.data.id}/${comment.attributes.article.data.attributes.slug}`) ||
                (comment.attributes.city.data &&
                  `/urunler/${comment.attributes.product.data.attributes.slug}/${comment.attributes.city.data.attributes.slug}/fiyati`) ||
                (comment.attributes.product.data &&
                  `/urunler/${comment.attributes.product.data.attributes.slug}/fiyatlari`)
              }
              className="text-secondary hover:underline"
            >
              {(comment.attributes.article.data &&
                `${comment.attributes.article.data.attributes.title}`) ||
                (comment.attributes.city.data &&
                  `${comment.attributes.product.data.attributes.title} ${comment.attributes.city.data.attributes.title} fiyatı`) ||
                (comment.attributes.product.data &&
                  `${comment.attributes.product.data.attributes.title} fiyatları`)}
            </Link>{" "}
            isimli içeriğe yorum bıraktınız.
          </li>
        ))}
      </ul>
      {commentData.data.length > limit && (
        <p className="mt-2 text-midgray">Son {limit} yorum listelenmiştir.</p>
      )}
    </>
  )
}

const ProfileCover = (username) => {
  const [defaultImage, setDefaultImage] = useState([])

  useEffect(() => {
    fetchAPI("/profile-images", {
      filters: {
        Default: {
          $eq: true,
        },
        Status: {
          $eq: true,
        },
      },
      fields: ["*"],
      populate: {
        Image: {
          populate: ["*"],
        },
      },
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: 1,
      },
    }).then((data) => {
      setDefaultImage(data)
    })
  }, [])
  return (
    <>
      {defaultImage.data && (
        <Image
          src={defaultImage.data[0].attributes.Image.data.attributes.url}
          alt={username}
          className="absolute inset-0 h-full w-full object-cover rounded-t-xl"
          priority={true}
          fill
        />
      )}
    </>
  )
}

const DynamicUsers = ({ userContent, advertisement, global, userContext }) => {
  const { data: session } = useSession()
  const [tabs] = useState([
    {
      id: 1,
      title: "Hakkımda",
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: userContent.about
              ? userContent.about
              : "Henüz bir içerik girilmemiş.",
          }}
        />
      ),
    },
    {
      id: 2,
      title: "Etkileşimler",
      content:
        userContent.reactions.data.length > 0 ? (
          reactionsList(userContent.reactions)
        ) : (
          <p>Etkileşime girilmiş bir içerik bulunmamaktadır.</p>
        ),
    },
    {
      id: 3,
      title: "Yorumlar",
      content:
        userContent.comments.data.length > 0 ? (
          commentList(userContent.comments)
        ) : (
          <p>Etkileşime girilmiş bir içerik bulunmamaktadır.</p>
        ),
    },
  ])
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
  //console.log(userContent)
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
              <div className="relative w-full left-0 top-0 h-[200px] sm:h-[300px] overflow-y-hidden lg:flex flex-col">
                {userContent.profile_cover.data ? (
                  <Image
                    src={
                      userContent.profile_cover.data.attributes.Image.data
                        .attributes.formats.large.url
                    }
                    alt={userContent.username}
                    className="absolute inset-0 h-full w-full object-cover rounded-t-xl"
                    priority={true}
                    fill
                  />
                ) : (
                  <ProfileCover username={userContent.username} />
                )}
              </div>
              <div className="flex flex-col sm:flex-row w-full gap-2 p-4">
                <div className="w-full md:w-4/12 relative top-[-100px] mb-[-80px] sm:mb-0">
                  <div className="relative mx-auto w-[200px] h-[200px] overflow-hidden rounded-full transition ease-in-out hover:scale-110 transform-gpu bg-white shadow-lg">
                    <Avatar
                      username={userContent.username}
                      avatar={
                        userContent.avatar.data?.attributes.formats.small.url
                      }
                      systemavatar={
                        userContent.SystemAvatar.data?.attributes.image.data
                          .attributes.url
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col w-full md:w-8/12 gap-2">
                  <div className="flex flex-row items-center justify-between">
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
                        <Link
                          href={`/hesap/profil/${userContent.username}/duzenle`}
                          className="flex w-full border items-center rounded-md px-2 py-1 text-sm hover:shadow-lg"
                        >
                          <RiEditBoxLine
                            className="mr-2 text-sm text-secondary"
                            aria-hidden="true"
                          />
                          Düzenle
                        </Link>
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
                  {userContent.SocialAccounts.length > 0 && (
                    <div className="flex gap-2 mt-8">
                      {userContent.SocialAccounts.map((item, i) => (
                        <Tooltip
                          key={item.id}
                          orientation="bottom"
                          tooltipText={item.Account}
                        >
                          {item.Account === "Facebook" && (
                            <Link
                              href={item.Link}
                              title={item.Account}
                              rel="nofollow"
                              className="text-midgray border rounded px-3 py-1 text-base hover:text-white hover:border-[#4267B2] hover:bg-[#4267B2]"
                            >
                              <FaFacebookF />
                            </Link>
                          )}
                          {item.Account === "Twitter" && (
                            <Link
                              href={item.Link}
                              title={item.Account}
                              rel="nofollow"
                              className="text-midgray border rounded px-3 py-1 text-base hover:text-white hover:border-[#1DA1F2] hover:bg-[#1DA1F2]"
                            >
                              <FaTwitter />
                            </Link>
                          )}
                          {item.Account === "LinkedIn" && (
                            <Link
                              href={item.Link}
                              title={item.Account}
                              rel="nofollow"
                              className="text-midgray border rounded px-3 py-1 text-base hover:text-white hover:border-[#0072b1] hover:bg-[#0072b1]"
                            >
                              <FaLinkedinIn />
                            </Link>
                          )}
                          {item.Account === "Telegram" && (
                            <Link
                              href={item.Link}
                              title={item.Account}
                              rel="nofollow"
                              className="text-midgray border rounded px-3 py-1 text-base hover:text-white hover:border-[#0088cc] hover:bg-[#0088cc]"
                            >
                              <FaTelegramPlane />
                            </Link>
                          )}
                          {item.Account === "Youtube" && (
                            <Link
                              href={item.Link}
                              title={item.Account}
                              rel="nofollow"
                              className="text-midgray border rounded px-3 py-1 text-base hover:text-white hover:border-[#FF0000] hover:bg-[#FF0000]"
                            >
                              <FaYoutube />
                            </Link>
                          )}
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {tabs && (
              <div className="flex flex-col">
                <div className="w-full">
                  <Tab.Group>
                    <Tab.List className="flex space-x-1 rounded-xl bg-lightgray p-1">
                      {tabs.map((tab, i) => (
                        <Tab
                          key={i}
                          className={({ selected }) =>
                            classNames(
                              "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-midgray",
                              selected
                                ? "bg-white text-dark shadow"
                                : "text-midgray hover:bg-white/[0.50] hover:text-midgray/90"
                            )
                          }
                        >
                          {tab.title}
                        </Tab>
                      ))}
                    </Tab.List>
                    <Tab.Panels className="mt-2">
                      {tabs.map((tab, idx) => (
                        <Tab.Panel
                          key={idx}
                          className={classNames(
                            "min-h-[250px] bg-lightgray border rounded-xl p-3 border-lightgray"
                          )}
                        >
                          {tab.content}
                        </Tab.Panel>
                      ))}
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </div>
            )}
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
        fields: ["username", "confirmed"],
      })
      return [...currentUsers, ...localeUsers]
    },
    Promise.resolve([])
  )
  const paths = users
    .filter((item) => item.confirmed === true)
    .map((user) => {
      const { username } = user
      // Decompose the slug that was saved in Strapi
      const usernameArray = !username ? false : username

      return {
        params: { username: usernameArray },
      }
    })

  return { paths, fallback: false }
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
  const {
    username,
    name,
    surname,
    about,
    avatar,
    role,
    city,
    SocialAccounts,
    SystemAvatar,
    profile_cover,
    reactions,
    comments,
  } = userData.attributes

  const userContent = {
    id: userData.id,
    username,
    name,
    surname,
    about,
    avatar,
    role,
    city,
    SocialAccounts,
    SystemAvatar,
    profile_cover,
    reactions,
    comments,
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
    revalidate: 15,
  }
}

export default DynamicUsers
