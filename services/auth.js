import axios from "axios"

export async function signIn({ email, password }) {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/local`,
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
