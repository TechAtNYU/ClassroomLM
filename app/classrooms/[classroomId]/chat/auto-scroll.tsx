"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useEffect, useRef } from "react";

interface AutoScrollProps {
  children: React.ReactNode;
  isMessageSent: boolean;
}

export default function AutoScroll({
  children,
  isMessageSent,
}: AutoScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMessageSent) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isMessageSent]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <ScrollArea className="h-[400px] flex-1 overflow-auto">
      <div className="flex flex-col gap-2 p-2">
        {children}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
