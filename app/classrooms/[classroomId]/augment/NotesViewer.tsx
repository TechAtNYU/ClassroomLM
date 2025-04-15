"use client";

import { ScrollArea } from "@shared/components/ui/scroll-area";
import { Separator } from "@shared/components/ui/separator";
import { Skeleton } from "@shared/components/ui/skeleton";
import { ChatClientWithSession } from "@shared/lib/ragflow/chat/chat-client";

import { createNotesClient, reviseNotesLine } from "./AugumentActions";

import { useState } from "react";
import ReactDiffViewer from "react-diff-viewer";

export default function AugmentComponent({
  notesContent,
  classroomId,
}: {
  notesContent: string[];
  classroomId: string;
}) {
  async function DoAugmentation() {
    const notesClient: ChatClientWithSession =
      await createNotesClient(classroomId);

    const revisedNotesContent: string[][] = await Promise.all(
      notesContent.map((x) => reviseNotesLine(notesClient, x))
    );

    for (let i = 0; i < notesContent.length; i++) {
      if (augmentedCount <= 2) {
        setAugmentedNotesDiff((oldArray) => [
          ...oldArray,
          [
            notesContent[i],
            revisedNotesContent[i][0],
            revisedNotesContent[i][1],
          ],
        ]);
      }

      setAugmentedCount((oldCount) => oldCount + 1);
    }
  }

  // formatted like this [[original, revised, reason], [original, revised, reason], ...]
  const [augmentedNotesDiff, setAugmentedNotesDiff] = useState<string[][]>([]);

  // resolving some duplicate augmentation issues
  const [augmentedCount, setAugmentedCount] = useState(0);

  DoAugmentation();

  const defaultStyles = {
    variables: {
      light: {
        FontFace: "Arial, Helvetica, sans-serif",
        diffViewerBackground: "#fff",
        diffViewerColor: "white",
        addedBackground: "#e6ffed",
        addedColor: "#24292e",
        removedBackground: "#000000",
        removedColor: "#24292e",
        wordAddedBackground: "#acf2bd",
        wordRemovedBackground: "#fdb8c0",
        addedGutterBackground: "#cdffd8",
        removedGutterBackground: "#ffdce0",
        gutterBackground: "#f7f7f7",
        gutterBackgroundDark: "#f3f1f1",
        highlightBackground: "#fffbdd",
        highlightGutterBackground: "#fff5b1",
        codeFoldGutterBackground: "#dbedff",
        codeFoldBackground: "#f1f8ff",
        emptyLineBackground: "#fafbfc",
        gutterColor: "#212529",
        addedGutterColor: "#212529",
        removedGutterColor: "#212529",
        codeFoldContentColor: "#212529",
        diffViewerTitleBackground: "#fafbfc",
        diffViewerTitleColor: "#212529",
        diffViewerTitleBorderColor: "#eee",
      },
      dark: {
        FontFace: "Arial, Helvetica, sans-serif",
        diffViewerBackground: "black",
        diffViewerColor: "white",
        addedBackground: "black",
        addedColor: "white",
        removedBackground: "black",
        removedColor: "white",
        wordAddedBackground: "#005500",
        wordRemovedBackground: "#7d383f",
        addedGutterBackground: "#034148",
        removedGutterBackground: "#632b30",
        gutterBackground: "#2c2f3a",
        gutterBackgroundDark: "#262933",
        highlightBackground: "#2a3967",
        highlightGutterBackground: "#2d4077",
        codeFoldGutterBackground: "#21232b",
        codeFoldBackground: "#262831",
        emptyLineBackground: "#363946",
        gutterColor: "#464c67",
        addedGutterColor: "#8c8c8c",
        removedGutterColor: "#8c8c8c",
        codeFoldContentColor: "#555a7b",
        diffViewerTitleBackground: "#2f323e",
        diffViewerTitleColor: "#555a7b",
        diffViewerTitleBorderColor: "#353846",
      },
    },
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <ScrollArea className="w-7/8 h-full rounded-md border p-4">
        <div className="p-4">
          {augmentedNotesDiff.length == 0 ? (
            <div className="space-y-2">
              <h4 className="mb-4 text-sm font-medium leading-none">
                Augmenting your notes...
              </h4>
              <Skeleton className="h-4 w-[1000px]" />
              <Skeleton className="h-4 w-[800px]" />
            </div>
          ) : null}

          {augmentedNotesDiff.map(([originalNotes, revisedNotes, reason], i) =>
            originalNotes.replaceAll(" ", "").length != 0 &&
            originalNotes.replaceAll(" ", "") !=
              revisedNotes.replaceAll(" ", "") ? (
              <div key={i} className="text-red text-2xl">
                <ReactDiffViewer
                  styles={defaultStyles}
                  oldValue={originalNotes.trim().replaceAll("  ", " ")}
                  newValue={revisedNotes.trim().replaceAll("  ", " ")}
                  splitView={false}
                  hideLineNumbers={true}
                  useDarkTheme={true}
                />

                <h1 className="m-4 p-4 text-sm text-green-100">
                  {reason.replaceAll("##0$$\n", "")}
                </h1>

                <div className="m-2 p-2"></div>

                <Separator className="my-2" />

                <div className="m-1 p-1"></div>
              </div>
            ) : originalNotes.replaceAll(" ", "").length != 0 ? (
              <div key={i} className="text-red text-2xl">
                <ReactDiffViewer
                  styles={defaultStyles}
                  oldValue={" " + originalNotes.trim()}
                  newValue={" " + originalNotes.trim()}
                  splitView={false}
                  showDiffOnly={false}
                  hideLineNumbers={true}
                  useDarkTheme={true}
                />

                <div className="m-4 p-4"></div>

                <Separator className="my-2" />

                <div className="m-1 p-1"></div>
              </div>
            ) : null
          )}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2"></div>
    </div>
  );
}
