import { useEffect } from "react"
import { getGlobalData } from "@/utils/api"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import Head from "next/head"
import Script from "next/script"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function SignIn({ global }) {
  const metadata = {
    id: 1,
    metaTitle: "Arama | FINDIK TV",
    metaDescription:
      "Kullanıcı hesabınıza erişemiyorsanız ve ya şifrenizi unuttuysanız bu sayfayı kullanarak şifrenizi sıfırlayabilirsiniz.",
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: "/hesap/sifre-sifirla",
    datePublished: "2023-02-21T21:16:43.786Z",
    dateModified: "2023-02-21T21:16:43.786Z",
    tags: [],
  }
  useEffect(() => {
    const script = document.createElement("script")

    script.src = "https://cse.google.com/cse.js?cx=4f1fb02ced0aa3be7"
    script.async = true

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])
  return (
    <Layout global={global}>
      {/* <Script
        async={true}
        strategy="lazyOnload"
        src="https://cse.google.com/cse.js?cx=4f1fb02ced0aa3be7"
      /> */}
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <main className="container gap-4 pt-2 bg-white">
        <div className="w-full min-h-[50vh]">
          <h1 className="font-extrabold text-xl lg:text-xxl">Arama</h1>
          <div className="gcse-search"></div>
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const { locale } = context
  const globalLocale = await getGlobalData(locale)

  return {
    props: {
      global: globalLocale.data,
    },
    revalidate: 60 * 60 * 24 * 30,
  }
}
