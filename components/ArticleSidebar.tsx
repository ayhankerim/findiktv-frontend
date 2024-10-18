import Advertisement from "./Advertisement";
import LatestArticles from "./LatestArticles";
import ModuleLoader from "./ModuleLoader";

const ArticleSidebar = ({ article }: { article: number }) => {
  return (
    <aside className="md:sticky top-0 flex-none w-full md:w-[160px] lg:w-[336px] space-y-4">
      <div className="md:sticky top-0 w-full h-[300px] -mx-2 sm:mx-0 z-10">
        <Advertisement
          position="article-bottom-desktop"
          adformat="horizontal"
        />
      </div>
      <ModuleLoader
        title="İLGİNİZİ ÇEKEBİLİR"
        theme="default"
        component="LatestArticles"
      >
        <LatestArticles
          current={article}
          count={9}
          position="sidebar"
          product={null}
          city={null}
          offset={3}
        />
      </ModuleLoader>
    </aside>
  );
};

export default ArticleSidebar;
