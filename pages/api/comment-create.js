import { fetchAPI } from "utils/api"

export default function handler(req, res) {
  if (req.query.secret !== process.env.REVALIDATION_SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid token" })
  }
  const comments = require("data-store")({
    path: process.cwd() + "/.config/comments.json",
  })
  const store = require("data-store")({
    path: process.cwd() + "/.config/config.json",
  })
  console.log(store.data.comment)
  console.log(comments.data[store.data.comment].comment_author_email)
  try {
    console.log(0)
    fetchAPI(
      `/users?filters[email][$eq]=${
        comments.data[store.data.comment].comment_author_email
      }&filters[confirmed][$eq]=false&fields[0]=email`,
      {},
      {
        method: "GET",
      }
    ).then(async (user) => {
      if (user.length > 0) {
        console.log(1)
        fetchAPI(
          "/comments",
          {},
          {
            method: "POST",
            body: JSON.stringify({
              data: {
                article: null,
                product: process.env.COMMENT_PRODUCT || 2,
                city: null,
                threadOf: null,
                reply_to: null,
                user: user[0].id,
                content: comments.data[store.data.comment].comment_content,
                ip: comments.data[store.data.comment].comment_author_IP,
                approvalStatus: "approved",
              },
            }),
          }
        )
        console.log(2)
      } else {
        console.log(3)
        fetchAPI(
          `/auth/local/register`,
          {},
          {
            method: "POST",
            body: JSON.stringify({
              username: Math.random().toString(36).slice(5),
              email: comments.data[store.data.comment].comment_author_email,
              name: comments.data[store.data.comment].comment_author,
              surname: "",
              role: process.env.COMMENT_ROLE || 1,
              confirmed: false,
              password:
                Math.random().toString(36).slice(2) +
                Math.random().toString(36).slice(2),
            }),
          }
        ).then(async (data) => {
          console.log(4)
          fetchAPI(
            "/comments",
            {},
            {
              method: "POST",
              body: JSON.stringify({
                data: {
                  article: null,
                  product: process.env.COMMENT_PRODUCT || 1,
                  city: null,
                  threadOf: null,
                  reply_to: null,
                  user: data.user.id,
                  content: comments.data[store.data.comment].comment_content,
                  ip: comments.data[store.data.comment].comment_author_IP,
                  approvalStatus: "approved",
                },
              }),
            }
          )
        })
        console.log(5)
      }
    })
    store.set({ comment: store.data.comment + 1 })
    res.status(200).json("ok")
  } catch (error) {
    console.log(6)
    res.status(500).json(error)
  }
}
