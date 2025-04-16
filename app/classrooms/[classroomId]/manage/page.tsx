// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
"use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";

import { useContext, useEffect, useState } from "react";
import ClassroomManagementButtons from "./buttons";
import Link from "next/link";
import { UserContext } from "@shared/lib/userContext/userContext";
import { useParams } from "next/navigation";
import { Skeleton } from "@shared/components/ui/skeleton";
import { ClassroomWithMembers } from "@shared/lib/userContext/contextFetcher";

export default function ClassroomManagementPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [staleDataIfDeleted, setStaleDataIfDeleted] = useState<
    ClassroomWithMembers | undefined
  >();

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
  const classroomIdNumber = Number(classroomId);
  const { setUserAndClassData, userAndClassData } = userContext;
  const classroomInfo = userAndClassData.classroomsData.find(
    (x) => x.id === classroomIdNumber
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setStaleDataIfDeleted(structuredClone(classroomInfo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the userContext is undefined still, give loading visual
  let classToRender = undefined;

  if (!classroomInfo) {
    if (staleDataIfDeleted) {
      classToRender = staleDataIfDeleted;
    } else {
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
  } else {
    classToRender = classroomInfo;
  }

  return (
    <div>
      <h1>Hello this is classroom {classroomId}</h1>
      <ClassroomManagementButtons
        classroomData={classToRender}
        setUserAndClassCallback={setUserAndClassData}
        userData={userAndClassData.userData}
      />
      <Link href={`/classrooms`} passHref>
        <button
          type="button"
          className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
        >
          Classroom Page
        </button>
      </Link>
    </div>
  );
}
