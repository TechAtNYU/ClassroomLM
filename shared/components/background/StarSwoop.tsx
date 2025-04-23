import { cn } from "@/shared/lib/utils";
import * as React from "react";
const StarSwoop = ({ className }: { className: string }) => (
  <svg
    className={cn(
      "fill-[#fff89c]",
      "[filter:drop-shadow(0_0_3px_gray)_drop-shadow(0_0_30px_gray)]",
      "dark:[filter:drop-shadow(0_0_3px_white)_drop-shadow(0_0_30px_white)_drop-shadow(0_0_200px_white)]",
      className
    )}
    xmlns="http://www.w3.org/2000/svg"
    width={1080}
    height={1080}
    viewBox="0 0 1080 1080"
    xmlSpace="preserve"
    // filter={"drop-shadow(0 0 3px white) drop-shadow(0 0 30px white) drop-shadow(0 0 200px white)"}
  >
    {/* <rect width="100%" height="100%" fill="transparent" />

    <g transform="translate(540 540)" />
    <g transform="translate(540 540)" /> */}
    <path
      style={{
        stroke: "none",
        strokeWidth: 1,
        strokeDasharray: "none",
        strokeLinecap: "butt",
        strokeDashoffset: 0,
        strokeLinejoin: "miter",
        strokeMiterlimit: 4,
        fillRule: "nonzero",
        opacity: 1,
      }}
      vectorEffect="non-scaling-stroke"
      //   filter={"drop-shadow(0 0 50px white)"}
      //   className="drop-shadow-xl drop-shadow-white"
      //   filter={"url(#shadow2)"}
      transform="translate(-30.544 329.179)scale(1.37)"
      d="M80.53 108.43s321.66-194.64 710.05 6.55c0 0-377.15-254.3-710.05-6.55"
    />
    <path
      style={{
        stroke: "none",
        strokeWidth: 1,
        strokeDasharray: "none",
        strokeLinecap: "butt",
        strokeDashoffset: 0,
        strokeLinejoin: "miter",
        strokeMiterlimit: 4,
        fillRule: "nonzero",
        opacity: 1,
      }}
      //   filter={"drop-shadow(0 0 100px white)"}
      vectorEffect="non-scaling-stroke"
      transform="rotate(33.9 -600.657 330.312)scale(7.42)"
      d="m7.501 0-2 4.999H.502l3.999 3.499-2 5.999L7.5 10.998l4.999 3.499-2-5.999L14.5 4.999H9.501z"
    />
  </svg>
);
export default StarSwoop;
