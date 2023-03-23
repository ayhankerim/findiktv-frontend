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
export async function fetchAPI(path, urlParamsObject = {}, options = {}) {
  // Merge default and user options
  const mergedOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    ...options,
  }

  // Build request URL
  const queryString = qs.stringify(urlParamsObject)
  const requestUrl = `${getStrapiURL(
    `/api${path}${queryString ? `?${queryString}` : ""}`
  )}`

  // Trigger API call
  const response = await fetch(requestUrl, mergedOptions)

  // Handle response
  if (!response.ok) {
    console.error(response.statusText)
    throw new Error(
      `Bilinmeyen bir hata ile karşılaştık. Lütfen daha sonra tekrar deneyin!`
    )
  }
  const data = await response.json()
  return data
}

/**
 *
 * @param {Object} options
 * @param {string} options.slug The page's slug
 * @param {string} options.locale The current locale specified in router.locale
 * @param {boolean} options.preview router isPreview value
 */
export async function getPageData({ slug, locale, preview }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const pagesRes = await fetch(gqlEndpoint, {
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
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }
        query GetPages(
          $slug: String!
          $publicationState: PublicationState!
          $locale: I18NLocaleCode!
        ) {        
          pages(
            filters: { slug: { eq: $slug } }
            publicationState: $publicationState
            locale: $locale
          ) {
            data {
              id
              attributes {
                locale
                localizations {
                  data {
                    id
                    attributes {
                      locale
                    }
                  }
                }
                slug
                metadata {
                  metaTitle
                  metaDescription
                  shareImage {
                    ...FileParts
                  }
                  twitterCardType
                  twitterUsername
                }
                contentSections {
                  __typename
                  ... on ComponentSectionsBottomActions {
                    id
                    title
                    buttons {
                      id
                      newTab
                      text
                      type
                      url
                    }
                  }
                  ... on ComponentSectionsHero {
                    id
                    buttons {
                      id
                      newTab
                      text
                      type
                      url
                    }
                    title
                    description
                    label
                    picture {
                      ...FileParts
                    }
                  }
                  ... on ComponentSectionsFeatureColumnsGroup {
                    id
                    features {
                      id
                      description
                      icon {
                        ...FileParts
                      }
                      title
                    }
                  }
                  ... on ComponentSectionsFeatureRowsGroup {
                    id
                    features {
                      id
                      description
                      link {
                        id
                        newTab
                        text
                        url
                      }
                      media {
                        ...FileParts
                      }
                      title
                    }
                  }
                  ... on ComponentSectionsTestimonialsGroup {
                    id
                    description
                    link {
                      id
                      newTab
                      text
                      url
                    }
                    logos {
                      id
                      title
                      logo {
                        ...FileParts
                      }
                    }
                    testimonials {
                      id
                      logo {
                        ...FileParts
                      }
                      picture {
                        ...FileParts
                      }
                      text
                      authorName
                      authorTitle
                      link
                    }
                    title
                  }
                  ... on ComponentSectionsLargeVideo {
                    id
                    description
                    title
                    poster {
                      ...FileParts
                    }
                    video {
                      ...FileParts
                    }
                  }
                  ... on ComponentSectionsRichText {
                    id
                    content
                  }
                  ... on ComponentSectionsPricing {
                    id
                    title
                    plans {
                      description
                      features {
                        id
                        name
                      }
                      id
                      isRecommended
                      name
                      price
                      pricePeriod
                    }
                  }
                  ... on ComponentSectionsLeadForm {
                    id
                    emailPlaceholder
                    location
                    submitButton {
                      id
                      text
                      type
                    }
                    title
                  }
                  ... on ComponentSectionsSlider {
                    id
                    SlideLimit
                    SliderOffset
                    SideArticleLimit
                    SideArticleOffset
                    FeaturedOnly
                  }
                  ... on ComponentSectionsArticleSection {
                    id
                    ArticleLimit
                    ArticleOffset
                    FeaturedOnly
                    SectionTitle
                  }
                }
              }
            }
          }
        }      
      `,
      variables: {
        slug,
        publicationState: preview ? "PREVIEW" : "LIVE",
        locale,
      },
    }),
  })

  const pagesData = await pagesRes.json()
  // Make sure we found something, otherwise return null
  if (pagesData.data?.pages == null || pagesData.data.pages.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return pagesData.data.pages.data[0]
}

export async function getArticleData({ slug, locale, id, preview }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const articlesRes = await fetch(gqlEndpoint, {
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
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }

        query GetArticles (
          $slug: String!
          $id: ID!
          $publicationState: PublicationState!
          $locale: I18NLocaleCode!
        ) {        
          articles(
            filters: { slug: { eq: $slug }, id: { eq: $id } }
            publicationState: $publicationState
            locale: $locale
          ) {
            data {
              id
              attributes {
                title
                slug
                summary
                content
                publishedAt
                updatedAt
                image {
                  ...FileParts
                }
                homepage_image {
                  ...FileParts
                }
                category {
                  data {
                    id
                    attributes {
                      title
                      slug
                    }
                  }
                }
                cities {
                  data {
                    id
                    attributes {
                      title
                      slug
                    }
                  }
                }
                tags {
                  data {
                    id
                    attributes {
                      title
                      slug
                    }
                  }
                }
                featured
                locale
                localizations {
                  data {
                    id
                    attributes {
                      locale
                    }
                  }
                }
              }
            }
          }
        } 
      `,
      variables: {
        slug,
        id,
        publicationState: preview ? "PREVIEW" : "LIVE",
        locale,
      },
    }),
  })

  const articlesData = await articlesRes.json()
  // Make sure we found something, otherwise return null
  if (
    articlesData.data?.articles == null ||
    articlesData.data.articles.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return articlesData.data.articles.data[0]
}

