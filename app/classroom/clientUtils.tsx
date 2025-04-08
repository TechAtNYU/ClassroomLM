"use client";

import React, { ReactNode } from "react";
import {
  ClassroomWithMembers,
  UserWithClassroomsData,
} from "../lib/userContext/contextFetcher";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SheetTrigger } from "@/components/ui/sheet";

/**
 * Called "optimistic" because it changes the data in the UI (eg. the name or deletes
 * the classroom) without waiting for it to see if the actual database was successful.
 * So the flow: update the UI, call the action, refresh with the actual database data
 * (which 99% of the time) will match what you optimistically update with anyway
 * Check uses of this below
 * @param classroomId classId to change
 * @param action action callback to call, just provide an async
 * @param newValue the value to optimistically update the classroom with
 */
export const optimisticUpdateAndFetchClassroomData = async <
  K extends keyof ClassroomWithMembers,
>(
  action: () => Promise<unknown>,
  newValue:
    | { [k in K]: ClassroomWithMembers[k] }
    | ClassroomWithMembers
    | "remove",
  setUserAndClassDataFunction: React.Dispatch<
    React.SetStateAction<UserWithClassroomsData>
  >,
  classroomId?: number,
  refreshFunction?: () => Promise<unknown>
) => {
  setUserAndClassDataFunction((prevData) => ({
    userData: prevData.userData,
    classroomsData: prevData.classroomsData
      .flatMap((classroom) => {
        if (classroom.id === classroomId) {
          return newValue === "remove" ? [] : { ...classroom, ...newValue };
        }
        return classroom;
      })
      .concat(typeof newValue === "object" && "id" in newValue ? newValue : []),
  }));
  const returnVal = await action();
  if (refreshFunction) {
    refreshFunction();
  }
  return returnVal;
};

export function TooltipUtil({
  content,
  trigger,
  delayDuration = 300,
  useSheetTrigger = false,
}: {
  content: ReactNode;
  trigger: ReactNode;
  delayDuration?: number;
  useSheetTrigger?: boolean;
}) {
  const tooltipTrigger = <TooltipTrigger asChild>{trigger}</TooltipTrigger>;
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        {useSheetTrigger ? (
          <SheetTrigger asChild>{tooltipTrigger}</SheetTrigger>
        ) : (
          tooltipTrigger
        )}
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
