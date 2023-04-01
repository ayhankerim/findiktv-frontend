import qs from "qs"

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

export async function getLastPriceDate({ product, city, type, quality }) {
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
        query getLastPriceDate(
          $product: String!
          $city: ID
          $type: String!
          $quality: String!
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              city: { id: { eq: $city } }
              type: { eq: $type }
              quality: { eq: $quality }
              approvalStatus: { eq: "approved" }
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
      },
    }),
  })

  const pricesData = await pricesRes.json()
  // Make sure we found something, otherwise return null
  if (pricesData.data?.prices == null || pricesData.data.prices.length === 0) {
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
          $type: String!
          $date: DateTime!
          $quality: String!
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              city: { id: { eq: $city } }
              type: { eq: $type }
              date: {lt: $date }
              quality: { eq: $quality }
              approvalStatus: { eq: "approved" }
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
      },
    }),
  })

  const pricesData = await pricesRes.json()
  // Make sure we found something, otherwise return null
  if (pricesData.data?.prices == null || pricesData.data.prices.length === 0) {
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
          $type: String!
          $minDate: DateTime
          $maxDate: DateTime
          $quality: String!
        ) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              city: { id: { eq: $city } }
              type: { eq: $type }
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
              approvalStatus: { eq: "approved" }
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
      },
    }),
  })

  const pricesData = await pricesRes.json()
  // Make sure we found something, otherwise return null
  if (pricesData.data?.prices == null || pricesData.data.prices.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return pricesData.data.prices.data
}
