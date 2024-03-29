import qs from "qs"
import Moment from "moment"
import "moment/locale/tr"

export function getStrapiURL(path) {
  return `${
    process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"
  }${path}`
}

/**
 * Helper to make GET requests to Strapi API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {RequestInit} options Options passed to fetch
 * @returns Parsed API call response
 */

/**
 *
 * @param {Object} options
 * @param {string} options.slug The page's slug
 * @param {string} options.locale The current locale specified in router.locale
 * @param {boolean} options.preview router isPreview value
 */

export async function getLastPriceDate({
  product,
  city,
  type,
  quality,
  approvalStatus,
  user,
}) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const pricesRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getLastPriceDate(
          $product: String!
          $city: ID
          $type: [String]!
          $quality: String!
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              city: { id: { eq: $city } }
              type: { in: $type }
              quality: { eq: $quality }
              approvalStatus: { in: $approvalStatus }
            }
            sort: "date:desc"
            pagination: { limit: 1 }
          ) {
            data {
              id
              attributes {
                date
              }
            }
          }
        }
      `,
      variables: {
        product,
        city,
        type,
        quality,
        approvalStatus,
        user,
      },
    }),
  })

  const pricesData = await pricesRes.json()
  // Make sure we found something, otherwise return null
  if (
    pricesData.data?.prices == null ||
    pricesData.data.prices.data.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return pricesData.data.prices.data[0].attributes.date
}

export async function getPreviousPriceDate({
  product,
  city,
  date,
  type,
  quality,
  approvalStatus,
  user,
}) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const pricesRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getPreviousPriceDate(
          $product: String!
          $city: ID
          $type: [String]!
          $date: DateTime!
          $quality: String!
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              city: { id: { eq: $city } }
              type: { in: $type }
              date: {lt: $date }
              quality: { eq: $quality }
              approvalStatus: { in: $approvalStatus }
            }
            sort: "date:desc"
            pagination: { limit: 1 }
          ) {
            data {
              id
              attributes {
                date
              }
            }
          }
        }
      `,
      variables: {
        product,
        city,
        date,
        type,
        quality,
        approvalStatus,
        user,
      },
    }),
  })

  const pricesData = await pricesRes.json()
  // Make sure we found something, otherwise return null
  if (
    pricesData.data?.prices == null ||
    pricesData.data.prices.data.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return pricesData.data.prices.data[0].attributes.date
}

