"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
// import { Dot } from "lucide-react"

import { cn } from "@shared/lib/utils";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput> & { isShare?: boolean }
>(({ className, containerClassName, isShare, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2",
      !isShare && "has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number; isLarge?: boolean }
>(({ index, className, isLarge, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        isLarge && "h-14 w-10 text-[2rem] md:h-28 md:w-20 md:text-[4rem]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "h-4 w-px animate-caret-blink bg-foreground duration-1000",
              isLarge && "h-8 w-px md:h-16 md:w-0.5"
            )}
          />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    {/* https://github.com/guilhermerodz/input-otp/blob/d4aced995b40292cc45bf810ca31d69d23366ca6/apps/website/src/app/(pages)/(home)/_components/showcase.tsx#L63 */}
    <div className="md:20 flex w-10 items-center justify-center">
      <div className="h-1 w-3 rounded-full bg-border md:h-2 md:w-6"></div>
    </div>
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
