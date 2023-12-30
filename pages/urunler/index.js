import { useRouter } from "next/router"
import { getAdsData, fetchAPI, getGlobalData } from "@/utils/api"
import Link from "next/link"
import Layout from "@/components/layout"
import Breadcrumb from "@/components/elements/breadcrumb"
import Seo from "@/components/elements/seo"
import ModuleLoader from "@/components/elements/module-loader"
import LatestArticles from "@/components/elements/latest-articles"
import ArticleMostVisited from "@/components/elements/article/articles-most-visited"
import SimpleSidebar from "@/components/elements/simple-sidebar"

function Urunler({ advertisement, global, productContext }) {
  const router = useRouter()
  const { section } = router.query
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...{
      metaTitle: "Ürünler",
      metaDescription:
        "Türkiye`de oluşan tüm ürünlere ait fiyat bilgileri derlenmiştir. Tarihsel fiyat değişimleri, ürünlerin farklı şehirlerdeki fiyatları ve tüm bu verilerin grafiksel gösterimine sitemizden erişebilirsiniz.",
    },
  }
  const breadcrumbElement = [{ title: "ÜRÜNLER", slug: "/urunler" }]
  const articleSeoData = {
    slug: "/urunler",
    datePublished: "2023-02-21T21:16:43.786Z",
    dateModified: "2023-02-21T21:16:43.786Z",
    tags: [],
  }
  return (
    <Layout global={global} pageContext={productContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <main className="container gap-4 pt-2 bg-white">
        <div className="w-full">
          <Breadcrumb items={breadcrumbElement} />
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h1 className="font-extrabold text-xxl">Ürünler</h1>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <p>
              Türkiye`de oluşan tüm ürünlere ait fiyat bilgileri derlenmiştir.
              Tarihsel fiyat değişimleri, ürünlerin farklı şehirlerdeki
              fiyatları ve tüm bu verilerin grafiksel gösterimine sitemizden
              erişebilirsiniz.
            </p>
            <h2 className="text-xl">Fiyat verisi görebileceğiniz ürünler:</h2>
            <ul className="mb-6 ml-4 list-disc">
              <li>
                <Link
                  href="/urunler/findik/fiyatlari"
                  className="text-secondary font-bold underline hover:no-underline"
                >
                  Fındık
                </Link>
              </li>
            </ul>
            <ModuleLoader
              title="İLGİNİZİ ÇEKEBİLİR"
              theme="default"
              component="LatestArticles"
            >
              <LatestArticles
                current={null}
                count={3}
                offset={0}
                position="bottom"
              />
            </ModuleLoader>
          </div>
          <SimpleSidebar />
        </div>
      </main>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const { params, locale, locales, defaultLocale } = context

  const globalLocale = await getGlobalData(locale)
  const advertisement = await getAdsData()

  const productContext = {
    locale,
    locales,
    defaultLocale,
  }

  //const localizedPaths = getLocalizedPaths(productContext)

  return {
    props: {
      advertisement: advertisement,
      global: globalLocale.data,
      productContext: {
        ...productContext,
      },
    },
    revalidate: 60 * 60 * 24 * 30,
  }
}

export default Urunler
