"use client";
import React, { useEffect, useState } from "react";
import { MdAddChart } from "react-icons/md";
import { AiOutlineCalculator, AiOutlineComment } from "react-icons/ai";
import {
  MdOutlineWhatshot,
  MdOutlineArticle,
  MdOutlineEmojiEmotions,
} from "react-icons/md";

interface ModuleLoaderProps {
  title: string;
  theme: string;
  component: string;
  children: React.ReactNode;
}

function classNames(...classes: (string | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

const IconSelector: React.FC<{ icon: string }> = ({ icon }) => {
  switch (icon) {
    case "AddPrice":
      return <MdAddChart className="text-lg text-midgray" />;
    case "EfficiencyCalculation":
      return <AiOutlineCalculator className="text-lg text-midgray" />;
    case "LatestComments":
      return <AiOutlineComment className="text-lg text-midgray" />;
    case "LatestArticles":
      return <MdOutlineArticle className="text-lg text-midgray" />;
    case "ArticleMostVisited":
      return <MdOutlineWhatshot className="text-xl text-danger" />;
    case "ArticleReaction":
      return <MdOutlineEmojiEmotions className="text-xl text-midgray" />;
    default:
      return null;
  }
};

const ModuleLoader: React.FC<ModuleLoaderProps> = ({
  title,
  theme,
  component,
  children,
}) => {
  const [coloring, setColors] = useState<string[]>([]);
  useEffect(() => {
    if (theme === "default") {
      setColors(["border-secondary/20", "bg-secondary/60"]);
    } else if (theme === "red") {
      setColors(["border-danger/40", "bg-danger/80"]);
    } else if (theme === "green") {
      setColors(["border-primary/40", "bg-primary/80"]);
    }
  }, [theme]);
  return (
    <div id={component}>
      <div
        className={classNames(
          coloring[0],
          "flex flex-row items-center justify-between border-b relative"
        )}
      >
        <h2 className="font-semibold text-base text-midgray">{title}</h2>
        <IconSelector icon={component} />
        <span
          className={classNames(
            coloring[1],
            "absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px]"
          )}
        ></span>
      </div>
      <div className="mt-5 md:col-span-2 md:mt-0 mb-8">{children}</div>
    </div>
  );
};

export default ModuleLoader;
