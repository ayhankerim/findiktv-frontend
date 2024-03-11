import React from "react";

interface AdvertisementProps {
  position: string;
  adformat: string | "auto";
}

const Advertisement: React.FC<AdvertisementProps> = ({
  position,
  adformat,
}) => {
  return (
    <div className="flex items-center justify-center bg-midgray h-full text-white">
      REKLAM
    </div>
  );
};

export default Advertisement;
