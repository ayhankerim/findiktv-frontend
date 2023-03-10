import { fetchAPI } from "utils/api"

export default function handler(req, res) {
  const comments = require("data-store")({
    path: process.cwd() + "/.config/comments.json",
  })
  const store = require("data-store")({
    path: process.cwd() + "/.config/config.json",
  })
  try {
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
                user: user[0].id,
                content: comments.data[store.data.comment].comment_content,
                ip: comments.data[store.data.comment].comment_author_IP,
                approvalStatus: "approved",
              },
            }),
          }
        )
      } else {
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
      }
    })
  } catch (error) {
    res.status(200).json(error)
  }
  store.set({ comment: store.data.comment + 1 })
  res.status(200).json("ok")
}
