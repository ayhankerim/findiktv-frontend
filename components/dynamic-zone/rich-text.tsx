"use client";
import React from "react";

export const RichText = ({ content }: { content: string }) => {
  return (
    <article
      className="container NewsContent py-12 text-base bg-white"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
