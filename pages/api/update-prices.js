import { fetchAPI } from "utils/api"
import Moment from "moment"
import "moment/locale/tr"
export default async function handler(req, res) {
  if (req.query.secret !== process.env.REVALIDATION_SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid token" })
  }
  try {
    await fetchAPI("/cities", {
      filters: {
        prices: {
          product: {
            id: {
              $eq: process.env.NEXT_PUBLIC_FINDIK_ID,
            },
          },
        },
      },
      fields: ["id"],
      sort: ["title:asc"],
      pagination: {
        start: 0,
        limit: 100,
      },
    }).then((cities) => {
      cities.data.map((city) => {
        ;["Sivri", "Levant", "Giresun"].map(async (quality) => {
          try {
            await fetchAPI("/prices", {
              filters: {
                product: {
                  id: {
                    $eq: process.env.NEXT_PUBLIC_FINDIK_ID,
                  },
                },
                city: { id: { $eq: city.id } },
                type: { $eq: "openmarket" },
                quality: { $eq: quality },
                approvalStatus: { $eq: "adjustment" },
              },
              fields: ["min", "max", "average"],
              sort: ["date:desc"],
              pagination: {
                start: 0,
                limit: 1,
              },
            }).then(async (prices) => {
              try {
                await fetchAPI(
                  "/prices",
                  {},
                  {
                    method: "POST",
                    body: JSON.stringify({
                      data: {
                        date: Moment()
                          .utcOffset(3)
                          .set("hour", Moment().hour())
                          .set("minute", Moment().minutes())
                          .set("second", Moment().seconds())
                          .format("YYYY-MM-DD HH:mm:ss"),
                        min: Number(prices.data[0].attributes.min),
                        max: Number(prices.data[0].attributes.max),
                        average: Number(prices.data[0].attributes.average),
                        quality: quality,
                        volume: 1,
                        efficiency: 50,
                        product: process.env.NEXT_PUBLIC_FINDIK_ID,
                        approvalStatus: "adjustment",
                        type: "openmarket",
                        city: city.id,
                        user: null,
                        ip: "",
                      },
                    }),
                  }
                )
                res.status(200).json("ok")
              } catch (err) {
                res.status(500).json(err)
              }
            })
          } catch (error) {
            console.error("Error fetching prices data:", error)
          }
        })
      })
    })
  } catch (error) {
    console.error("Error fetching city data:", error)
  }
}
