"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { uploadFile, listDocuments } from "./actions";
import { useUser } from "@supabase/auth-helpers-react";
import { useParams } from "next/navigation";

type UploadedFile = {
  id: string;
  datasetId: string;
  name: string;
  size: number;
  type: string;
  status: string;
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const user = useUser();
  const params = useParams();
  const classroomId = Number(params.classroomId);

  useEffect(() => {
    async function fetchFiles() {
      const response = await listDocuments("upload_documents_test");
      if (response.success) {
        setUploadedFiles(response.files);
      }
    }
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !user || !classroomId) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await uploadFile(classroomId, user.id, formData);
    console.log("Upload Response:", response);

    setLoading(false);

    if (response.success) {
      setUploadedFiles(response.files);
      setFile(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-xl font-bold">File Upload</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full rounded-md bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Uploaded Files</h2>
            <ul className="mt-2 space-y-2">
              {uploadedFiles.map((file) => (
                <li key={file.id} className="rounded-md bg-gray-100 p-3">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB - {file.type} -{" "}
                    <strong>{file.status}</strong>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
