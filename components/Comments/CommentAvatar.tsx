import Image from "next/image";
import { MdPerson } from "react-icons/md";
import { CommentsProp } from "@/utils/model";

const CommentAvatar: React.FC<CommentsProp> = (comment: CommentsProp) => {
  const { user } = comment.attributes;
  return (
    <div className="flex-none w-[55px] h-[55px] relative">
      {user.data?.attributes.avatar.data ||
      user.data?.attributes.SystemAvatar.data ? (
        <Image
          className="rounded"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
          }}
          src={
            user.data.attributes.avatar.data?.attributes.formats.thumbnail
              .url ||
            user.data.attributes.SystemAvatar.data?.attributes.image.data
              .attributes.url
          }
          alt={user.data.attributes.username}
        />
      ) : (
        <MdPerson style={{ width: 55, height: 55 }} />
      )}
    </div>
  );
};

export default CommentAvatar;
