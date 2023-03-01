import LatestArticles from "@/components/elements/latest-articles"
import Advertisement from "@/components/elements/advertisement"

const ArticleSidebar = ({ articleId, advertisement }) => {
  return (
    <aside className="sticky top-2 flex-none w-full md:w-[160px] lg:w-[336px]">
      <Advertisement position="sidebar-top-desktop" />
      <LatestArticles
        current={articleId}
        count={6}
        offset={3}
        position="sidebar"
      />
      <Advertisement position="sidebar-bottom-desktop" />
    </aside>
  )
}

export default ArticleSidebar
