"use client";
import { useContext, useState } from "react";
import { newClassroom } from "./actions";
import Link from "next/link";
import { getUserAndClassroomData } from "../lib/userContext/contextFetcher";
import { Skeleton } from "@/components/ui/skeleton";
import { UserContext } from "../lib/userContext/userContext";

export default function NewClassroomPage() {
  const [className, setClassName] = useState("");
  const [resultText, setResultText] = useState("");

  const userContext = useContext(UserContext);
  if (!userContext) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }
  const { setUserAndClassData, userAndClassData } = userContext;
  const userId = userAndClassData.userData.id;

  const addClassroom = async () => {
    const result = await newClassroom(className, userId);
    if (!result) {
      setResultText(`Error while making classroom!`);
      return;
    }
    setResultText(`Created classroom ${className} successfully!`);
    setClassName("");
    refreshClassrooms();
  };

  const refreshClassrooms = async () => {
    const refreshedData = await getUserAndClassroomData();
    if (refreshedData) {
      setUserAndClassData(refreshedData);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <h1 style={{ paddingTop: "20px" }}>Create a new classroom!</h1>
        <div
          style={{ flexDirection: "row", display: "flex", paddingTop: "20px" }}
        >
          <h2 style={{ paddingRight: "10px" }}>Name:</h2>
          <input
            type="email"
            placeholder="Enter classroom name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            style={{
              color: "black",
              outline: "2px solid black",
              outlineColor: "black",
            }}
          />
        </div>
        {resultText && <div>{resultText}</div>}
        <div style={{ paddingTop: "20px" }}>
          <button
            onClick={addClassroom}
            className="dark:focus:green-red-900 mb-2 me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white"
          >
            Add Classroom
          </button>
          <Link href="classroom/">
            <button className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900">
              Back to My Classrooms
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
