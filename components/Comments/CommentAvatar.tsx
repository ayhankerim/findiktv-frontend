import Image from "next/image";
import { MdPerson } from "react-icons/md";
import { CommentsProp } from "@/utils/model";

const CommentAvatar: React.FC<CommentsProp> = (comment: CommentsProp) => {
  const { user } = comment;
  return (
    <div className="flex-none w-[55px] h-[55px] relative">
      {user.data?.avatar.data || user.data?.SystemAvatar.data ? (
        <Image
          className="rounded"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
          }}
          src={
            user.data.avatar.data?.formats.thumbnail.url ||
            user.data.SystemAvatar.data?.image.data.url
          }
          alt={user.data.username}
        />
      ) : (
        <MdPerson style={{ width: 55, height: 55 }} />
      )}
    </div>
  );
};

export default CommentAvatar;
