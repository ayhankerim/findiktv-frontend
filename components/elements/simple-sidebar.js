import Advertisement from "@/components/elements/advertisement"
import ModuleLoader from "@/components/elements/module-loader"
import dynamic from "next/dynamic"

const Loader = ({ cssClass }) => (
  <div className={`lds-ellipsis ${cssClass}`}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)

const SimpleSidebar = ({ articleId }) => {
  const ArticleMostVisited = dynamic(
    () => import("@/components/elements/article/articles-most-visited"),
    {
      loading: () => <Loader cssClass="h-[25px]" />,
      ssr: false,
    }
  )
  const LatestComments = dynamic(
    () => import("@/components/elements/comments/latest-comments"),
    {
      loading: () => <Loader cssClass="h-[25px]" />,
      ssr: false,
    }
  )
  return (
    <aside className="sticky top-2 flex-none w-full md:w-[336px] lg:w-[250px] xl:w-[336px]">
      <Advertisement position="sidebar-top-desktop" />
      <ModuleLoader
        title="ÖNE ÇIKANLAR"
        theme="red"
        component="ArticleMostVisited"
      >
        <ArticleMostVisited size={5} slug={null} />
      </ModuleLoader>
      <ModuleLoader
        title="SON YORUMLAR"
        theme="default"
        component="LatestComments"
      >
        <LatestComments size={5} position="sidebar" offset={0} />
      </ModuleLoader>
      <Advertisement position="sidebar-bottom-desktop" />
    </aside>
  )
}

export default SimpleSidebar