export async function getCategoryData({ slug, locale, preview }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const categoriesRes = await fetch(gqlEndpoint, {
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
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }

        query GetCategories($slug: String!, $locale: I18NLocaleCode!) {
          categories(
            filters: {
              slug: { eq: $slug }
            }
            locale: $locale
          ) {
            data {
              id
              attributes {
                title
                slug
                content
                createdAt
                updatedAt
                metadata {
                  metaTitle
                  metaDescription
                  shareImage {
                    ...FileParts
                  }
                  twitterUsername
                }
                locale
                localizations {
                  data {
                    id
                    attributes {
                      locale
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        slug,
        locale,
      },
    }),
  })

  const categoriesData = await categoriesRes.json()
  // Make sure we found something, otherwise return null
  if (
    categoriesData.data?.categories == null ||
    categoriesData.data.categories.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return categoriesData.data.categories.data[0]
}

export async function getCategoryArticlesData({ category, locale, preview }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const categoriesArticlesRes = await fetch(gqlEndpoint, {
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
            attributes {
              alternativeText
              width
              height
              formats
            }
          }
        }

        query GetArticles(
          $category: String!
          $locale: I18NLocaleCode!
        ) {
          articles(
            filters: {
              category: { slug: { eq: $category } }
            }
            locale: $locale
            sort: "id:desc"
            pagination: { start: 0, limit: 5}
          ) {
            data {
              id
              attributes {
                title
                slug
                summary
                image {
                  ...FileParts
                }
                category {
                  data {
                    attributes {
                      slug
                    }
                  }
                }
                featured
                locale
                updatedAt
              }
            }
          }
        }
      `,
      variables: {
        category,
        locale,
      },
    }),
  })

  const categorieArticlesData = await categoriesArticlesRes.json()
  // Make sure we found something, otherwise return null
  if (
    categorieArticlesData.data?.articles == null ||
    categorieArticlesData.data.articles.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return categorieArticlesData.data.articles.data
}

export async function getCityData({ slug, locale, preview }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const citiesRes = await fetch(gqlEndpoint, {
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
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }

        query getCities($slug: String!, $locale: I18NLocaleCode!) {
          cities(
            filters: {
              slug: { eq: $slug }
            }
            locale: $locale
          ) {
            data {
              id
              attributes {
                title
                slug
                content
                featured {
                  ...FileParts
                }
                createdAt
                updatedAt
                metadata {
                  metaTitle
                  metaDescription
                  shareImage {
                    ...FileParts
                  }
                  twitterUsername
                }
                locale
                localizations {
                  data {
                    id
                    attributes {
                      locale
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        slug,
        locale,
      },
    }),
  })

  const citiesData = await citiesRes.json()
  // Make sure we found something, otherwise return null
  if (citiesData.data?.cities == null || citiesData.data.cities.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return citiesData.data.cities.data[0]
}

export async function getTagData({ slug, locale, preview }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const tagsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getTags($slug: String!, $locale: I18NLocaleCode!) {
          tags(
            filters: {
              slug: { eq: $slug }
            }
            locale: $locale
          ) {
            data {
              id
              attributes {
                title
                slug
                createdAt
                updatedAt
                locale
                localizations {
                  data {
                    id
                    attributes {
                      locale
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        slug,
        locale,
      },
    }),
  })

  const tagsData = await tagsRes.json()
  // Make sure we found something, otherwise return null
  if (tagsData.data?.tags == null || tagsData.data.tags.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return tagsData.data.tags.data[0]
}

export async function getAdsData(active) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const adsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getAds (
          $active: Boolean!
          ) {
          advertisements(
            filters: { active: { eq: $active } }
            pagination: {limit: 100}
            ) {
            data {
              id
              attributes {
                active
                placeholder
                adsense
                adslot
                adsenseFormat
                code
              }
            }
          }
        }   
      `,
      variables: {
        active: true,
      },
    }),
  })

  const advertisement = await adsRes.json()
  return advertisement.data.advertisements.data
}

