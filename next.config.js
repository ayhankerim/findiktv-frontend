/**
 * @type {import('next').NextConfig}
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self';
  child-src 127.0.0.1;
  style-src 'self' 127.0.0.1;
  font-src 'self';  
`
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  // {
  //   key: "Content-Security-Policy",
  //   value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  // },
]
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${process.env.STRAPI_API_URL}/uploads/:path*`,
      },
      {
        source: "/api/views/:path*",
        destination: "/api/views/:path*",
      },
      {
        source: "/api/auth/local/register",
        destination: `${process.env.STRAPI_API_URL}/api/auth/local/register`,
      },
      {
        source: "/api/auth/forgot-password",
        destination: `${process.env.STRAPI_API_URL}/api/auth/forgot-password`,
      },
      {
        source: "/api/auth/email-confirmation",
        destination: `${process.env.STRAPI_API_URL}/api/auth/email-confirmation`,
      },
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
      },
      {
        source: "/api/:path*",
        destination: `${process.env.STRAPI_API_URL}/api/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
  i18n: {
    locales: ["en", "tr"],
    defaultLocale: "tr",
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },
  swcMinify: true,
  productionBrowserSourceMaps: true,
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "30d",
      },
    },
  },
}

module.exports = nextConfig