export async function getPriceValues({
  product,
  city,
  minDate,
  maxDate,
  type,
  quality,
  approvalStatus,
  user,
}) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const pricesRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getPriceValues(
          $product: String!
          $city: ID
          $type: [String]!
          $minDate: DateTime
          $maxDate: DateTime
          $quality: String!
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              city: { id: { eq: $city } }
              type: { in: $type }
              and: [
                {
                  date: {
                    gte: $minDate,
                  },
                },
                {
                  date: {
                    lte: $maxDate,
                  },
                },
              ],
              quality: { eq: $quality }
              approvalStatus: { in: $approvalStatus }
            }
            sort: "date:desc"
            pagination: { limit: 100 }
          ) {
            data {
              id
              attributes {
                average
                volume
              }
            }
          }
        }
      `,
      variables: {
        product,
        city,
        minDate,
        maxDate,
        type,
        quality,
        approvalStatus,
        user,
      },
    }),
  })

  const pricesData = await pricesRes.json()
  if (pricesData.data?.prices == null || pricesData.data?.prices.length === 0) {
    return null
  }
  return pricesData.data.prices.data
}

export async function getPriceCard({
  product,
  priceType,
  priceQualities,
  city,
  approvalStatus,
  user,
}) {
  let priceCardArray = []
  for (let i = 0; i < priceQualities.length; i++) {
    const latestPricedate = await getLastPriceDate({
      product: product,
      type: priceType,
      quality: priceQualities[i],
      city: city,
      approvalStatus: approvalStatus,
      user: user,
    })
    const PreviousPricedate = await getPreviousPriceDate({
      product: product,
      type: priceType,
      date: Moment(latestPricedate)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .toISOString(),
      quality: priceQualities[i],
      city: city,
      approvalStatus: approvalStatus,
      user: user,
    })
    const getPriceValue = await getPriceValues({
      product: product,
      type: priceType,
      minDate: Moment(latestPricedate)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .toISOString(),
      maxDate: Moment(latestPricedate)
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 59)
        .toISOString(),
      quality: priceQualities[i],
      city: city,
      approvalStatus: approvalStatus,
      user: user,
    })
    let priceSum = 0
    let totalvolume = 0
    getPriceValue.map((item) => {
      priceSum = item.attributes.average * item.attributes.volume + priceSum
      totalvolume = item.attributes.volume + totalvolume
    })
    const averageSum = priceSum / totalvolume
    const getPrevPriceValue = await getPriceValues({
      product: product,
      type: priceType,
      minDate: Moment(PreviousPricedate)
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .toISOString(),
      maxDate: Moment(PreviousPricedate)
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 59)
        .toISOString(),
      quality: priceQualities[i],
      city: city,
      approvalStatus: approvalStatus,
      user: user,
    })
    let pricePrevSum = 0
    let totalPrevvolume = 0
    getPrevPriceValue.map((item) => {
      pricePrevSum =
        item.attributes.average * item.attributes.volume + pricePrevSum
      totalPrevvolume = item.attributes.volume + totalPrevvolume
    })
    const averagePrevSum = pricePrevSum / totalPrevvolume
    priceCardArray.push({
      name: priceQualities[i],
      date1: latestPricedate,
      date2: PreviousPricedate,
      value1: averageSum,
      value2: averagePrevSum,
    })
  }
  return priceCardArray
}

export async function getProductCities({ product, type }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const itemsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query GetCities($product: String!, $type: [String]!) {
          cities(
            filters: {
              prices: { product: { slug: { eq: $product } }, type: { in: $type } }
            }
            sort: ["title:asc"]
            pagination: { limit: 100 }
          ) {
            data {
              id
              attributes {
                title
                slug
              }
            }
          }
        }
      `,
      variables: {
        product,
        type,
      },
    }),
  })

  const itemsData = await itemsRes.json()
  // Make sure we found something, otherwise return null
  if (itemsData.data?.cities == null || itemsData.data.cities.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return itemsData.data.cities.data
}

export async function getCitiesPrice({
  product,
  priceType,
  priceQualities,
  approvalStatus,
  user,
}) {
  let priceCitiesArray = []
  const priceCities = await getProductCities({
    product: product,
    type: priceType,
    approvalStatus: approvalStatus,
    user: user,
  })
  for (let y = 0; y < priceCities.length; y++) {
    let priceCitiesQualityArray = []
    for (let i = 0; i < priceQualities.length; i++) {
      const latestPricedate = await getLastPriceDate({
        product: product,
        city: priceCities[y].id,
        type: priceType,
        quality: priceQualities[i],
        approvalStatus: approvalStatus,
        user: user,
      })
      const PreviousPricedate = await getPreviousPriceDate({
        product: product,
        city: priceCities[y].id,
        type: priceType,
        date: Moment(latestPricedate)
          .set("hour", 0)
          .set("minute", 0)
          .set("second", 0)
          .toISOString(),
        quality: priceQualities[i],
        approvalStatus: approvalStatus,
        user: user,
      })
      const getPriceValue = await getPriceValues({
        product: product,
        city: priceCities[y].id,
        type: priceType,
        minDate: Moment(latestPricedate)
          .set("hour", 0)
          .set("minute", 0)
          .set("second", 0)
          .toISOString(),
        maxDate: Moment(latestPricedate)
          .set("hour", 23)
          .set("minute", 59)
          .set("second", 59)
          .toISOString(),
        quality: priceQualities[i],
        approvalStatus: approvalStatus,
        user: user,
      })
      let priceSum = 0
      let totalvolume = 0
      getPriceValue.map((item) => {
        priceSum = item.attributes.average * item.attributes.volume + priceSum
        totalvolume = item.attributes.volume + totalvolume
      })
      const averageSum = priceSum / totalvolume
      const getPrevPriceValue = await getPriceValues({
        product: product,
        city: priceCities[y].id,
        type: priceType,
        minDate: Moment(PreviousPricedate)
          .set("hour", 0)
          .set("minute", 0)
          .set("second", 0)
          .toISOString(),
        maxDate: Moment(PreviousPricedate)
          .set("hour", 23)
          .set("minute", 59)
          .set("second", 59)
          .toISOString(),
        quality: priceQualities[i],
        approvalStatus: approvalStatus,
        user: user,
      })
      let pricePrevSum = 0
      let totalPrevvolume = 0
      getPrevPriceValue.map((item) => {
        pricePrevSum =
          item.attributes.average * item.attributes.volume + pricePrevSum
        totalPrevvolume = item.attributes.volume + totalPrevvolume
      })
      const averagePrevSum = pricePrevSum / totalPrevvolume
      priceCitiesQualityArray.push({
        name: priceQualities[i],
        date1: latestPricedate,
        date2: PreviousPricedate,
        value1: averageSum,
        value2: averagePrevSum,
      })
    }
    priceCitiesArray.push({
      title: priceCities[y].attributes.title,
      slug: priceCities[y].attributes.slug,
      data: priceCitiesQualityArray,
    })
  }
  return priceCitiesArray
}

