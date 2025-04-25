import { cn } from "@/shared/lib/utils";
import * as React from "react";

const CloudRight = ({ className }: { className: string }) => (
  <svg
    data-name="Layer 3"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 753.08 534.89"
    className={cn(className, "text-[#cccccc] dark:text-[#fff]")}
  >
    <defs>
      <linearGradient
        id="a-cloudRight"
        x1={377.73}
        y1={277.13}
        x2={872.65}
        y2={747.46}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor={"currentColor"} />
        <stop offset={0.48} stopColor={"currentColor"} stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="b-cloudRight"
        x1={226.75}
        y1={178.58}
        x2={913.62}
        y2={831.34}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor={"currentColor"} stopOpacity={0.8} />
        <stop offset={0.34} stopColor={"currentColor"} stopOpacity={0} />
      </linearGradient>
    </defs>
    <path
      d="M257.62 519.05s27-120.75 175.6-117.27c0 0-15.87-147.46 146.02-139.33 0 0 1.04-26.7 63.85-19.74 0 0 4.43-40.86 112.51-33.2V535.3H200.37s22.6-23.22 57.26-16.25Z"
      style={{
        fill: "url(#a-cloudRight)",
      }}
    />
    <path
      d="M8.06 534.89S48.39 410.8 153.84 421.02c0 0-2.39-83.74 61.75-93.96s80.08 69.45 80.08 69.45 40.56-25.53 67.46-14.81c0 0-14.72-138.38 43.87-144.51 0 0-8.81-164.43 128.04-164.94 0 0 89.87 5.62 110.3 103.66 0 0 31.66-69.45 107.74-61.28v420.26z"
      style={{
        fill: "url(#b-cloudRight)",
      }}
    />
  </svg>
);
export default CloudRight;
