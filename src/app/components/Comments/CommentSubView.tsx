import { CommentsProp } from "@/app/utils/model";
import { CommentItemView } from "./CommentView";

const CommentSubView: React.FC<{
  comments: CommentsProp[];
  parent: number;
  slug: string;
  article: number;
  commentLimit: number;
  commentLimitFunc: (limit: number) => void;
}> = ({ comments, parent, slug, article, commentLimit, commentLimitFunc }) => {
  return (
    <div className="flex flex-col divide-y mt-4 -ml-8 lg:-ml-4">
      {comments.map((comment: CommentsProp, i: number) => {
        return (
          <CommentItemView
            comment={comment}
            parent={parent}
            slug={slug}
            article={article}
            commentLimit={commentLimit}
            commentLimitFunc={commentLimitFunc}
            key={i}
          />
        );
      })}
    </div>
  );
};

export default CommentSubView;
