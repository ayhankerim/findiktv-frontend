import React, { useState } from "react"
import { useRouter } from "next/router"
import { getSession, useSession } from "next-auth/react"
import { fetchAPI, getGlobalData } from "@/utils/api"
import { getFirmData } from "@/utils/api-firms"
import toast, { Toaster } from "react-hot-toast"
import { BiLoaderCircle } from "react-icons/bi"
import { RiArrowGoBackFill } from "react-icons/ri"
import Link from "next/link"
import Layout from "@/components/layout"
import Seo from "@/components/elements/seo"
import Moment from "moment"
import "moment/locale/tr"

const notify = (type, message) => {
  if (type === "success") {
    toast.success(message)
  } else if (type === "error") {
    toast.error(message)
  }
}

const FirmAddPrice = ({
  firmContent,
  global,
  userHasOwnerRight,
  firmContext,
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { data: session } = useSession()

  const metadata = {
    id: 1,
    metaTitle: `Son Girdiğiniz Fiyatlar`,
    metaDescription: `Son Girdiğiniz Fiyatlar`,
    twitterCardType: "summary",
    twitterUsername: "findiktvcom",
    shareImage: null,
  }

  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const articleSeoData = {
    slug: `/firma/${firmContent.slug}/sahiplen`,
    datePublished: Moment(firmContent.publishedAt).toISOString(),
    dateModified: Moment(firmContent.updatedAt).toISOString(),
    tags: [],
  }
  if (!router.isFallback && !firmContent) {
    return {
      notFound: true,
    }
  }

  if (router.isFallback) {
    return <div className="container">Yükleniyor...</div>
  }
  const getOwnership = async () => {
    setLoading(true)
    try {
      await fetchAPI(
        `/firms/${firmContent.id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify({
            data: {
              user: parseInt(session.id),
            },
          }),
        }
      )
      setSuccess(true)
      notify("success", "Sayfa sahipliği alımı başarılı.")
      setTimeout(() => {
        router.push(`/firma/${firmContent.slug}`)
      }, 3000)
    } catch (err) {
      console.error(err)
      notify("error", "Bir sorunla karşılaştık.")
    }
    setLoading(false)
  }
  return (
    <Layout global={global} pageContext={firmContext}>
      <Seo metadata={metadataWithDefaults} others={articleSeoData} />
      <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
          <div className="flex flex-col flex-1 w-full gap-3">
            <div className="flex flex-col p-4">
              <div className="w-full">
                <div className="flex justify-between">
                  <h1 className="font-semibold text-xl text-dark">
                    Sayfa sahiplen
                  </h1>
                  <div className="flex gap-2 mb-6">
                    <div className="flex flex-col">
                      <Link
                        className="w-full bg-midgray hover:bg-midgray/90 text-white rounded p-2 text-sm transition duration-150 ease-out md:ease-in"
                        href={`/firma/${firmContent.slug}`}
                      >
                        <RiArrowGoBackFill className="mr-2 inline-block align-middle w-4 h-4 text-gray-200" />
                        <span>Geri dön</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <article className="flex flex-col NewsContent">
                <p>
                  Bir firma sayfasını sahiplenebilmek için 2 yöntem
                  kullanabilirsiniz.
                </p>
                <ol>
                  <li>
                    Firmaya ait kayıtlı bir web sitesi varsa, bu uzantılı bir
                    e-posta adresi ile üye olunduğu takdirde hızlıca sayfa
                    sahipliği alabilirsiniz.
                    <br /> <Link href={`/hesap/kayit-ol`}>Buradan</Link> üye
                    olabilir ya da üye iseniz{" "}
                    <Link href={`/hesap/giris-yap`}>buradan</Link> giriş
                    yapabilirsiniz.
                  </li>
                  <li>
                    Firma sahipliğini kanıtlayacak herhangi bir resmi belge ile{" "}
                    <a
                      href={`mailto:sayfa.sahiplen@findiktv.com?subject=Sayfa Sahipliği hk.&body=Merhaba, https://www.findiktv.com/firma/${firmContent.slug} adresinin sahipliğini almak istiyorum. Ekteki belge/belgeler bunu kanıtlamaktadır. Teşekkürler...`}
                    >
                      buradan
                    </a>{" "}
                    e-posta ile bizimle iletişime geçerek sayfa sahipliğini elde
                    edebilirsiniz.
                  </li>
                </ol>
              </article>
              {session && firmContent.user.data && (
                <div className="flex flex-col">
                  <p className="text-lg text-warning bg-dark rounded mb-4 px-4 py-2">
                    Kayıtlarımıza göre <strong>{firmContent.name}</strong>{" "}
                    sayfasının sahipliğini başka bir kullanıcıya ait. 2. yöntemi
                    kullanarak sayfa sahipliğini alabilirsiniz.
                  </p>
                </div>
              )}
              {session && !firmContent.user.data && userHasOwnerRight && (
                <div className="flex flex-col">
                  <p className="text-lg text-warning bg-dark rounded mb-4 px-4 py-2">
                    Kayıtlarımıza göre <strong>{firmContent.name}</strong>{" "}
                    sayfasının sahipliğini alma hakkına sahipsiniz. Sayfa
                    sahipliğini almak istiyor musunuz?
                  </p>
                  {success ? (
                    <p className="text-lg text-primary font-bold">
                      Sayfa sahipliğiniz aldınız, birazdan sayfaya
                      yönlendirileceksiniz.
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="disabled:opacity-75 w-full max-w-[200px] bg-secondary hover:bg-secondary/90 text-white rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                      disabled={loading}
                      onClick={() => getOwnership()}
                    >
                      {loading ? (
                        <span role="status">
                          <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                          <span className="sr-only">Kaydediliyor...</span>
                          <span>Kaydediliyor...</span>
                        </span>
                      ) : (
                        <span>İstiyorum</span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  const { params, locale, locales, defaultLocale } = context
  const globalLocale = await getGlobalData(locale)
  const session = await getSession(context)
  const firmData = await getFirmData({
    slug: params.slug,
  })

  const { name, slug, website, user } = firmData.attributes

  let sameDomain = false
  if (session) {
    const [, emailDomain] = session.user.email.split("@")
    sameDomain = website?.includes(emailDomain) || false
  }

  if (session.id === parseInt(user.data?.id)) {
    return {
      redirect: {
        destination: `/firma/${slug}`,
        permanent: false,
      },
    }
  }

  const firmContent = {
    id: firmData.id,
    name,
    slug,
    website,
    user,
  }
  const firmContext = {
    locale,
    locales,
    defaultLocale,
    slug: params.slug,
  }
  if (firmData == null) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      global: globalLocale.data,
      firmContent: firmContent,
      userHasOwnerRight: sameDomain,
      firmContext: {
        ...firmContext,
      },
    },
  }
}

export default FirmAddPrice
