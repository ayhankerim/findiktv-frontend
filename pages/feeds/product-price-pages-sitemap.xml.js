import { fetchAPI } from "@/utils/api"
import Moment from "moment"
import "moment/locale/tr"
import { cloudflareLoader } from "@/utils/cloudflareLoader"

function generateSiteMap({ productArray }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
     ${productArray
       .map((post) => {
         return `
         <url>
          <loc>${`${process.env.NEXT_PUBLIC_SITE_URL}/urunler/${post.product}/fiyatlari`}</loc>
          <lastmod>${Moment(post.date).toISOString()}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>0.9</priority>
          <image:image>
            <image:loc>${cloudflareLoader(post.productImg, 900, 75)}</image:loc>
            <image:title>${post.productTitle}</image:title>
          </image:image>
         </url>
         <url>
          <loc>${`${process.env.NEXT_PUBLIC_SITE_URL}/urunler/${post.product}/serbest-piyasa-fiyatlari`}</loc>
          <lastmod>${Moment(post.date).toISOString()}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>0.8</priority>
          <image:image>
            <image:loc>${cloudflareLoader(post.productImg, 900, 75)}</image:loc>
            <image:title>${post.productTitle}</image:title>
          </image:image>
         </url>
         <url>
          <loc>${`${process.env.NEXT_PUBLIC_SITE_URL}/urunler/${post.product}/tmo-fiyatlari`}</loc>
          <lastmod>${Moment(post.date).toISOString()}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>0.7</priority>
          <image:image>
            <image:loc>${cloudflareLoader(post.productImg, 900, 75)}</image:loc>
            <image:title>${post.productTitle}</image:title>
          </image:image>
         </url>
     `
       })
       .join("")}
   </urlset>
 `
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  // We make an API call to gather the URLs for our site
  let productArray = []
  const products = await fetchAPI("/products", {
    fields: ["title", "slug", "updatedAt"],
    sort: ["id:desc"],
    populate: {
      featured: {
        populate: ["url"],
      },
    },
    pagination: {
      start: 0,
      limit: 1000,
    },
  })
  for (let a = 0; a < products.data.length; a++) {
    const prices = await fetchAPI("/prices", {
      filters: {
        product: {
          slug: {
            $eq: products.data[a].attributes.slug,
          },
        },
      },
      fields: ["updatedAt"],
      sort: ["id:desc"],
      pagination: {
        start: 0,
        limit: 1,
      },
    })
    productArray.push({
      product: products.data[a].attributes.slug,
      productImg: products.data[a].attributes.featured.data?.attributes.url,
      productTitle: products.data[a].attributes.title,
      date: prices.data[a]?.attributes.updatedAt,
    })
  }

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap({ productArray })

  res.setHeader("Content-Type", "text/xml")
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
