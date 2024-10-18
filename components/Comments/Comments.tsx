"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CommentForm from "@/components/Comments/CommentForm";
import CommentHeader from "@/components/Comments/CommentHeader";
import CommentCountChanger from "@/components/Comments/CommentCountChanger";
import { commentLimits, fetchComments } from "@/utils/comment-api";
import { CommentsProp } from "@/utils/model";
import Loader from "@/components/Loader";

const CommentView = dynamic(
  () => import("@/components/Comments/CommentView"),
  {
    loading: () => <Loader cssClass="h-[250px] w-full" />,
  }
);

interface ArticleCommentsProps {
  article: number;
  slug: string;
  count: number;
  data: CommentsProp[];
}
const Comments: React.FC<ArticleCommentsProps> = ({
  article,
  slug,
  count,
  data: commentsInitial,
}: ArticleCommentsProps) => {
  const [comments, setComments] = useState<CommentsProp[]>([]);
  const [commentLimit, setCommentLimit] = useState(commentLimits.limits[0]);
  const commentLimitFunc = (limit: number) => {
    setCommentLimit(limit);
    commentListUpdate(limit);
  };
  const commentListUpdate = async (limit: number) => {
    try {
      const { data } = await fetchComments(article, limit);
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  const commentReply = () => {};
  useEffect(() => {
    setComments(commentsInitial);
  }, [setComments]);
  return (
    <div id="comments" className="commentSection mb-4">
      <CommentHeader />
      <CommentForm
        cancelButton={false}
        article={article}
        product={null}
        city={null}
        replyto={null}
        threadOf={null}
        commentLimit={commentLimit}
        commentLimitFunc={commentLimitFunc}
        commentReply={commentReply}
      />
      <div className="flex flex-col gap-2 mt-4">
        <CommentCountChanger
          count={count}
          commentLimit={commentLimit}
          commentLimitFunc={commentLimitFunc}
        >
          <h4 className="font-semibold text-base text-midgray">Yorumlar</h4>
        </CommentCountChanger>
        <CommentView
          comments={comments}
          slug={slug}
          article={article}
          commentLimit={commentLimit}
          commentLimitFunc={commentLimitFunc}
        />
        <CommentCountChanger
          count={count}
          commentLimit={commentLimit}
          commentLimitFunc={commentLimitFunc}
        >
          <span></span>
        </CommentCountChanger>
      </div>
    </div>
  );
};

export default Comments;
