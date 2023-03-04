import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import ErrorPage from "next/error"
import { getSession, useSession } from "next-auth/react"
import { useSelector, useDispatch } from "react-redux"
import { getUserData, getAdsData, fetchAPI, getGlobalData } from "@/utils/api"
import Image from "next/image"
import Layout from "@/components/layout"
import ProfileUpdateForm from "@/components/elements/profile/profile-update-form"
import ProfileCoverAvatarChange from "@/components/elements/profile/profile-cover-avatar-change"
import SocialAccountsUpdate from "@/components/elements/profile/social-accounts-update"
import ProfileBasicPass from "@/components/elements/profile/profile-basic-pass"
import Tooltip from "@/components/elements/tooltip"
import Seo from "@/components/elements/seo"
import LatestComments from "@/components/elements/comments/latest-comments"
import ArticleMostVisited from "@/components/elements/article/articles-most-visited"
import { FcApproval } from "react-icons/fc"
import { Tab } from "@headlessui/react"
import { RiEditBoxLine, RiEditBoxFill, RiSeparator } from "react-icons/ri"
import { MdOutlineLocationOn } from "react-icons/md"
import {
  FaTelegramPlane,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa"
import Avatar from "@/components/elements/profile/avatar"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
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
  const userData = useSelector((state) => state.user.userData)
  const [tabs] = useState([
    {
      id: 1,
      title: "Bilgilerim",
      content: <ProfileUpdateForm />,
    },
    {
      id: 2,
      title: "Görseller",
      content: <ProfileCoverAvatarChange />,
    },
    {
      id: 3,
      title: "Sosyal Medya",
      content: (
        <SocialAccountsUpdate
          accounts={userContent && userContent.SocialAccounts}
        />
      ),
    },
    {
      id: 4,
      title: "Şifre & Hesap",
      content: <ProfileBasicPass />,
    },
  ])
  const router = useRouter()
  // Check if the required data was provided
  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const metadata = {
    id: 1,
    metaTitle: `Profil Düzenle | FINDIK TV`,
    metaDescription: `Profil bilgilerini güncellemek için bu sayfayı kullanabilirsiniz. | FINDIK TV`,
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
                <div className="w-full md:w-4/12 relative top-[-100px] mb-[-80px]">
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
                  </div>
                </div>
              </div>
            </div>
            {tabs && (
              <div className="flex flex-col p-4">
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
                        <Tab.Panel key={idx} className={classNames("bg-white")}>
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

export const getServerSideProps = async (context) => {
  const { params, locale } = context
  const globalLocale = await getGlobalData(locale)
  const session = await getSession(context)
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
  console.log(session)
  // Check if session exists or not, if not, redirect
  if (session == null) {
    return {
      redirect: {
        destination: "/hesap/giris-yap",
        permanent: false,
      },
    }
  }
  return {
    props: {
      userContent: userContent,
      global: globalLocale.data,
    },
  }
}

export default DynamicUsers
