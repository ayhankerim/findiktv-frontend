"use client";
import { useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import CommentHeader from "./CommentHeader";
import CommentView from "./CommentView";
import CommentCountChanger from "./CommentCountChanger";
import { fetchComments } from "@/app/utils/comment-api";
import { CommentsProp } from "@/app/utils/model";

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
  const [comments, setComments] = useState<CommentsProp[]>(commentsInitial);
  const commentListUpdate = async () => {
    try {
      const { data: fetchedComments } = await fetchComments(article);
      setComments(fetchedComments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
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
        commentListUpdate={commentListUpdate}
      />
      <div className="flex flex-col gap-2 mt-4">
        <CommentCountChanger count={count}>
          <h4 className="font-semibold text-base text-midgray">Yorumlar</h4>
        </CommentCountChanger>
        <CommentView comments={comments} slug={slug} article={article} />
        <CommentCountChanger count={count}>
          <span></span>
        </CommentCountChanger>
      </div>
    </div>
  );
};

export default Comments;
