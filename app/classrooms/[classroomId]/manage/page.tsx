// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
"use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";

import { useContext, useEffect, useState } from "react";
import ClassroomManagementButtons from "./buttons";
import { UserContext } from "@shared/lib/userContext/userContext";
import { useParams } from "next/navigation";
import { Skeleton } from "@shared/components/ui/skeleton";
import { ClassroomWithMembers } from "@shared/lib/userContext/contextFetcher";
import { Edit } from "lucide-react";

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
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {classToRender.name}
        </h1>
        <h2 className="flex flex-row gap-4 text-2xl font-medium tracking-tight text-muted-foreground">
          <Edit className="self-center" /> Manage classroom
        </h2>
      </div>

      <ClassroomManagementButtons
        classroomData={classToRender}
        setUserAndClassCallback={setUserAndClassData}
        userData={userAndClassData.userData}
      />
    </div>
  );
}
