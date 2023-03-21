import { fetchAPI } from "@/utils/api"
import Moment from "moment"

function generateSiteMap(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
	xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
	>
<channel>
	<title>Fındık Haberleri | FINDIK TV</title>
	<atom:link href="${
    process.env.NEXT_PUBLIC_SITE_URL
  }/feeds/findik-haberleri-rss.xml" rel="self" type="application/rss+xml" />
	<link>${process.env.NEXT_PUBLIC_SITE_URL}</link>
	<description>Fındık Haber Merkezi</description>
	<lastBuildDate>${Moment(posts[0].attributes.createdAt)
    .lang("en")
    .format("ddd, DD MMM YYYY HH:mm:ss ZZ")}</lastBuildDate>
	<language>tr-TR</language>
	<sy:updatePeriod>
	hourly	</sy:updatePeriod>
	<sy:updateFrequency>
	1	</sy:updateFrequency>
     ${posts
       .map((post) => {
         return `
       <item>
            <title>${post.attributes.title}</title>
            <link>${`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${post.id}/${post.attributes.slug}`}</link>
            <dc:creator><![CDATA[Kerim Ayhan]]></dc:creator>
            <pubDate>${Moment(post.attributes.createdAt)
              .lang("en")
              .format("ddd, DD MMM YYYY HH:mm:ss ZZ")}</pubDate>
            <category><![CDATA[${
              post.attributes.category.data?.attributes.title
            }]]></category>
            <guid isPermaLink="true">${`${process.env.NEXT_PUBLIC_SITE_URL}/haber/${post.id}/${post.attributes.slug}`}</guid>
            <description><![CDATA[${post.attributes.summary}]]></description>
       </item>
     `
       })
       .join("")}
   </channel>
   </rss>
 `
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  // We make an API call to gather the URLs for our site
  const posts = await fetchAPI("/articles", {
    filters: {
      category: {
        slug: {
          $eq: "siyaset",
        },
      },
    },
    fields: ["title", "slug", "summary", "createdAt"],
    sort: ["id:desc"],
    populate: {
      category: {
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
