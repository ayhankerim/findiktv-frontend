//import LatestArticles from "@/components/elements/latest-articles"
import Advertisement from "@/components/elements/advertisement"
import dynamic from "next/dynamic"

const ArticleSidebar = ({ articleId }) => {
  const LatestArticles = dynamic(
    () => import("@/components/elements/latest-articles"),
    {
      loading: () => <p>Yükleniyor...</p>,
      ssr: false,
    }
  )
  return (
    <aside className="sticky top-2 flex-none w-full md:w-[160px] lg:w-[336px]">
      <Advertisement position="sidebar-top-desktop" />
      <LatestArticles
        current={articleId}
        count={6}
        offset={3}
        position="sidebar"
        product={null}
        city={null}
      />
      <Advertisement position="sidebar-bottom-desktop" />
    </aside>
  )
}

export default ArticleSidebar
