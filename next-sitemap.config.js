/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.findiktv.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "hourly",
  priority: 0.7,
  exclude: ["/urunler/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
}
