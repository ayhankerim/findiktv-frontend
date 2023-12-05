import { fetchAPI } from "utils/api"

export default async function handler(req, res) {
  if (req.query.secret !== process.env.REVALIDATION_SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid token" })
  }
  function getRandom(min, max) {
    const floatRandom = Math.random()

    const difference = max - min

    // random between 0 and the difference
    const random = Math.round(difference * floatRandom)

    const randomWithinRange = random + min

    return randomWithinRange
  }
  try {
    const articles = require("data-store")({
      path: process.cwd() + "/.config/articles.json",
    })
    const store = require("data-store")({
      path: process.cwd() + "/.config/config.json",
    })
    store.set({ article: store.data.article + 1 })

    let cities = []
    if (
      articles.data[store.data.article].post_content.includes("Akçakoca") ===
      true
    ) {
      cities.push(16)
    }
    if (
      articles.data[store.data.article].post_content.includes("Alaplı") === true
    ) {
      cities.push(17)
    }
    if (
      articles.data[store.data.article].post_content.includes("Bartın") === true
    ) {
      cities.push(18)
    }
    if (
      articles.data[store.data.article].post_content.includes("Çarşamba") ===
      true
    ) {
      cities.push(19)
    }
    if (
      articles.data[store.data.article].post_content.includes("Düzce") === true
    ) {
      cities.push(20)
    }
    if (
      articles.data[store.data.article].post_content.includes("Fatsa") === true
    ) {
      cities.push(21)
    }
    if (
      articles.data[store.data.article].post_content.includes("Giresun") ===
      true
    ) {
      cities.push(22)
    }
    if (
      articles.data[store.data.article].post_content.includes("Kocaeli") ===
      true
    ) {
      cities.push(23)
    }
    if (
      articles.data[store.data.article].post_content.includes("Ordu") === true
    ) {
      cities.push(24)
    }
    if (
      articles.data[store.data.article].post_content.includes("Sakarya") ===
      true
    ) {
      cities.push(25)
    }
    if (
      articles.data[store.data.article].post_content.includes("Samsun") === true
    ) {
      cities.push(26)
    }
    if (
      articles.data[store.data.article].post_content.includes("Terme") === true
    ) {
      cities.push(27)
    }
    if (
      articles.data[store.data.article].post_content.includes("Trabzon") ===
      true
    ) {
      cities.push(28)
    }
    if (
      articles.data[store.data.article].post_content.includes("Ünye") === true
    ) {
      cities.push(29)
    }
    if (
      articles.data[store.data.article].post_content.includes("Zonguldak") ===
      true
    ) {
      cities.push(30)
    }
    let summary = ""
    if (
      articles.data[store.data.article].post_excerpt != "" &&
      articles.data[store.data.article].post_excerpt.length > 100
    ) {
      summary = articles.data[store.data.article].post_content
    } else {
      summary =
        articles.data[store.data.article].post_content
          .replace(/(<([^>]+)>)/gi, "")
          .substring(0, 200) + "..."
    }
    await fetchAPI(
      "/articles",
      {},
      {
        method: "POST",
        body: JSON.stringify({
          data: {
            title: articles.data[store.data.article].post_title,
            slug: articles.data[store.data.article].post_name,
            summary: summary,
            content: articles.data[store.data.article].post_content,
            image: process.env.ARTICLE_IMAGE || 58,
            homepage_image: process.env.ARTICLE_IMAGE || 43,
            notification: false,
            category: getRandom(11, 22),
            tags: null,
            cities: cities,
            product: process.env.COMMENT_PRODUCT || 2,
            featured: false,
            ignoreHome: false,
            view: Math.floor(Math.random().toFixed(5) * 10000),
          },
        }),
      }
    )
    res.status(200).json("ok")
  } catch (error) {
    console.error(error)
    res.status(500).json(error)
  }
}
