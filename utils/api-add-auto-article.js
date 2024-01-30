import { slugify } from "@/utils/slugify"
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

export async function createAutoArticle() {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const autoArticlesRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        fragment FileParts on UploadFileEntityResponse {
          data {
            id
          }
        }
        query LastPublish {
          autoArticles(
            filters: {inUse: {eq: true}}
            sort: "last_publish_date:asc",
            pagination: { limit: 1 }
          ) {
            data {
              id
              attributes {
                title
                summary
                contentSections {
                  __typename
                  ... on ComponentSectionsVideoEmbed {
                    id
                    url
                  }
                  ... on ComponentSectionsRichText {
                    id
                    content
                  }
                  ... on ComponentSectionsArticleSection {
                    id
                    ArticleLimit
                    ArticleOffset
                    FeaturedOnly
                    SectionTitle
                  }
                  ... on ComponentSectionsCityPriceList {
                    id
                    title
                    description
                    product {
                      data {
                        id
                        attributes {
                          slug
                        }
                      }
                    }
                    date
                    priceType
                    approvalStatus
                  }
                }
                image {
                  ...FileParts
                }
                homepage_image {
                  ...FileParts
                }
                category {
                  data {
                    id
                  }
                }
                tags {
                  data {
                    id
                  }
                }
                cities(pagination: { pageSize: 20 }) {
                  data {
                    id
                  }
                }
                product {
                  data {
                    id
                  }
                }
                last_publish_date
                inUse
              }
            }
          }
        }
      `,
      variables: {},
    }),
  })

  const autoArticlesData = await autoArticlesRes.json()
  if (autoArticlesData.errors) {
    return autoArticlesData.errors
  }

  const {
    title,
    summary,
    image,
    homepage_image,
    category,
    tags,
    cities,
    product,
    contentSections,
  } = autoArticlesData.data.autoArticles.data[0].attributes
  const publishedAt = Moment()
    .utcOffset(3)
    .set("hour", Moment().hour())
    .set("minute", Moment().minutes())
    .set("second", Moment().seconds())
    .format()
  const slug =
    slugify(title) +
    "-" +
    Moment(
      contentSections.find(
        (item) => item.__typename === "ComponentSectionsCityPriceList"
      )?.date
    ).format("MMMM-Do-YYYY") +
    "-findik-fiyatlari"
  const imageArt = image.data.id
  const homepage_imageArt = homepage_image.data.id
  const categoryArt = category.data.id
  const tagsArt = tags.data[0].id
  const citiesArt = cities.data[0].id
  const productsArt = product.data.id
  const CityPrice = contentSections.find(
    (item) => item.__typename === "ComponentSectionsCityPriceList"
  )

  const createArticleRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        fragment FileParts on UploadFileEntityResponse {
          data {
            id
          }
        }
        mutation createAutoArticles {
          createArticle(
            data: {
              publishedAt: "${publishedAt}",
              title: "${
                title +
                " " +
                Moment(CityPrice.date).format("LL") +
                " Fındık Fiyatları"
              }",
              slug: "${slug}",
              summary: "${summary}",
              content: "",
              image: ${imageArt},
              homepage_image: ${homepage_imageArt},
              category: ${categoryArt},
              tags: ${tagsArt},
              cities: ${citiesArt},
              products: ${productsArt},
              contentSections: [
                {
                  __typename: "ComponentSectionsRichText",
                  content: "${
                    contentSections.find(
                      (item) => item.__typename === "ComponentSectionsRichText"
                    ).content
                  }"
                },
                {
                  __typename: "ComponentSectionsCityPriceList",
                  title: "${CityPrice.title}",
                  description: "${CityPrice.description}",
                  product: "${process.env.NEXT_PUBLIC_FINDIK_ID}",
                  date: "${Moment().format()}",
                  priceType: "${CityPrice.priceType}",
                  approvalStatus: "${CityPrice.approvalStatus}",
                }
              ],
            }
          ) {
            data {
              attributes {
                publishedAt
                createdAt
                title
                slug
                summary
                image {
                  ...FileParts
                }
                homepage_image {
                  ...FileParts
                }
                category {
                  data {
                    id
                  }
                }
                tags {
                  data {
                    id
                  }
                }
                cities {
                  data {
                    id
                  }
                }
                products {
                  data {
                    id
                  }
                }
                contentSections {
                  __typename
                  ... on ComponentSectionsVideoEmbed {
                    id
                    url
                  }
                  ... on ComponentSectionsRichText {
                    id
                    content
                  }
                  ... on ComponentSectionsArticleSection {
                    id
                    ArticleLimit
                    ArticleOffset
                    FeaturedOnly
                    SectionTitle
                  }
                  ... on ComponentSectionsCityPriceList {
                    id
                    title
                    description
                    product{
                      data {
                        id
                        attributes {
                          slug
                        }
                      }
                    }
                    date
                    priceType
                    approvalStatus
                  }
                }
              }
            }
          }
        }
      `,
    }),
  })

  const createArticlesData = await createArticleRes.json()
  if (createArticlesData.errors) {
    return createArticlesData.errors
  }

  const autoArticlesUpt = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        mutation updateAutoArticles {
          updateAutoArticle(id: ${
            autoArticlesData.data.autoArticles.data[0].id
          }, data: { last_publish_date: "${Moment().format()}" }) {
            data {
              attributes {
                last_publish_date
              }
            }
          }
        }
      `,
    }),
  })

  const autoArticlesUptData = await autoArticlesUpt.json()
  if (autoArticlesUptData.errors) {
    return autoArticlesUptData.errors
  }

  return "success"
}
