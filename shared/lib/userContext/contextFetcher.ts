"use server";
import { Tables } from "@shared/utils/supabase/database.types";
import { createClient } from "@shared/utils/supabase/server";
import { User } from "@supabase/supabase-js";

// TODO: see if we can make the interface like below instead of hardcoded
// export interface ClassroomWithMembers extends Tables<"Classrooms"> {
//     Classroom_Members?: Tables<"Classroom_Members"> extends Tables<"Users">
// }
export interface ClassroomMember {
  id: number;
  classroom_id: number;
  Users: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ClassroomWithMembers extends Tables<"Classrooms"> {
  Classroom_Members?: Array<ClassroomMember>;
}
export type UserWithClassroomsData = {
  userData: User;
  classroomsData: ClassroomWithMembers[];
};

export const getUserAndClassroomData =
  async (): Promise<UserWithClassroomsData | null> => {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // if just this errors, it's fine cause they're probably just logged out
    if (userError) {
      return null;
    }
    const { data, error } = await supabase.from("Classrooms").select(`
        *,
        Classroom_Members (
          id,
          classroom_id,
          Users (
            id, 
            email,
            full_name,
            avatar_url
          )
        )
      `);

    if (error) {
      console.log(
        "Fetching classroom data within main layout context, supabase error: ",
        error
      );
      return null;
    }
    return { classroomsData: data, userData: userData.user };
  };
