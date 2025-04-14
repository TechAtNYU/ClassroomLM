"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { RagFlowMessage } from "@shared/lib/ragflow/chat/chat-client";

interface AutoScrollProps {
  children: React.ReactNode;
  messages: RagFlowMessage[];
}

export default function AutoScroll({ children, messages }: AutoScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
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
