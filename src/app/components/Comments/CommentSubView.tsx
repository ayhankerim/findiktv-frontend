import { scrollToComment, pointedComment } from "@/app/utils/comment-api";
import { CommentsProp } from "@/app/utils/model";
import CommentAvatar from "./CommentAvatar";
import CommentItemHeader from "./CommentItemHeader";
import CommentItemFooter from "./CommentItemFooter";
import classNames from "classnames";

const CommentSubView: React.FC<CommentsProp & { slug: string }> = (
  comment: CommentsProp & { slug: string }
) => {
  const pointedCommentId = pointedComment();
  pointedCommentId && scrollToComment(pointedCommentId);
  const { user } = comment.attributes;
  return (
    <div className="flex flex-col">
      <article
        id={`comment-${comment.id}`}
        className={classNames(
          user.data?.attributes.blocked ? "line-through text-danger/50" : "",
          pointedCommentId == comment.id ? "bg-point/20 py-4" : "py-2",
          "flex items-start gap-2 transition duration-400 ease-in ease-out"
        )}
      >
        <CommentAvatar {...comment} />
        <div className="flex-auto">
          <CommentItemHeader
            {...comment}
            slug={comment.slug}
            position="footer"
          />
          {comment.attributes.approvalStatus === "ignored" ? (
            <div
              className="line-through text-darkgray/60 text-base mb-1"
              dangerouslySetInnerHTML={{
                __html: "BU YORUM KALDIRILMIŞTIR!",
              }}
            />
          ) : (
            <div
              className="text-darkgray text-base mb-1"
              dangerouslySetInnerHTML={{
                __html: comment.attributes.content,
              }}
            />
          )}
          <CommentItemFooter
            {...comment}
            slug={comment.slug}
            position="footer"
          />
        </div>
      </article>
    </div>
  );
};

export default CommentSubView;