export async function getDefaultPriceValue({
  product,
  type,
  quality,
  approvalStatus,
  user,
}) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const date_limit = Moment()
    .subtract(15, "days")
    .set("hour", 0)
    .set("minute", 0)
    .set("second", 0)
    .format()
  const pricesRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getPriceValues(
          $product: String!
          $type: [String]!
          $quality: String!
          $date_limit: DateTime!
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              type: { in: $type }
              date: { lte: $date_limit }
              quality: { eq: $quality }
              approvalStatus: { in: $approvalStatus }
            }
            sort: "date:desc"
            pagination: { limit: 1 }
          ) {
            data {
              id
              attributes {
                average
                volume
                date
                quality
              }
            }
          }
        }
      `,
      variables: {
        product,
        type,
        quality,
        date_limit,
        approvalStatus,
        user,
      },
    }),
  })

  const pricesData = await pricesRes.json()
  // Make sure we found something, otherwise return null
  if (pricesData.data?.prices == null || pricesData.data?.prices.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return pricesData.data.prices.data
}

export async function getDefaultPriceValues({
  product,
  type,
  priceQualities,
  approvalStatus,
  user,
}) {
  let defaultPriceValuesArray = []
  for (let y = 0; y < priceQualities.length; y++) {
    const defaultPriceValue = await getDefaultPriceValue({
      product: product,
      type: type,
      quality: priceQualities[y],
      approvalStatus: approvalStatus,
      user: user,
    })
    defaultPriceValuesArray.push({
      average: defaultPriceValue[0].attributes.average,
      volume: defaultPriceValue[0].attributes.volume,
      date: defaultPriceValue[0].attributes.date,
      quality: defaultPriceValue[0].attributes.quality,
    })
  }
  return defaultPriceValuesArray
}

export async function getMaxPrice({
  product,
  type,
  quality,
  date,
  approvalStatus,
  user,
}) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const itemsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getMaxPrice(
          $product: String!
          $city: ID
          $type: [String]!
          $date: DateTime!
          $quality: String!
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              city: { id: { eq: $city } }
              type: { in: $type }
              date: { gte: $date }
              quality: { eq: $quality }
              approvalStatus: { in: $approvalStatus }
            }
            sort: "max:desc"
            pagination: { limit: 1 }
          ) {
            data {
              id
              attributes {
                max
              }
            }
          }
        }
      `,
      variables: {
        product,
        type,
        quality,
        date,
        approvalStatus,
        user,
      },
    }),
  })

  const itemsData = await itemsRes.json()
  // Make sure we found something, otherwise return null
  if (itemsData.data?.prices == null || itemsData.data?.prices.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return itemsData.data.prices.data[0].attributes.max
}

