"use client";
import { useState, useRef } from "react";

import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";

import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import pdfToText from "react-pdftotext";

import NotesViewer from "./NotesViewer";

export default function AugmentComponent({
  classroomId,
}: {
  classroomId: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputFile = useRef<HTMLInputElement>(null);

  const [notesContent, setNotesContent] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Double-check that file passed by user is markdown or pdf
    const fileExtension = selectedFile.name.split(".").at(-1)?.toLowerCase();
    if (
      fileExtension !== "pdf" &&
      fileExtension !== "md" &&
      fileExtension !== "txt"
    ) {
      toast.error("Invalid file format", {
        description:
          "Please upload a Markdown (.md), PDF (.pdf), or TXT (.txt) file",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (file != null) {
      const fileExtension = file.name.split(".").at(-1)?.toLowerCase();

      let splitByLines: string[] = [];

      // if txt or md
      if (fileExtension == "txt" || fileExtension == "md") {
        const endText: string = await file.text();
        const cleanedText = endText.replaceAll("\r", "");
        splitByLines = cleanedText.split("\n");

        // if pdf
      } else if (fileExtension == "pdf") {
        splitByLines = await pdfToText(file)
          .then((text) => {
            return text.split("  ");
          })
          .catch((error) => {
            console.error("Failed to extract text from pdf", error);
            return [""];
          });
      }

      setNotesContent(splitByLines);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">Augment Notes</h1>

      <p className="text-muted-foreground">
        Upload your notes to get AI-powered enhancements and improvements
      </p>

      {notesContent.length == 0 ? (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleFileChange}
            ref={inputFile}
            className="hidden"
            accept=".md,.pdf,.txt"
          />
          <Button
            variant="outline"
            size="lg"
            className="cursor-pointer"
            disabled={isProcessing}
            onClick={() => inputFile.current?.click()}
          >
            {isProcessing ? (
              <Upload className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Upload Notes
          </Button>
          {file && (
            <Button
              variant="default"
              size="lg"
              onClick={handleUpload}
              disabled={isProcessing}
            >
              Process Notes
            </Button>
          )}
        </div>
      ) : (
        <NotesViewer notesContent={notesContent} classroomId={classroomId} />
      )}
    </div>
  );
}
