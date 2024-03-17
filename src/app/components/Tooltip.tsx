"use client";
import { useRef, ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  tooltipText: string;
  orientation?: "top" | "left" | "right" | "bottom";
  version?: "clean";
}

const Tooltip = ({
  children,
  tooltipText,
  orientation = "right",
  version,
}: TooltipProps) => {
  const tipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (tipRef.current) tipRef.current.style.opacity = "1";
  };

  const handleMouseLeave = () => {
    if (tipRef.current) tipRef.current.style.opacity = "0";
  };

  const setContainerPosition = (orientation: string) => {
    switch (orientation) {
      case "right":
        return "top-0 left-full ml-4";
      case "left":
        return "top-0 right-full mr-4";
      case "top":
        return "bottom-full left-[50%] translate-x-[-50%] -translate-y-2";
      case "bottom":
        return "top-full left-[50%] translate-x-[-50%] translate-y-2";
      default:
        return "";
    }
  };

  const setPointerPosition = (orientation: string) => {
    switch (orientation) {
      case "right":
        return "left-[-6px]";
      case "left":
        return "right-[-6px]";
      case "top":
      case "bottom":
        return "top-full left-[50%] translate-x-[-50%] -translate-y-2";
      default:
        return "";
    }
  };

  const classContainer = `w-max absolute z-10 ${setContainerPosition(
    orientation
  )} bg-gray-600 text-white text-sm px-2 py-1 rounded flex items-center transition-all duration-150 pointer-events-none`;

  const pointerClasses = `bg-gray-600 h-3 w-3 absolute z-10 ${setPointerPosition(
    orientation
  )} rotate-45 pointer-events-none`;

  return (
    <div
      className={`relative ${
        version === "clean"
          ? "inline-block"
          : "flex items-center justify-center"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={classContainer} style={{ opacity: 0 }} ref={tipRef}>
        <div className={pointerClasses} />
        {tooltipText}
      </div>
      {children}
    </div>
  );
};

export default Tooltip;
