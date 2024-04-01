import classNames from "classnames";
import { TbPoint } from "react-icons/tb";
import { commentLimits } from "@/app/utils/comment-api";

const CommentCountChanger: React.FC<{
  count: number;
  commentLimit: number;
  commentLimitFunc: (limit: number) => void;
  children: React.ReactNode;
}> = ({ count, commentLimit, commentLimitFunc, children }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-end border-b border-midgray">
      {children}
      <div className="flex flex-col md:flex-row text-center">
        {count > 5 && (
          <div className="flex flex-row gap-2 mr-4 font-light text-sm text-midgray">
            Son
            <ul className="flex items-center gap-1 text-secondary">
              {commentLimits.limits
                .filter((limits) => count >= limits)
                .map((limit: number, i: number, limits: any) => (
                  <li className="flex items-center gap-2" key={limit}>
                    <button
                      className={classNames(
                        commentLimit === limit
                          ? "bg-secondary text-white px-2 rounded-t"
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
