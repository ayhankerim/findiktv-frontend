import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"
import Seo from "@/components/elements/seo"
import Layout from "@/components/layout"
import { getAdsData, getGlobalData } from "@/utils/api"

export default function NotFound({ global }) {
  const router = useRouter()

  // Loading screen (only possible in preview mode)
  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }

  const metadata = {
    id: 1,
    metaTitle: `Böyle bir sayfa yok | FINDIK TV`,
    metaDescription: `Erişmeye çalıştığınız sayfaya erişilemedi. | FINDIK TV`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  // Merge default site SEO settings with page specific SEO settings
  if (metadata && metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  return (
    <Layout global={global} pageContext={null}>
      <Seo metadata={metadataWithDefaults} />
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-row items-end justify-between border-b border-midgray">
              <h1 className="font-semibold text-xl text-midgray">
                ARADIĞINIZ SAYFA
                <span className="ml-2 text-darkgray">BULUNAMADI!</span>
              </h1>
            </div>
            <div className="flex flex-col justify-center gap-4 py-4">
              <div className="flex flex-row items-center justify-center text-center">
                Ulaşmaya çalıştığınız sayfa silinmiş, taşınmış ya da hiç
                varolamamış olabilir.
                <Link
                  href={`/`}
                  className="py-2 px-4 ml-4 rounded border text-secondary hover:text-white border-secondary hover:bg-secondary"
                >
                  ANA SAYFA
                </Link>
              </div>
              <Image
                src={`${process.env.NEXT_PUBLIC_CLOUD_IMAGE_CORE_URL}e490d48c-e322-4fde-7f62-ac299609c500/format=auto,height=590`}
                alt={`404`}
                width={890}
                height={590}
              />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()

  return {
    props: {
      advertisement: advertisement,
      global: globalLocale.data,
    },
    revalidate: 15,
  }
}