export async function getMinPrice({
  product,
  type,
  quality,
  date,
  approvalStatus,
  user,
}) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const itemsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getMaxPrice(
          $product: String!
          $city: ID
          $type: [String]!
          $date: DateTime!
          $quality: String!
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              city: { id: { eq: $city } }
              type: { in: $type }
              date: { gte: $date }
              quality: { eq: $quality }
              approvalStatus: { in: $approvalStatus }
            }
            sort: "min:asc"
            pagination: { limit: 1 }
          ) {
            data {
              id
              attributes {
                min
              }
            }
          }
        }
      `,
      variables: {
        product,
        type,
        quality,
        date,
        approvalStatus,
        user,
      },
    }),
  })

  const itemsData = await itemsRes.json()
  // Make sure we found something, otherwise return null
  if (itemsData.data?.prices == null || itemsData.data?.prices.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return itemsData.data.prices.data[0].attributes.min
}

export async function getOldestDate({
  product,
  type,
  quality,
  date,
  approvalStatus,
  user,
}) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const itemsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getMaxPrice(
          $product: String!
          $city: ID
          $type: [String]!
          $date: DateTime!
          $quality: String!
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              city: { id: { eq: $city } }
              type: { in: $type }
              date: { gte: $date }
              quality: { eq: $quality }
              approvalStatus: { in: $approvalStatus }
            }
            sort: "date:asc"
            pagination: { limit: 1 }
          ) {
            data {
              id
              attributes {
                date
              }
            }
          }
        }
      `,
      variables: {
        product,
        type,
        quality,
        date,
        approvalStatus,
        user,
      },
    }),
  })

  const itemsData = await itemsRes.json()
  // Make sure we found something, otherwise return null
  if (itemsData.data?.prices == null || itemsData.data?.prices.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return itemsData.data.prices.data[0].attributes.min
}

