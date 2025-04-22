import { cn } from "@/shared/lib/utils";
import * as React from "react";
const Balloon = ({
  className,
  linGradA = (
    <>
      <stop offset={0} stopColor="#d4ffff" />
      <stop offset={0.54} stopColor="#2e88cc" />
      <stop offset={1} stopColor="#0d1a7c" />
    </>
  ),
  linGradB = (
    <>
      <stop offset={0} stopColor="#c1aa76" />
      <stop offset={0.55} stopColor="#7a4d20" />
    </>
  ),
}: {
  className: string;
  linGradA?: React.ReactNode;
  linGradB?: React.ReactNode;
}) => (
  <svg
    data-name="Layer 2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 324 382.6"
    className={cn("", className)}
  >
    <defs>
      <linearGradient
        id="a"
        x1={22.29}
        y1={67.91}
        x2={271.97}
        y2={238.26}
        gradientUnits="userSpaceOnUse"
      >
        {linGradA}
      </linearGradient>
      <linearGradient
        id="b"
        x1={129.78}
        y1={361.92}
        x2={194.22}
        y2={361.92}
        gradientUnits="userSpaceOnUse"
      >
        {linGradB}
      </linearGradient>
    </defs>
    <g data-name="Layer 3">
      <path
        d="M162 0C72.53 0 0 62.73 0 140.13c0 1.02 0 2.05.04 3.08v.03C1 181.2 19.4 215.44 48.6 240.2c.17.14.34.29.51.43.74.62 1.49 1.24 2.25 1.85.57.46 1.14.91 1.72 1.37.2.15.41.32.61.47.28.22.56.43.84.66 57.4 44.78 74.24 69.06 74.24 69.06h.04l5.96 32.2h56.46l5.24-32.64c2.4-3.41 19.8-26.87 71.55-67.51a.24.24 0 0 1 .08-.06c.72-.57 1.45-1.14 2.18-1.71 2.32-1.8 4.53-3.62 6.66-5.45q.675-.585 1.32-1.17c27.41-24.42 44.62-57.46 45.69-93.96v-.07c.03-1.17.05-2.36.05-3.54C324 62.73 251.47 0 162 0m24.97 341.24h-48.04l-5.04-27.2-.18-.99h57.79l-.16.99z"
        style={{
          fill: "url(#a)",
        }}
      />
      <path
        d="M135.62 341.24h52.77c3.94 0 6.74 3.82 5.56 7.58l-9.35 29.7a5.83 5.83 0 0 1-5.56 4.08h-33a5.82 5.82 0 0 1-5.5-3.9L130.12 349c-1.33-3.79 1.48-7.76 5.5-7.76"
        style={{
          fill: "url(#b)",
        }}
      />
    </g>
  </svg>
);

export const PurpleBalloon = ({ className }: { className: string }) => (
  <Balloon
    linGradA={
      <>
        <stop offset="0" stopColor="#edd2ff" />
        <stop offset=".54" stopColor="#722cce" />
        <stop offset="1" stopColor="#1d0754" />
      </>
    }
    linGradB={
      <>
        <stop offset="0" stopColor="#c1aa76" />
        <stop offset=".55" stopColor="#7a4d20" />
      </>
    }
    className={className}
  />
);
export const GreenBalloon = ({ className }: { className: string }) => (
  <Balloon
    linGradA={
      <>
        <stop offset=".06" stopColor="#aeffec" />
        <stop offset=".4" stopColor="#33ccba" />
        <stop offset="1" stopColor="#0a6066" />
      </>
    }
    linGradB={
      <>
        <stop offset="0" stopColor="#c1aa76" />
        <stop offset=".55" stopColor="#7a4d20" />
      </>
    }
    className={className}
  />
);

export default Balloon;
