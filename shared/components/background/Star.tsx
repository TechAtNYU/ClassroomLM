import { cn } from "@/shared/lib/utils";
import * as React from "react";
const Star = ({ className }: { className: string }) => (
  <svg
    className={cn(
      "fill-[#fff89c]",
      "[filter:drop-shadow(0_0_3px_gray)_drop-shadow(0_0_30px_gray)]",
      "dark:[filter:drop-shadow(0_0_3px_white)_drop-shadow(0_0_30px_white)_drop-shadow(0_0_200px_white)]",
      className
    )}
    xmlns="http://www.w3.org/2000/svg"
    // width={256}
    // height={256}
    // viewBox="0 0 256 256"
    // xmlSpace="preserve"
    // filter={"drop-shadow(0 0 3px white) drop-shadow(0 0 30px white) drop-shadow(0 0 200px white)"}
  >
    <path d="M96.08 60.76c-26.53 0-48.03 27.2-48.04 60.76 0-33.56-21.51-60.76-48.05-60.76 26.53 0 48.03-27.2 48.04-60.76 0 33.56 21.51 60.76 48.05 60.76" />
  </svg>
);
export default Star;
