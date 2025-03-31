type PageStructure = PickOne<{
        classroomLanding: PickOne<{
          enrolled: boolean;
          admin: boolean;  
        }>,
        activeClassroom: {
              id: number;
              activeSubPage: PickOne<{
                    manageClassroomPage: {
                      uploadClassroomPage: boolean;
                    };
                    personalChatPage: boolean,
                    // TODO: add chatrooms
                }> | undefined
            }
      }> | undefined;

export function getPageAspectsByPath(pathname: string): PageStructure {
  if (pathname == "/"){
    return undefined;
  }

  const split = pathname.split("/");

  if (pathname.includes("classroom") && split.length == 2){
    // TODO: add admin separate
    return {classroomLanding: {enrolled: true}}
  }

  const id = split[2];
  let subPage = undefined;
  if (split.length >= 4){
    // TODO: after adding manage page and moving chat/chatrooms into classroom -> add to here
    subPage = {manageClassroomPage: {uploadClassroomPage: true}}
  }

  return {activeClassroom: {id: Number(id), activeSubPage: subPage}};
}


type PickOne<T> = {
    [K in keyof T]: Record<K, T[K]> & Partial<Record<Exclude<keyof T, K>, never>>
  }[keyof T];