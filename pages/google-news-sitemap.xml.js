import { fetchAPI } from "@/utils/api"
import Moment from "moment"
import "moment/locale/tr"

function generateSiteMap(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
     ${posts
       .map((post) => {
         return `
       <url>
           <loc>${`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${post.id}/${post.attributes.slug}`}</loc>
            <news:news>
            <news:publication>
                <news:name>FINDIK TV</news:name>
                <news:language>tr</news:language>
            </news:publication>
            <news:publication_date>${Moment(
              post.attributes.createdAt
            ).toISOString()}</news:publication_date>
            <news:title>${post.attributes.title}</news:title>
            <news:keywords>${post.attributes.tags.data.map((tag) => {
              return tag.attributes.title
            })}</news:keywords>
            </news:news>
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
  const posts = await fetchAPI("/articles", {
    fields: ["title", "slug", "createdAt"],
    sort: ["id:desc"],
    populate: {
      tags: {
        populate: ["title"],
      },
    },
    pagination: {
      start: 0,
      limit: 100,
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
  }
}

export default SiteMap
