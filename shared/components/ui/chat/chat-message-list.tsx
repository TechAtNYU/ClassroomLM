import * as React from "react";
import { ScrollArea } from "../scroll-area";
import { useAutoScroll } from "./hooks/useAutoScroll";
import { Button } from "../button";
import { ArrowDown } from "lucide-react";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, children, smooth = false, ...props }, _ref) => {
    const {
      scrollRef,
      isAtBottom,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      autoScrollEnabled,
      scrollToBottom,
      disableAutoScroll,
    } = useAutoScroll({
      smooth,
      content: children,
    });

    return (
      <div className="relative h-full w-full">
        <ScrollArea
          className={`flex h-full w-full flex-col overflow-y-auto p-4 ${className}`}
          ref={scrollRef}
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          {...props}
          dir="ltr"
        >
          <div className="flex flex-col gap-6">{children}</div>
        </ScrollArea>

        {!isAtBottom && (
          <Button
            onClick={() => {
              scrollToBottom();
            }}
            size="icon"
            variant="outline"
            className="absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 transform rounded-full shadow-md"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