export async function getTermlyPriceList({
  product,
  priceType,
  priceQualities,
  city,
  approvalStatus,
  user,
}) {
  const priceTerms = [
    [
      { name: "Güncel Değer", day: 0, type: 0 },
      { name: "Bir Önceki Değer", day: 1, type: 0 },
      { name: "Değişim", day: 0, type: 1 },
      { name: "Değişim (%)", day: 0, type: 2 },
    ],
    [
      { name: "Haftalık Değişim", day: 7, type: 1 },
      { name: "Haftalık Değişim (%)", day: 7, type: 2 },
      { name: "Haftalık En Düşük", day: 7, type: 3 },
      { name: "Haftalık En Yüksek", day: 7, type: 4 },
    ],
    [
      { name: "Aylık Değişim", day: 30, type: 1 },
      { name: "Aylık Değişim (%)", day: 30, type: 2 },
      { name: "Aylık En Düşük", day: 30, type: 3 },
      { name: "Aylık En Yüksek", day: 30, type: 4 },
    ],
    [
      { name: "Yıllık Değişim", day: 360, type: 1 },
      { name: "Yıllık Değişim (%)", day: 360, type: 2 },
      { name: "Yıllık En Düşük", day: 360, type: 3 },
      { name: "Yıllık En Yüksek", day: 360, type: 4 },
    ],
  ]
  let priceArray = []
  for (let a = 0; a < priceTerms.length; a++) {
    let priceInnerArray = []
    for (let b = 0; b < priceTerms[a].length; b++) {
      let priceData = []
      for (let i = 0; i < priceQualities.length; i++) {
        const latestPricedate = await getLastPriceDate({
          product: product,
          type: priceType,
          quality: priceQualities[i],
          city: city,
          approvalStatus: approvalStatus,
          user: user,
        })
        const PreviousPricedate = await getPreviousPriceDate({
          product: product,
          type: priceType,
          date: Moment(latestPricedate)
            .subtract(priceTerms[a][b].day, "days")
            .set("hour", 0)
            .set("minute", 0)
            .set("second", 0)
            .toISOString(),
          quality: priceQualities[i],
          city: city,
          approvalStatus: approvalStatus,
          user: user,
        })
        const getPriceValue = await getPriceValues({
          product: product,
          type: priceType,
          minDate: Moment(latestPricedate)
            .set("hour", 0)
            .set("minute", 0)
            .set("second", 0)
            .toISOString(),
          maxDate: Moment(latestPricedate)
            .set("hour", 23)
            .set("minute", 59)
            .set("second", 59)
            .toISOString(),
          quality: priceQualities[i],
          city: city,
          approvalStatus: approvalStatus,
          user: user,
        })
        let priceSum = 0
        let totalvolume = 0
        getPriceValue.map((item) => {
          priceSum = item.attributes.average * item.attributes.volume + priceSum
          totalvolume = item.attributes.volume + totalvolume
        })
        const averageSum = priceSum / totalvolume

        const getPrevPriceValue = PreviousPricedate
          ? await getPriceValues({
              product: product,
              type: priceType,
              minDate: Moment(PreviousPricedate)
                .set("hour", 0)
                .set("minute", 0)
                .set("second", 0)
                .toISOString(),
              maxDate: Moment(PreviousPricedate)
                .set("hour", 23)
                .set("minute", 59)
                .set("second", 59)
                .toISOString(),
              quality: priceQualities[i],
              city: city,
              approvalStatus: approvalStatus,
              user: user,
            })
          : getPriceValue
        let pricePrevSum = 0
        let totalPrevvolume = 0
        getPrevPriceValue.map((item) => {
          pricePrevSum =
            item.attributes.average * item.attributes.volume + pricePrevSum
          totalPrevvolume = item.attributes.volume + totalPrevvolume
        })
        const averagePrevSum = pricePrevSum / totalPrevvolume
        switch (priceTerms[a][b].type) {
          case 0:
            if (priceTerms[a][b].day === 0) {
              priceData.push({
                name: priceQualities[i],
                value1: averageSum,
              })
            } else {
              priceData.push({
                name: priceQualities[i],
                value1: averagePrevSum,
              })
            }
            break
          case 1:
            priceData.push({
              name: priceQualities[i],
              value1: averageSum - averagePrevSum,
            })
            break
          case 2:
            priceData.push({
              name: priceQualities[i],
              value1: (averageSum - averagePrevSum) / averagePrevSum,
            })
            break
          case 3:
            const minPrice = await getMinPrice({
              product: product,
              type: priceType,
              quality: priceQualities[i],
              city: city,
              date: Moment(latestPricedate)
                .subtract(priceTerms[a][b].day, "days")
                .set("hour", 0)
                .set("minute", 0)
                .set("second", 0)
                .toISOString(),
              approvalStatus: approvalStatus,
              user: user,
            })
            priceData.push({
              name: priceQualities[i],
              value1: minPrice,
            })
            break
          case 4:
            const maxPrice = await getMaxPrice({
              product: product,
              type: priceType,
              quality: priceQualities[i],
              city: city,
              date: Moment(latestPricedate)
                .subtract(priceTerms[a][b].day, "days")
                .set("hour", 0)
                .set("minute", 0)
                .set("second", 0)
                .toISOString(),
              approvalStatus: approvalStatus,
              user: user,
            })
            priceData.push({
              name: priceQualities[i],
              value1: maxPrice,
            })
            break
          default:
            break
        }
      }
      priceInnerArray.push({
        name: priceTerms[a][b].name,
        type: priceTerms[a][b].type,
        data: priceData,
      })
    }
    priceArray.push({
      priceInnerArray,
    })
  }
  return priceArray
}

