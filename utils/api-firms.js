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

export async function getAllFirmListData() {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const allFirmsRes = await fetch(gqlEndpoint, {
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
              url
              formats
            }
          }
        }

        query firmsdata {
          firms {
            data {
              id
              attributes {
                name
                slug
                servicePoints
                logo {
                  ...FileParts
                }
                address
                website
                createdAt
                updatedAt
                publishedAt
              }
            }
          }
        }
      `,
    }),
  })

  const allFirmsData = await allFirmsRes.json()
  // Make sure we found something, otherwise return null
  if (
    allFirmsData.data?.firms.data == null ||
    allFirmsData.data.firms.data.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return allFirmsData.data
}
export async function getSectorListData() {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const sectorsRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query sectors {
          firmCategories {
            data {
              id
              attributes {
                name
                slug
                firms {
                  data {
                    id
                  }
                }
              }
            }
          }
        }
      `,
    }),
  })

  const sectorsData = await sectorsRes.json()
  // Make sure we found something, otherwise return null
  if (
    sectorsData.data?.firmCategories.data == null ||
    sectorsData.data.firmCategories.data.length === 0
  ) {
    return null
  }
  // Return the first item since there should only be one result per slug
  return sectorsData.data.firmCategories.data
}
export async function getFirmData({ slug }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const firmsRes = await fetch(gqlEndpoint, {
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
              url
              formats
            }
          }
        }
        fragment galleryParts on UploadFileRelationResponseCollection {
          data {
            id
            attributes {
              alternativeText
              url
              formats
            }
          }
        }
        query firmdata($slug: String!) {
          firms(
            filters: { slug: { eq: $slug } }
            publicationState: PREVIEW
          ) {
            data {
              id
              attributes {
                name
                fullname
                slug
                description
                about
                firm_category {
                  data {
                    id
                    attributes {
                      name
                      slug
                    }
                  }
                }
                logo {
                  ...FileParts
                }
                gallery {
                  ...galleryParts
                }
                video
                address
                email
                website
                phone
                user {
                  data {
                    id
                    attributes {
                      name
                      surname
                      email
                    }
                  }
                }
                articles(sort: ["publishedAt:desc"], pagination: { limit: 10 }) {
                  data {
                    id
                    attributes {
                      title
                      slug
                      image {
                        ...FileParts
                      }
                      createdAt
                      updatedAt
                      publishedAt
                    }
                  }
                }
                servicePoints
                createdAt
                updatedAt
                publishedAt
              }
            }
          }
        }
      `,
      variables: {
        slug,
      },
    }),
  })

  const firmsData = await firmsRes.json()
  // Make sure we found something, otherwise return null
  if (firmsData.data?.firms == null || firmsData.data.firms.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return firmsData.data.firms.data[0]
}
export async function getCityCode({ cityCode }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const cityRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query getCityByCode($cityCode: [Int!]) {
          cities(filters: { cityCode: { in: $cityCode } }) {
            data {
              id
              attributes {
                cityCode
                Sivri: prices (
                  filters: {
                    type: {
                      eq: "openmarket",
                    },
                    approvalStatus: {
                      eq: "adjustment",
                    },
                    quality: {
                      eq: "Sivri",
                    },
                  },
                  pagination: { limit: 1 }
                ){
                  data {
                    attributes {
                      min
                      max
                      average
                    }
                  }
                }
                Levant: prices (
                  filters: {
                    type: {
                      eq: "openmarket",
                    },
                    approvalStatus: {
                      eq: "adjustment",
                    },
                    quality: {
                      eq: "Levant",
                    },
                  },
                  pagination: { limit: 1 }
                ){
                  data {
                    attributes {
                      min
                      max
                      average
                    }
                  }
                }
                Giresun: prices (
                  filters: {
                    type: {
                      eq: "openmarket",
                    },
                    approvalStatus: {
                      eq: "adjustment",
                    },
                    quality: {
                      eq: "Giresun",
                    },
                  },
                  pagination: { limit: 1 }
                ){
                  data {
                    attributes {
                      min
                      max
                      average
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        cityCode,
      },
    }),
  })
  const city = await cityRes.json()
  if (city.data?.cities == null || city.data.cities.length === 0) {
    return null
  }
  return city.data.cities.data
}
export async function getSectorData({ slug }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const sectorRes = await fetch(gqlEndpoint, {
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
              url
              formats
            }
          }
        }
        query firmSectors($slug: String!) {
          firmCategories(filters: { slug: { eq: $slug } }) {
            data {
              id
              attributes {
                name
                slug
                firms(
                  sort: "updatedAt:desc"
                  pagination: { limit: 1000 }
                  ) {
                  data {
                    id
                    attributes {
                      name
                      slug
                      address
                      phone
                      website
                      logo {
                        ...FileParts
                      }
                      servicePoints
                      createdAt
                      updatedAt
                      publishedAt
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
        slug,
      },
    }),
  })

  const sectorsData = await sectorRes.json()
  // Make sure we found something, otherwise return null
  if (
    sectorsData.data?.firmCategories == null ||
    sectorsData.data.firmCategories.length === 0
  ) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return sectorsData.data.firmCategories.data[0]
}
export async function createCity({ title, slug, cityCode, description }) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const cityRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        mutation createCity($title: String!, $slug: String!, $cityCode: Int!, $description: String!) {
          createCity(
            data: {
              title: $title
              slug: $slug
              cityCode: $cityCode
              content: $description
              metadata: {
                metaTitle: $title
                metaDescription: $description
              }
            }
          ) {
            data {
              id
              attributes {
                title
                slug
                cityCode
                content
                metadata {
                  metaTitle
                  metaDescription
                }
              }
            }
          }
        }
      `,
      variables: {
        title,
        slug,
        cityCode,
        description,
      },
    }),
  })

  const city = await cityRes.json()
  return city.data.createCity.data.id
}
export async function getLatestFirms() {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const firmsRes = await fetch(gqlEndpoint, {
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
              url
              formats
            }
          }
        }
        query firmdata {
          firms(
            sort: ["publishedAt:desc"]
            pagination: {limit:4}
          ) {
            data {
              id
              attributes {
                name
                slug
                logo {
                  ...FileParts
                }
                address
                email
                website
                phone
                createdAt
                updatedAt
                publishedAt
              }
            }
          }
        }
      `,
    }),
  })

  const firmsData = await firmsRes.json()
  // Make sure we found something, otherwise return null
  if (firmsData.data?.firms == null || firmsData.data.firms.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return firmsData.data.firms
}
export async function getUpdatedFirms() {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const firmsRes = await fetch(gqlEndpoint, {
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
              url
              formats
            }
          }
        }
        query firmdata {
          firms(
            sort: ["updatedAt:desc"]
            pagination: {limit:4}
          ) {
            data {
              id
              attributes {
                name
                slug
                logo {
                  ...FileParts
                }
                address
                email
                website
                phone
                createdAt
                updatedAt
                publishedAt
              }
            }
          }
        }
      `,
    }),
  })

  const firmsData = await firmsRes.json()
  // Make sure we found something, otherwise return null
  if (firmsData.data?.firms == null || firmsData.data.firms.length === 0) {
    return null
  }

  // Return the first item since there should only be one result per slug
  return firmsData.data.firms
}
export async function searchFirm({ search, province, sector }) {
  const turkiye = province ? 999 : undefined
  const gqlEndpoint = getStrapiURL("/graphql")
  const firmsRes = await fetch(gqlEndpoint, {
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
                url
                formats
                }
            }
            }
            query firmdata($search: String, $province: JSON, $turkiye: JSON, $sector: ID) {
            firms(
                filters: {
                    name: { containsi: $search }
                    firm_category: { id: { eq: $sector } }
                    or: [
                        {servicePoints: { containsi: $province }},
                        {servicePoints: { containsi: $turkiye }}
                    ]
                }
                sort: ["publishedAt:desc"]
                pagination: { limit: 12 }
            ) {
                data {
                id
                attributes {
                    name
                    slug
                    servicePoints
                    address
                    email
                    website
                    phone
                    logo {
                        ...FileParts
                    }
                    createdAt
                    updatedAt
                    publishedAt
                    }
                }
            }
        }
      `,
      variables: {
        search,
        province,
        turkiye,
        sector,
      },
    }),
  })

  const firmsData = await firmsRes.json()
  if (firmsData.data?.firms == null || firmsData.data.firms.length === 0) {
    return null
  }
  return firmsData.data.firms
}
