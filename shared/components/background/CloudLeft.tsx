import { cn } from "@/shared/lib/utils";
import * as React from "react";

const CloudLeft = ({ className }: { className: string }) => (
  <svg
    data-name="Layer 3"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 823.48 369.38"
    className={cn(className, "text-[#cccccc] dark:text-[#fff]")}
  >
    <defs>
      <linearGradient
        id="a-cloudLeft"
        x1={489.54}
        y1={41.15}
        x2={105.86}
        y2={421.7}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor={"currentColor"} />
        <stop offset={1} stopColor={"currentColor"} stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="b-cloudLeft"
        x1={531.52}
        y1={70.4}
        x2={-45.63}
        y2={646.9}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor={"currentColor"} stopOpacity={0.8} />
        <stop offset={0.47} stopColor={"currentColor"} stopOpacity={0} />
      </linearGradient>
    </defs>
    <path
      d="M-5.08 158.29s175.11-24.78 207.51 89.57c0 0 228.89-51.46 247.85 91.48 0 0 83.76-23.51 85.03 29.86H-5.08z"
      style={{
        fill: "url(#a-cloudLeft)",
      }}
    />
    <path
      d="M0 19.92s76.94.57 84.4 66.37c0 0 43.78-66.37 115.97-20.52 0 0 28.4-78.44 100.59-54.3s92.3 97.75 98.22 125.5c0 0 145.55-42.24 177.51 100.16h46.61s54.44-4.83 60.35 36.2c0 0 68.64-14.48 81.65 39.82 0 0 43.78 4.83 50.89 54.3H0z"
      style={{
        fill: "url(#b-cloudLeft)",
      }}
    />
  </svg>
);
export default CloudLeft;
