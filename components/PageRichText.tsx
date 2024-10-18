import React from "react";

interface RichTextProps {
  data: {
    content: string;
  };
}

const RichText: React.FC<RichTextProps> = ({ data }) => {
  return (
    <article
      className="container NewsContent py-12 text-base bg-white"
      dangerouslySetInnerHTML={{ __html: data.content }}
    />
  );
};

export default RichText;
