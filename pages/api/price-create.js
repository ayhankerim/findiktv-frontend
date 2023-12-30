import { fetchAPI } from "utils/api"
export default async function handler(req, res) {
  if (req.query.secret !== process.env.REVALIDATION_SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid token" })
  }
  try {
    const prices = require("data-store")({
      path: process.cwd() + "/.config/prices.json",
    })
    const store = require("data-store")({
      path: process.cwd() + "/.config/config.json",
    })
    store.set({ price: store.data.price + 1 })

    await fetchAPI(
      "/prices",
      {},
      {
        method: "POST",
        body: JSON.stringify({
          data: {
            min: Number(prices.data[store.data.price].lowest_price),
            max: Number(prices.data[store.data.price].lowest_price),
            average: Number(prices.data[store.data.price].lowest_price),
            quality: "Sivri",
            volume: 1,
            city: prices.data[store.data.price].city,
            product: process.env.COMMENT_PRODUCT || 2,
            approvalStatus: "approved",
            type: "stockmarket",
            date: prices.data[store.data.price].price_date,
          },
        }),
      }
    )
    await fetchAPI(
      "/prices",
      {},
      {
        method: "POST",
        body: JSON.stringify({
          data: {
            min:
              (Number(prices.data[store.data.price].lowest_price) +
                Number(prices.data[store.data.price].highest_price)) /
              2,
            max:
              (Number(prices.data[store.data.price].lowest_price) +
                Number(prices.data[store.data.price].highest_price)) /
              2,
            average:
              (Number(prices.data[store.data.price].lowest_price) +
                Number(prices.data[store.data.price].highest_price)) /
              2,
            quality: "Levant",
            volume: 1,
            city: prices.data[store.data.price].city,
            product: process.env.COMMENT_PRODUCT || 2,
            approvalStatus: "approved",
            type: "stockmarket",
            date: prices.data[store.data.price].price_date,
          },
        }),
      }
    )
    await fetchAPI(
      "/prices",
      {},
      {
        method: "POST",
        body: JSON.stringify({
          data: {
            min: Number(prices.data[store.data.price].highest_price),
            max: Number(prices.data[store.data.price].highest_price),
            average: Number(prices.data[store.data.price].highest_price),
            quality: "Giresun",
            volume: 1,
            city: prices.data[store.data.price].city,
            product: process.env.COMMENT_PRODUCT || 2,
            approvalStatus: "approved",
            type: "stockmarket",
            date: prices.data[store.data.price].price_date,
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
