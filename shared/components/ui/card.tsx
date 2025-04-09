import * as React from "react";

import { cn } from "@shared/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        animated
          ? "group/animated-card rounded-xl border bg-card shadow-input transition duration-200 hover:shadow-xl"
          : "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6".concat(
          animated
            ? "transition duration-200 group-hover/animated-card:translate-x-2"
            : ""
        ),
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight".concat(
          animated
            ? "transition duration-200 group-hover/animated-card:translate-x-2"
            : ""
        ),
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground".concat(
          animated
            ? "transition duration-200 group-hover/animated-card:translate-x-2"
            : ""
        ),
        className
      )}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "p-6 pt-0".concat(
          animated
            ? "transition duration-200 group-hover/animated-card:translate-x-2"
            : ""
        ),
        className
      )}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0".concat(
          animated
            ? "transition duration-200 group-hover/animated-card:translate-x-2"
            : ""
        ),
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
