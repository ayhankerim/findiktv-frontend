import axios from "axios"

const strapiUrl = process.env.STRAPI_URL

export async function signIn({ email, password }) {
  const res = await axios.post(
    `${strapiUrl}/api/auth/local`,
    {
      identifier: email,
      password,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
      },
    }
  )
  return res.data
}
