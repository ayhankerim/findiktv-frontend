import { fetchAPI } from "@/utils/api"
import Moment from "moment"
import "moment/locale/tr"

function generateSiteMap(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
     ${posts
       .map((post) => {
         return `
         <url>
          <loc>${`${process.env.NEXT_PUBLIC_SITE_URL}/urunler/${post.id}/${post.attributes.slug}/fiyatlari`}</loc>
          <lastmod>${Moment(
            post.attributes.prices.data[0].attributes.updatedAt
          ).toISOString()}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>0.9</priority>
          <image:image>
            <image:loc>${
              post.attributes.featured.data.attributes.url
            }</image:loc>
            <image:title>${post.attributes.title}</image:title>
          </image:image>
         </url>
         <url>
          <loc>${`${process.env.NEXT_PUBLIC_SITE_URL}/urunler/${post.id}/${post.attributes.slug}/serbest-piyasa-fiyatlari`}</loc>
          <lastmod>${Moment(
            post.attributes.prices.data[0].attributes.updatedAt
          ).toISOString()}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>0.9</priority>
          <image:image>
            <image:loc>${
              post.attributes.featured.data.attributes.url
            }</image:loc>
            <image:title>${post.attributes.title}</image:title>
          </image:image>
         </url>
         <url>
          <loc>${`${process.env.NEXT_PUBLIC_SITE_URL}/urunler/${post.id}/${post.attributes.slug}/tmo-fiyatlari`}</loc>
          <lastmod>${Moment(
            post.attributes.prices.data[0].attributes.updatedAt
          ).toISOString()}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>0.9</priority>
          <image:image>
            <image:loc>${
              post.attributes.featured.data.attributes.url
            }</image:loc>
            <image:title>${post.attributes.title}</image:title>
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
  const posts = await fetchAPI("/products", {
    fields: ["title", "slug", "updatedAt"],
    sort: ["id:desc"],
    populate: {
      featured: {
        populate: ["url"],
      },
      prices: {
        populate: ["updatedAt"],
        sort: ["id:desc"],
        pagination: {
          start: 0,
          limit: 1,
        },
      },
    },
    pagination: {
      start: 0,
      limit: 1000,
    },
  })

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(posts.data)

  res.setHeader("Content-Type", "text/xml")
  // we send the XML to the browser
  res.write(sitemap)
  res.end()

  return {
    props: {},
    revalidate: 60,
  }
}

export default SiteMap
