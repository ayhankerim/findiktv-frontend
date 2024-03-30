"use client";
import classNames from "classnames";
import CommentItemHeader from "./CommentItemHeader";
import CommentItemFooter from "./CommentItemFooter";
import CommentSubView from "./CommentSubView";
import CommentAvatar from "./CommentAvatar";
import { scrollToComment, pointedComment } from "@/app/utils/comment-api";
import { CommentsProp } from "@/app/utils/model";
const CommentView: React.FC<{
  comments: CommentsProp[];
  slug: string;
  article: number;
}> = ({ comments, slug, article }) => {
  const pointedCommentId = pointedComment();
  pointedCommentId && scrollToComment(pointedCommentId);
  return (
    <div className="flex flex-col divide-y mt-4">
      {comments.map((comment: CommentsProp, i: number) => {
        const { user } = comment.attributes;
        return (
          <div key={i} className="flex flex-col">
            <article
              id={`comment-${comment.id}`}
              className={classNames(
                user.data?.attributes.blocked
                  ? "line-through text-danger/50"
                  : "",
                pointedCommentId == comment.id ? "bg-point/20 py-4" : "py-2",
                "flex items-start gap-2 transition duration-400 ease-in ease-out"
              )}
            >
              <CommentAvatar {...comment} />
              <div className="flex-auto">
                <CommentItemHeader {...comment} slug={slug} position="footer" />
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
                <CommentItemFooter {...comment} slug={slug} position="footer" />
                {comment.attributes.thread_ons.data.length > 0 && (
                  <div className="flex flex-col divide-y border-t mt-4">
                    {comment.attributes.thread_ons.data.map(
                      (item: CommentsProp, b: number) => (
                        <CommentSubView key={b} {...item} slug={slug} />
                      )
                    )}
                  </div>
                )}
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
};

export default CommentView;
