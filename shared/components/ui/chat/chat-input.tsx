import * as React from "react";
import { Textarea } from "@shared/components/ui/textarea";
import { cn } from "@shared/lib/utils";

interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  //leave as optional
  onEnter?: () => void;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, onKeyDown, onEnter, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      //if it is only the enter key
      if (event.key === "Enter" && !event.shiftKey) {
        //prevent new line
        event.preventDefault();
        if (onEnter) {
          onEnter();
        }
      }
      if (onKeyDown) {
        onKeyDown(event);
      }
    };
    return (
      <Textarea
        autoComplete="off"
        ref={ref}
        name="message"
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-16 max-h-12 w-full resize-none items-center rounded-md bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
