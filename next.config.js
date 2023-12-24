// This file sets a custom webpack configuration to use your Next.js app
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
  async redirects() {
    return [
      {
        source: "/urunler/findik-fiyatlari/:slug\\-findik-fiyatlari\\",
        destination: "/urunler/findik/:slug/fiyati",
        permanent: true,
      },
      {
        source: "/urunler/findik-fiyatlari",
        destination: "/urunler/findik/fiyatlari",
        permanent: true,
      },
      {
        source: "/findik-fiyatlari.html",
        destination: "/urunler/findik/fiyatlari",
        permanent: true,
      },
      {
        source: "/\\findik-fiyatlari.html\\/:slug",
        destination: "/urunler/findik/fiyatlari",
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/zirai-don-uyari-sistemi/:path*",
        destination: `https://mgm.gov.tr/FTPDATA/CBS/TAHMIN/:path*`,
      },
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
        source: "/api/auth/change-password",
        destination: `${process.env.STRAPI_API_URL}/api/auth/change-password`,
      },
      {
        source: "/api/auth/email-confirmation",
        destination: `${process.env.STRAPI_API_URL}/api/auth/email-confirmation`,
      },
      {
        source: "/api/auth/send-email-confirmation",
        destination: `${process.env.STRAPI_API_URL}/api/auth/send-email-confirmation`,
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
    locales: ["tr"],
    defaultLocale: "tr",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["imagedelivery.net"],
    loader: "custom",
    loaderFile: "./utils/imageLoader.js",
  },
  swcMinify: true,
  productionBrowserSourceMaps: true,
  experimental: {
    scrollRestoration: true,
  },
}

module.exports = nextConfig


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "sentry-silhouetted-81493",
    project: "findiktv-frontend",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
