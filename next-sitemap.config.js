/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.findiktv.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "hourly",
  priority: 0.7,
  exclude: ["/urunler/*", "/feeds/*", "/404"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL}/feeds/product-price-pages-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL}/feeds/product-city-price-pages-sitemap.xml`,
    ],
  },
}
