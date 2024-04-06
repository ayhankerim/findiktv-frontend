import classNames from "classnames";
import Moment from "moment";
import CommentItemHeader from "@/app/components/Comments/CommentItemHeader";
import CommentItemFooter from "@/app/components/Comments/CommentItemFooter";
import CommentSubView from "@/app/components/Comments/CommentSubView";
import CommentAvatar from "@/app/components/Comments/CommentAvatar";
import { scrollToComment, pointedComment } from "@/app/utils/comment-api";
import { CommentsProp } from "@/app/utils/model";
import "moment/locale/tr";
interface CommentItemViewProps {
  comment: CommentsProp;
  parent: number | null;
  slug: string;
  article: number;
  commentLimit: number;
  commentLimitFunc: (limit: number) => void;
}

export const CommentItemView = ({
  comment,
  parent,
  slug,
  article,
  commentLimit,
  commentLimitFunc,
}: CommentItemViewProps) => {
  const { user, createdAt } = comment.attributes;
  const pointedCommentId = pointedComment();
  pointedCommentId && scrollToComment(pointedCommentId);
  return (
    <div className="flex flex-col">
      <article
        id={`comment-${comment.id}`}
        className={classNames(
          user.data?.attributes.blocked ? "line-through text-danger/50" : "",
          pointedCommentId == String(comment.id) ||
            Moment(createdAt).isAfter(Moment().subtract(10, "minutes"))
            ? "bg-point/20 py-4"
            : "py-2",
          "flex items-start gap-2 transition duration-400 ease-in ease-out"
        )}
      >
        <CommentAvatar {...comment} />
        <div className="flex-auto">
          <CommentItemHeader {...comment} slug={slug} position="footer" />
          {comment.attributes.approvalStatus === "ignored" ? (
            <div
              className="line-through text-darkgray/60 text-base my-2"
              dangerouslySetInnerHTML={{
                __html: "BU YORUM KALDIRILMIŞTIR!",
              }}
            />
          ) : (
            <div
              className="text-darkgray text-base my-2"
              dangerouslySetInnerHTML={{
                __html: comment.attributes.content,
              }}
            />
          )}
          <CommentItemFooter
            article={article}
            parent={parent}
            comment={comment}
            commentLimit={commentLimit}
            commentLimitFunc={commentLimitFunc}
          />
          {comment.attributes.thread_ons?.data.length > 0 && (
            <div className="flex flex-col divide-y border-t mt-4">
              <CommentSubView
                comments={comment.attributes.thread_ons.data}
                parent={comment.id}
                slug={slug}
                article={article}
                commentLimit={commentLimit}
                commentLimitFunc={commentLimitFunc}
              />
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

const CommentView: React.FC<{
  comments: CommentsProp[];
  slug: string;
  article: number;
  commentLimit: number;
  commentLimitFunc: (limit: number) => void;
}> = ({ comments, slug, article, commentLimit, commentLimitFunc }) => {
  return (
    <div className="flex flex-col divide-y mt-4">
      {comments.map((comment: CommentsProp, i: number) => {
        return (
          <CommentItemView
            comment={comment}
            parent={null}
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

export default CommentView;
