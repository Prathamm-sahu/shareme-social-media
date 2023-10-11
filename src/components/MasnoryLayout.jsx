import React from "react";
import Masonry from "react-masonry-css";
import { Pin } from "./Pin";

const breakPointObj = {
  default: 4,
  3000: 6,
  2000: 5,
  1200: 3,
  1000: 2,
  500: 1,
};

export const MasnoryLayout = ({ pins, save }) => {

  

  return (
    <Masonry className="flex animate-slide-fwd" breakpointCols={breakPointObj}>
      {pins?.map((pin) => {
        return <Pin key={pin.postId} pin={pin} className="w-max" />;
      })}
    </Masonry>
  );
};
