import React from "react";

interface RichTextProps {
  data: {
    content: string;
  };
}

const RichText: React.FC<RichTextProps> = ({ data }) => {
  return (
    <article
      className="NewsContent text-base py-4"
      dangerouslySetInnerHTML={{ __html: data.content }}
    />
  );
};

export default RichText;
