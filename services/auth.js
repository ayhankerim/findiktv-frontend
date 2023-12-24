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
    return res
  } catch (err) {
    console.error({ api: err.message })
  }
}
