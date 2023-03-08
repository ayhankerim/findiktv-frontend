import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { getSession, useSession } from "next-auth/react"
import { fetchAPI } from "utils/api"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { useSelector, useDispatch } from "react-redux"
import { updateUser } from "@/store/user"
import { BiLoaderCircle } from "react-icons/bi"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const notify = (type, message) => {
  if (type === "success") {
    toast.success(message)
  } else if (type === "error") {
    toast.error(message)
  }
}
const ProfileCoverAvatarChange = () => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user.userData)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const [isShowing, setIsShowing] = useState(false)
  const [avatarList, setAvatarList] = useState([])
  const [coverList, setCoverList] = useState([])
  const [selectedAvatar, SetSelectedAvatar] = useState(
    userData.SystemAvatar ? userData.SystemAvatar.id : null
  )
  const [selectedCover, SetSelectedCover] = useState(
    userData.profile_cover ? userData.profile_cover.id : null
  )

  const updateAvatar = async (_id) => {
    setLoading(true)
    try {
      await fetchAPI(
        `/users/${session.id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify({
            SystemAvatar: _id,
          }),
        }
      )
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/me?populate=avatar,city,SystemAvatar,profile_cover`,
          {
            headers: {
              Authorization: `Bearer ${session.jwt}`,
            },
          }
        )
        dispatch(updateUser(response.data))
      } catch (error) {
        console.error(error.message)
      }
      notify("success", "Bilgileriniz güncellenmiştir.")
      SetSelectedAvatar(_id)
      setTimeout(() => {
        window.location.reload(false)
      }, 1000)
      setIsShowing(true)
    } catch (err) {
      notify("error", "Bilgileriniz kaydedilirken bir sorunla karşılaştık.")
    }
    setLoading(false)
  }

  const updateCover = async (_id) => {
    setLoading(true)
    try {
      await fetchAPI(
        `/users/${session.id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify({
            profile_cover: _id,
          }),
        }
      )
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/me?populate=avatar,city,SystemAvatar,profile_cover`,
          {
            headers: {
              Authorization: `Bearer ${session.jwt}`,
            },
          }
        )
        dispatch(updateUser(response.data))
      } catch (error) {
        console.error(error.message)
      }
      notify("success", "Bilgileriniz güncellenmiştir.")
      SetSelectedCover(_id)
      setTimeout(() => {
        window.location.reload(false)
      }, 1000)
      setIsShowing(true)
    } catch (err) {
      notify("error", "Bilgileriniz kaydedilirken bir sorunla karşılaştık.")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAPI("/avatars", {
      fields: ["id", "title"],
      populate: ["id", "title"],
      populate: {
        image: {
          populate: ["*"],
          fields: ["*"],
        },
      },
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: 100,
      },
    }).then((data) => {
      setAvatarList(data)
    })
    fetchAPI("/profile-images", {
      filters: {
        Status: {
          $eq: true,
        },
      },
      fields: ["id", "title"],
      populate: ["id", "title"],
      populate: {
        Image: {
          populate: ["*"],
          fields: ["*"],
        },
      },
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: 100,
      },
    }).then((data) => {
      setCoverList(data)
    })
  }, [])
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="mb-4">
        <div className="flex flex-row items-center justify-between relative">
          <h2 className="font-semibold text-base text-midgray">Avatar Seçin</h2>
          <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
        </div>
        <div className="flex flex-wrap bg-lightgray border rounded-b-xl rounded-r-xl p-3 border-lightgray mb-2">
          <ul className="grid grid-cols-4 lg:grid-cols-6 xxl:grid-cols-8 w-full gap-2 my-4">
            {avatarList.data &&
              avatarList.data.map((item) => (
                <li className="flex items-center" key={item.id}>
                  <button
                    type="button"
                    onClick={() => updateAvatar(item.id)}
                    className="relative w-full left-0 top-0 aspect-w-1 aspect-h-1 overflow-y-hidden rounded-full bg-white hover:shadow-lg hover:bg-dark"
                  >
                    <Image
                      src={item.attributes.image.data.attributes.url}
                      alt={item.attributes.title}
                      className={classNames(
                        selectedAvatar === item.id ? "border-secondary" : "",
                        "absolute inset-0 h-full w-full object-cover rounded-full border-4 hover:border-secondary"
                      )}
                      priority={true}
                      fill
                    />
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex flex-row items-center justify-between relative">
          <h2 className="font-semibold text-base text-midgray">
            Kapak Fotoğrafı Seçin
          </h2>
          <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
        </div>
        <div className="flex flex-wrap bg-lightgray border rounded-b-xl rounded-r-xl p-3 border-lightgray mb-2">
          <ul className="grid grid-cols-1 lg:grid-cols-2 xxl:grid-cols-3 w-full gap-2 my-4">
            {coverList.data &&
              coverList.data.map((item) => (
                <li className="flex items-center" key={item.id}>
                  <button
                    type="button"
                    onClick={() => updateCover(item.id)}
                    className="relative w-full left-0 top-0 aspect-w-16 aspect-h-9 overflow-y-hidden bg-white hover:shadow-lg hover:bg-dark"
                  >
                    <Image
                      src={
                        item.attributes.Image.data.attributes.formats.small.url
                      }
                      alt={item.attributes.title}
                      className={classNames(
                        selectedCover === item.id ? "border-secondary" : "",
                        "absolute inset-0 h-full w-full object-cover border-4 hover:border-secondary"
                      )}
                      priority={true}
                      fill
                    />
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default ProfileCoverAvatarChange
