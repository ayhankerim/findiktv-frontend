import { useState, useEffect } from "react"
import Image from "next/image"
import { fetchAPI } from "@/utils/api"

const Avatar = ({ username, avatar, systemavatar }) => {
  const [userAvatar, setAvatar] = useState(null)
  useEffect(() => {
    if (avatar) {
      setAvatar(avatar)
    } else if (systemavatar) {
      setAvatar(systemavatar)
    } else {
      fetchAPI("/avatars", {
        filters: {
          Default: {
            $eq: true,
          },
        },
        populate: {
          image: {
            populate: ["*"],
          },
        },
        populate: ["image"],
        sort: ["id:desc"],
        pagination: {
          start: 0,
          limit: 1,
        },
      }).then((data) => {
        setAvatar(data.data[0].attributes.image.data.attributes.url)
      })
    }
  }, [avatar, systemavatar])

  if (userAvatar)
    return (
      <Image
        src={userAvatar}
        alt={username}
        className="absolute inset-0 h-full w-full object-cover rounded-full p-2"
        priority={true}
        fill
      />
    )
}

export default Avatar
