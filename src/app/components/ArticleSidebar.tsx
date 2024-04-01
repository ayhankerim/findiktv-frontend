import Advertisement from "./Advertisement";

const ArticleSidebar = ({ article }: { article: number }) => {
  return (
    <aside className="sticky top-2 flex-none w-full md:w-[160px] lg:w-[336px]">
      <Advertisement position="article-bottom-desktop" adformat="horizontal" />
    </aside>
  );
};

export default ArticleSidebar;
