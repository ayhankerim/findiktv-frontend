import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { getGlobalData } from "utils/api"
import styles from "@/styles/Home.module.css"

export default function NotAuthenticated({ global }) {
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      router.replace("/hesap/giris-yap")
    }, 2000)
  }, [router])

  return (
    <div className={styles.container}>
      <Head>
        <title>Strapi - Next - NextAuth</title>
      </Head>
      <h1>Not Authenticated, you will be redirected to Sign In page</h1>
    </div>
  )
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale, preview = null } = context
  const globalLocale = await getGlobalData(locale)

  return {
    props: {
      global: globalLocale.data,
    },
    revalidate: 15,
  }
}
