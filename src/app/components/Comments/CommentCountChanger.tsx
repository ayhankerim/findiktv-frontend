"use client";
import classNames from "classnames";
import { useState } from "react";
import { TbPoint } from "react-icons/tb";

interface CommentCountChangerProp {
  count: number;
  children: React.ReactNode;
}

const CommentCountChanger: React.FC<CommentCountChangerProp> = ({
  count,
  children,
}: CommentCountChangerProp) => {
  const [commentLimit, setCommentLimit] = useState(5);
  const commentLimitFunc = (limit: number) => {
    setCommentLimit(limit);
  };
  return (
    <div className="flex flex-col md:flex-row justify-between items-end border-b border-midgray">
      {children}
      <div className="flex flex-col md:flex-row text-center">
        {count > 5 && (
          <div className="flex flex-row gap-2 mr-4 font-light text-sm text-midgray">
            Son
            <ul className="flex items-center gap-1 text-secondary">
              {[5, 15, 25, 50, 100]
                .filter((limits) => count >= limits)
                .map((limit: number, i: number, limits: any) => (
                  <li className="flex items-center gap-2" key={limit}>
                    <button
                      className={classNames(
                        commentLimit === limit
                          ? "bg-secondary text-white px-2"
                          : "hover:underline",
                        ""
                      )}
                      onClick={() => commentLimitFunc(limit)}
                    >
                      {limit}
                    </button>
                    {i + 1 != limits.length && (
                      <TbPoint className="text-midgray" />
                    )}
                  </li>
                ))}
            </ul>
            yorum göster
          </div>
        )}
        <div className="font-semibold text-sm text-midgray">{count} yorum</div>
      </div>
    </div>
  );
};

export default CommentCountChanger;
