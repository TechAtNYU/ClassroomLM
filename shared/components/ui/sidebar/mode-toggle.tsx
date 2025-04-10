"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { TooltipUtil } from "@/app/classrooms/clientUtils";

// import { Button } from "@shared/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@shared/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    // styled after sonner docs
    <div className="flex w-fit flex-row gap-2 rounded-xl border-2 border-sidebar-accent px-3 py-2 text-sidebar-accent">
      <TooltipUtil
        trigger={
          <Sun
            onClick={() => setTheme("light")}
            data-active={theme === "light"}
            className="fill-side-bar-accent text-sidebar-accent hover:fill-foreground hover:text-foreground data-[active=true]:fill-foreground data-[active=true]:text-foreground"
          />
        }
        content={"Light mode"}
        delayDuration={0}
      />
      {/* //className="h-[1.2rem] w-[1.2rem]" /> */}
      <TooltipUtil
        trigger={
          <Moon
            onClick={() => setTheme("dark")}
            data-active={theme === "dark"}
            className="fill-side-bar-accent text-sidebar-accent hover:fill-foreground hover:text-foreground data-[active=true]:fill-foreground data-[active=true]:text-foreground"
          />
        }
        content={"Dark"}
        delayDuration={0}
      />
      {/* className="h-[1.2rem] w-[1.2rem]" /> */}
      <TooltipUtil
        trigger={
          <Laptop
            onClick={() => setTheme("system")}
            data-active={theme === "system"}
            className="fill-side-bar-accent text-sidebar-accent hover:fill-foreground hover:text-foreground data-[active=true]:fill-foreground data-[active=true]:text-foreground"
          />
        }
        content={"System"}
        delayDuration={0}
      />
    </div>
  );
  // return (
  //   <DropdownMenu>
  //     <DropdownMenuTrigger asChild>
  //     {/* <button
  //     className="text-current p-2 cursor-pointer focus:ring outline-none"
  //     onClick={() => setTheme("light")}
  //     aria-label="Toggle theme"
  //     onKeyDown={e => {
  //       if (e.key === 'Enter') setTheme("light")
  //     }}
  //   > */}
  //     {/* { theme === 'dark' ? (
  //       <svg
  //         fill="none"
  //         viewBox="0 0 24 24"
  //         width="24"
  //         height="24"
  //         stroke="currentColor"
  //         aria-hidden="true"
  //       >
  //         <path
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth={2}
  //           d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
  //         />
  //       </svg>
  //     ) :  theme === 'light' ? (
  //       <svg
  //         fill="none"
  //         viewBox="0 0 24 24"
  //         width="24"
  //         height="24"
  //         stroke="currentColor"
  //         aria-hidden="true"
  //       >
  //         <path
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth={2}
  //           d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
  //         />
  //       </svg>
  //     ) : (
  //       <svg
  //         key="undefined"
  //         viewBox="0 0 24 24"
  //         width="24"
  //         height="24"
  //         stroke="currentColor"
  //         strokeWidth="1.5"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         fill="none"
  //         shapeRendering="geometricPrecision"
  //         aria-hidden="true"
  //       ></svg>
  //     )}
  //   </button> */}
  //       {/* <Button variant="outline" size="icon">
  //         <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 text-foreground transition-all dark:-rotate-90 dark:scale-0" />
  //         <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
  //         <span className="sr-only">Toggle theme</span>
  //       </Button> */}
  //     </DropdownMenuTrigger>
  //     <DropdownMenuContent align="end">
  //       <DropdownMenuItem onClick={() => setTheme("light")}>
  //         Light
  //       </DropdownMenuItem>
  //       <DropdownMenuItem onClick={() => setTheme("dark")}>
  //         Dark
  //       </DropdownMenuItem>
  //       <DropdownMenuItem onClick={() => setTheme("system")}>
  //         System
  //       </DropdownMenuItem>
  //     </DropdownMenuContent>
  //   </DropdownMenu>
  // );
}
