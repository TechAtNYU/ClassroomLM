"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createDatasetClient,
  DatasetClient,
  retrieveDocuments,
  uploadFile,
} from "@shared/lib/ragflow/dataset-client";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Skeleton } from "@shared/components/ui/skeleton";
import { ScrollArea } from "@shared/components/ui/scroll-area";
import { toast } from "sonner";
import { SquareArrowOutUpRight } from "lucide-react";

type UploadedFile = {
  id: string;
  datasetId: string;
  name: string;
  size: number;
  type: string;
  status: string;
};

const ACTION_MAX_SIZE_BYTES = 10 * 1_000_000; // this is set in next.config.ts

export default function UploadComponent({
  classroomId,
  classroomName,
}: {
  classroomId: string;
  classroomName: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[] | null>(
    null
  );
  const [datasetClient, setDatasetClient] = useState<DatasetClient>();
  const [loading, setLoading] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      let clientToUse = datasetClient;
      if (!clientToUse) {
        const result = await createDatasetClient({
          classroomId,
          classroomName,
        });
        if (result) {
          clientToUse = result.client;
          setDatasetClient(clientToUse);
        } else {
          return;
        }
      }
      const retrieveResult = await retrieveDocuments(clientToUse);
      console.log("retrieve: ", retrieveResult);
      if (!retrieveResult.ragflowCallSuccess) {
        return;
      }
      setUploadedFiles(retrieveResult.files);
    };

    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [classroomId, classroomName, datasetClient]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > ACTION_MAX_SIZE_BYTES) {
        toast.error("File size too big!");
        e.preventDefault();
        if (inputFile.current) {
          inputFile.current.value = "";
        }
        return;
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    let toastResolve = undefined;
    let toastError = undefined;
    const toastPromise = new Promise((res, rej) => {
      toastResolve = res;
      toastError = rej;
    });

    const formData = new FormData();
    formData.append("file", file);

    if (!datasetClient) {
      return;
    }
    const response = await uploadFile(datasetClient, formData);

    toast.promise(toastPromise, {
      loading: `Document ${file.name} has uploaded and began parsing`,
      success: () => ({
        message: `${file.name} successfully uploaded!`,
      }),
      error: () => ({
        message: `Error while uploading ${file.name}`,
      }),
    });

    setLoading(false);

    if (
      response.isAdmin &&
      response.parseCallSuccess &&
      response.uploadCallSuccess
    ) {
      setUploadedFiles(response.files);
      setFile(null);
      if (inputFile.current) {
        inputFile.current.value = "";
      }
      if (toastResolve) {
        (toastResolve as unknown as (value: unknown) => void)(null);
      }
    } else if (toastError) {
      (toastError as unknown as (value: unknown) => void)(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-[35vw]">
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          {datasetClient == undefined || uploadedFiles == null ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    ref={inputFile}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full"
                >
                  {loading ? "Uploading..." : "Upload"}
                </Button>
              </form>

              {/* Move to component with files passed in as props so that newly fetch data doesn't trigger a rerender (and thus another fetch) infinitely so*/}
              <FileList uploadedFiles={uploadedFiles} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FileList({ uploadedFiles }: { uploadedFiles: UploadedFile[] }) {
  const pathname = usePathname();
  return (
    uploadedFiles.length > 0 && (
      <ScrollArea className="mt-5 flex h-fit max-h-[50vh] w-full flex-col">
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Uploaded Files</h2>
          <ul className="my-2 space-y-2">
            {uploadedFiles
              .flatMap((f) => [f])
              .map((file) => (
                <li key={file.id} className="rounded-md border p-3">
                  <Link
                    href={`${pathname}/preview?documentId=${file.id}&datasetId=${file.datasetId}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="font-medium hover:underline"
                  >
                    {file.name}
                    <SquareArrowOutUpRight className="inline scale-75" />
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB - {file.type} -{" "}
                    <strong>{file.status}</strong>
                  </p>
                </li>
              ))}
          </ul>
        </div>
      </ScrollArea>
    )
  );
}
