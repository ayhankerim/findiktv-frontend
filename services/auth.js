import axios from "axios"
import { fetchAPI } from "utils/api"

export async function signIn({ email, password }) {
  try {
    const res = await fetchAPI(
      `/auth/local`,
      {},
      {
        method: "POST",
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      }
    )
    return res.data
  } catch (err) {
    console.error({ api: err.message })
  }
}