export async function getCommentsData(article) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const comRes = await fetch(gqlEndpoint, {
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
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }
        query CommentLimited($article: ID!) {
          comments(
            filters: { article: { id: { eq: $article } }, and: [{ approvalStatus: { eq: "approved" }}, { removed: { eq: false }}]  }
            sort: "id:desc"
            pagination: { start: 0, limit: 100 }
          ) {
            data {
              id
              attributes {
                content
                createdAt
                updatedAt
                approvalStatus
                like
                dislike
                blockedThread
                removed
                article {
                  data {
                    id
                  }
                }
                threadOf {
                  data {
                    id
                  }
                }
                reply_to {
                  data {
                    id
                    attributes {
                      user {
                        data {
                          id
                          attributes {
                            name
                            surname
                          }
                        }
                      }
                    }
                  }
                }
                user {
                  data {
                    id
                    attributes {
                      username
                      email
                      name
                      surname
                      about
                      avatar {
                        ...FileParts
                      }
                      city {
                        data {
                          id
                          attributes {
                            title
                            slug
                          }
                        }
                      }
                      confirmed
                      blocked
                      role {
                        data {
                          id
                          attributes {
                            name
                          }
                        }
                      }
                    }
                  }
                }
                ip
              }
            }
            meta {
              pagination {
                total
                page
                pageSize
                pageCount
              }
            }
          }
        }
      `,
      variables: {
        article,
      },
    }),
  })

  const comment = await comRes.json()
  return comment.data.comments
}

export async function createReaction(active) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const adsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        mutation createReaction (
          $article: Id!
          $angry: Int!
          $lol: Int!
          $sad: Int!
          $applause: Int!
          $dislike: Int!
          $love: Int!
          $shocked: Int!
          ) {
          createReaction(
            data: {
              angry: $angry
              lol: $lol
              sad: $sad
              article: $article
              applause: $applause
              dislike: $dislike
              love: $love
              shocked: $shocked
            }
          ) {
            data {
              attributes {
                angry
                dislike
                applause
                love
                sad
                shocked
                lol
                article {
                  data {
                    id
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        angry,
        dislike,
        applause,
        love,
        sad,
        shocked,
        lol,
      },
    }),
  })

  const advertisement = await adsRes.json()
  return advertisement.data.advertisements.data
}

export async function getProductData({ product, locale }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const productsRes = await fetch(gqlEndpoint, {
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
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }

        query GetProducts(
          $product: String!
          $locale: I18NLocaleCode!
        )  {
          products(
            filters: { slug: { eq: $product } }
            locale: $locale
          )  {
            data {
              id
              attributes {
                title
                slug
                content
                featured {
                  ...FileParts
                }
                createdAt
                updatedAt
                locale
                localizations {
                  data {
                    id
                    attributes {
                      locale
                    }
                  }
                }
                metadata {
                  metaTitle
                  metaDescription
                  shareImage {
                    ...FileParts
                  }
                  twitterUsername
                }
              }
            }
          }
        }
      `,
      variables: {
        product,
        locale,
      },
    }),
  })

  const productsData = await productsRes.json()
  // Make sure we found something, otherwise return null
  if (
    productsData.data?.products == null ||
    productsData.data.products.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return productsData.data.products.data[0]
}