export async function getPriceEntries({
  product,
  city,
  priceType,
  approvalStatus,
  user,
}) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const itemsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getPriceEntries(
          $product: String!
          $city: ID
          $priceType: [String]!
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              city: { id: { eq: $city } }
              type: { in: $priceType }
              approvalStatus: { in: $approvalStatus }
            }
            sort: "date:desc"
            pagination: { limit: 10 }
          ) {
            data {
              id
              attributes {
                date
                average
                min
                max
                volume
                quality
                createdAt
                updatedAt
              }
            }
          }
        }
      `,
      variables: {
        product,
        priceType,
        approvalStatus,
        city,
        user,
      },
    }),
  })

  const itemsData = await itemsRes.json()
  // Make sure we found something, otherwise return null
  if (itemsData.data?.prices == null || itemsData.data?.prices.length === 0) {
    return null
  }
  // Return the first item since there should only be one result per slug
  return itemsData.data.prices.data
}

export async function getGraphData({
  product,
  city,
  priceType,
  approvalStatus,
  user,
}) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const itemsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getGraphData(
          $product: String!
          $city: ID
          $priceType: [String]!
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              city: { id: { eq: $city } }
              type: { in: $priceType }
              approvalStatus: { in: $approvalStatus }
            }
            sort: "date:desc"
            pagination: { limit: 1000 }
          ) {
            data {
              id
              attributes {
                date
                average
                volume
                quality
              }
            }
          }
        }
      `,
      variables: {
        product,
        priceType,
        city,
        approvalStatus,
        user,
      },
    }),
  })
  const itemsData = await itemsRes.json()
  if (itemsData.data?.prices == null || itemsData.data?.prices.length === 0) {
    return null
  }

  let sums = {},
    counts = {},
    volume = {},
    quality = {},
    results = [],
    date
  for (var i = 0; i < itemsData.data.prices.data.length; i++) {
    date =
      new Date(itemsData.data.prices.data[i].attributes.date).setHours(
        0,
        0,
        0
      ) +
      24 * 60 * 60 * 1000
    if (!(date in sums)) {
      sums[date] = 0
      counts[date] = 0
      volume[date] = 0
      quality[date] = ""
    }
    sums[date] +=
      itemsData.data.prices.data[i].attributes.average *
      itemsData.data.prices.data[i].attributes.volume
    volume[date] += itemsData.data.prices.data[i].attributes.volume
    quality[date] = itemsData.data.prices.data[i].attributes.quality
    counts[date]++
  }

  for (date in sums) {
    results.push({
      date: Number(date),
      average: Number((sums[date] / volume[date]).toFixed(2)),
      //volume: volume[date],
      quality: quality[date],
    })
  }
  return results
}

export async function getUserEnteredPrices({
  product,
  type,
  minDate,
  maxDate,
  approvalStatus,
  user,
}) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const itemsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getUserEnteredPrices(
          $product: String!
          $type: [String]!
          $minDate: DateTime
          $maxDate: DateTime
          $approvalStatus: [String]!
          $user: ID
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              user: { id: { eq: $user } }
              type: { in: $type }
              and: [{ date: { gte: $minDate } }, { date: { lte: $maxDate } }]
              approvalStatus: { in: $approvalStatus }
            }
            sort: "date:desc"
            pagination: { limit: 100 }
          ) {
            data {
              id
              attributes {
                date
                min
                max
                average
                city {
                  data {
                    id
                    attributes {
                      title
                      slug
                    }
                  }
                }
                approvalStatus
                createdAt
              }
            }
          }
        }
      `,
      variables: {
        product,
        type,
        minDate,
        maxDate,
        approvalStatus,
        user,
      },
    }),
  })

  const itemsData = await itemsRes.json()
  if (itemsData.data?.prices == null || itemsData.data?.prices.length === 0) {
    return null
  }
  return itemsData.data.prices.data
}

export async function updatePrice(price) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const itemsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        mutation updatePrice ($price: ID!) {
          updatePrice(id: $price, data: { approvalStatus: ignored }) {
            data {
              id
              attributes {
                approvalStatus
              }
            }
          }
        }
      `,
      variables: {
        price,
      },
    }),
  })

  const itemsData = await itemsRes.json()
  if (
    itemsData.data?.updatePrice == null ||
    itemsData.data?.updatePrice.length === 0
  ) {
    return null
  }
  return itemsData.data.updatePrice.data
}

export async function getUserLastPrice({ user }) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const itemsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getUserLastPrice($user: ID) {
          prices(
            filters: { user: { id: { eq: $user } } }
            sort: ["date:desc"]
            pagination: {limit: 1}
          ) {
            data {
              attributes {
                date
              }
            }
          }
        }
      `,
      variables: {
        user,
      },
    }),
  })

  const itemsData = await itemsRes.json()
  if (
    itemsData.data?.prices == null ||
    itemsData.data?.prices.data.length === 0
  ) {
    return null
  }
  return itemsData.data.prices.data[0]
}
