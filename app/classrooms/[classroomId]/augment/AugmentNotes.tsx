"use client";
import { useState, useRef } from "react";

import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";

import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

export default function AugmentComponent({
  // TODO: remove for classroomId and setIsProcessing once we actually implement augments
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  classroomId,
}: {
  classroomId: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputFile = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Double-check that file passed by user is markdown or pdf
    const fileExtension = selectedFile.name.split(".").at(-1)?.toLowerCase();
    if (fileExtension !== "pdf" && fileExtension !== "md") {
      toast.error("Invalid file format", {
        description: "Please upload a Markdown (.md) or PDF (.pdf) file",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    // TODO
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">Augment Notes</h1>
      <p className="text-muted-foreground">
        Upload your notes to get AI-powered enhancements and improvements
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          onChange={handleFileChange}
          ref={inputFile}
          className="hidden"
          accept=".md,.pdf"
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
    </div>
  );
}