export async function getProductCityData({ city, product, locale }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const citiesRes = await fetch(gqlEndpoint, {
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
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }

        query getCities($city: String!, $product: String!, $locale: I18NLocaleCode!) {
          cities(
            filters: {
              slug: { eq: $city }
              prices: { product: { slug: { eq: $product } } }
            }
            locale: $locale
          ) {
            data {
              id
              attributes {
                title
                slug
                content
                featured {
                  ...FileParts
                }
                createdAt
                updatedAt
                prices {
                  data {
                    id
                    attributes {
                      product {
                        data {
                          id
                          attributes {
                            title
                            slug
                          }
                        }
                      }
                    }
                  }
                }
                metadata {
                  metaTitle
                  metaDescription
                  shareImage {
                    ...FileParts
                  }
                  twitterUsername
                }
                locale
                localizations {
                  data {
                    id
                    attributes {
                      locale
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        city,
        product,
        locale,
      },
    }),
  })

  const citiesData = await citiesRes.json()
  // Make sure we found something, otherwise return null
  if (citiesData.data?.cities == null || citiesData.data.cities.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return citiesData.data.cities.data[0]
}

export async function getProductAllCitiesData({ product, locale }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const citiesRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getAllCities($product: String!, $locale: I18NLocaleCode!) {
          cities(
            filters: {
              prices: { product: { slug: { eq: $product } } }
            }
            sort: "title:asc"
            locale: $locale
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
        locale,
      },
    }),
  })

  const citiesData = await citiesRes.json()
  // Make sure we found something, otherwise return null
  if (citiesData.data?.cities == null || citiesData.data.cities.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return citiesData.data.cities
}

export async function getAllPricesData({ product }) {
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
        query getPrices($product: String!) {
          prices(
            filters: {
              product: { slug: { eq: $product } }
              type: { eq: "stockmarket" }
              approvalStatus: { eq: "approved" }
            }
            sort: "date:desc"
            pagination: { limit: 1000 }
          ) {
            data {
              id
              attributes {
                date
                min
                max
                average
                quality
                volume
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
      },
    }),
  })

  const pricesData = await pricesRes.json()
  // Make sure we found something, otherwise return null
  if (pricesData.data?.prices == null || pricesData.data.prices.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return pricesData.data.prices
}

export async function getUserData({ username }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const usersRes = await fetch(gqlEndpoint, {
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
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }

        query getUsers($username: String!) {
          usersPermissionsUsers(filters: { username: { eq: $username }, confirmed: {eq: true} }) {
            data {
              id
              attributes {
                username
                name
                surname
                about
                city {
                  data {
                    id
                    attributes {
                      title
                      slug
                    }
                  }
                }
                email
                confirmed
                blocked
                role {
                  data {
                    id
                    attributes {
                      name
                      description
                    }
                  }
                }
                avatar {
                  ...FileParts
                }
                SystemAvatar {
                  data {
                    id
                    attributes {
                      title
                      image {
                        ...FileParts
                      }
                    }
                  }
                }
                profile_cover {
                  data {
                    id
                    attributes {
                      Title
                      Image {
                        ...FileParts
                      }
                      Status
                      Default
                    }
                  }
                }
                SocialAccounts {
                  id
                  Account
                  Link
                }
                reactions(sort: "id:desc", pagination: { start: 0, limit: 30 }) {
                  data {
                    id
                    attributes {
                      Value
                      ReactionType {
                        data {
                          id
                          attributes {
                            title
                            image {
                              ...FileParts
                            }
                          }
                        }
                      }
                      article {
                        data {
                          id
                          attributes {
                            title
                            slug
                          }
                        }
                      }
                    }
                  }
                }
                comments {
                  data {
                    id
                    attributes {
                      article {
                        data {
                          id
                          attributes {
                            title
                            slug
                          }
                        }
                      }
                      product {
                        data {
                          id
                          attributes {
                            title
                            slug
                          }
                        }
                      }
                      city {
                        data {
                          id
                          attributes {
                            title
                            slug
                          }
                        }
                      }
                    }
                  }
                }
                createdAt
                updatedAt
              }
            }
          }
        }
      `,
      variables: {
        username,
      },
    }),
  })

  const usersData = await usersRes.json()
  // Make sure we found something, otherwise return null
  if (
    usersData.data?.usersPermissionsUsers == null ||
    usersData.data.usersPermissionsUsers.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return usersData.data.usersPermissionsUsers.data[0]
}

// Get site data from Strapi (metadata, navbar, footer...)
export async function getGlobalData(locale) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const globalRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        fragment FileParts on UploadFileEntityResponse {
          data {
            id
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }
        query GetGlobal($locale: I18NLocaleCode!) {
          global(locale: $locale) {
            data {
              id
              attributes {
                favicon {
                  ...FileParts
                }
                metadata {
                  metaTitle
                  metaDescription
                  shareImage {
                    ...FileParts
                  }
                  twitterCardType
                  twitterUsername
                }
                metaTitleSuffix
                notificationBanner {
                  type
                  text
                }
                navbar {
                  logo {
                    ...FileParts
                  }
                  links {
                    id
                    url
                    newTab
                    text
                    marked
                  }
                  button {
                    id
                    url
                    newTab
                    text
                    type
                  }
                }
                footer {
                  logo {
                    ...FileParts
                  }
                  smallText
                  copyright
                  columns {
                    id
                    title
                    links {
                      id
                      url
                      newTab
                      text
                    }
                  }
                }
              }
            }
          }
        }      
      `,
      variables: {
        locale,
      },
    }),
  })

  const global = await globalRes.json()
  return global.data.global
}
