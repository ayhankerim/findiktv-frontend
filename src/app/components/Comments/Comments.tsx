import dynamic from "next/dynamic";
import { CommentsProp } from "@/app/utils/model";

interface ArticleCommentsProps {
  article: number;
  slug: string;
  count: number;
  data: {
    data: CommentsProp[];
  };
}
const Loader = ({ cssClass }: any) => (
  <div className={`lds-ellipsis ${cssClass}`}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);
const CommentHeader = dynamic(() => import("./CommentHeader"), {
  loading: () => <Loader />,
});
const CommentView = dynamic(() => import("./CommentView"), {
  loading: () => <Loader />,
});
const CommentCountChanger = dynamic(() => import("./CommentCountChanger"), {
  loading: () => <Loader />,
  ssr: false,
});
const Comments: React.FC<ArticleCommentsProps> = ({
  article,
  slug,
  count,
  data: commentsInitial,
}: ArticleCommentsProps) => {
  return (
    <div id="comments" className="commentSection mb-4">
      <CommentHeader />
      <div className="flex flex-col gap-2 mt-4">
        <CommentCountChanger count={count}>
          <h4 className="font-semibold text-base text-midgray">Yorumlar</h4>
        </CommentCountChanger>
        <CommentView
          commentsInitial={commentsInitial.data}
          slug={slug}
          article={article}
        />
        <CommentCountChanger count={count}>
          <span></span>
        </CommentCountChanger>
      </div>
    </div>
  );
};

export default Comments;
