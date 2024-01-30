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

export async function getLastCityPrice({ product, city, type, quality }) {
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
        query getLastCityPriceDate(
            $product: String!
            $city: String!
            $type: [String]!
            $quality: String!
            ) {
            prices(
                filters: {
                    product: { slug: { eq: $product } }
                    city: { slug: { eq: $city } }
                    type: { in: $type }
                    quality: { eq: $quality }
                    approvalStatus: { eq: "adjustment" }
                }
                sort: "date:desc"
                pagination: { limit: 2 }
            ) {
                data {
                    id
                    attributes {
                        date
                        min
                        max
                        average
                        product {
                          data {
                            attributes {
                              title
                            }
                          }
                        }
                        city {
                          data {
                            attributes {
                              title
                            }
                          }
                        }
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
  if (
    pricesData.data?.prices == null ||
    pricesData.data.prices.data.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return pricesData.data.prices.data
}
