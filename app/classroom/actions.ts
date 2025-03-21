"use server";
import { createServiceClient } from "@/utils/supabase/service-server";
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/database.types";

export interface ClassroomWithMembers extends Tables<"Classroom"> {
  Classroom_Members?: Array<{
    id: number;
    classroom_id: number;
    Users: {
      id: string;
      email: string;
      full_name: string;
      avatar_url: string;
    };
  }>;
}
const RAGFLOW_SERVER_URL = process.env.RAGFLOW_API_URL || "";
const RAGFLOW_API_KEY = process.env.RAGFLOW_API_KEY;

// TODO: add complex server tasks to this area and call them from your page when necessary

// this is just a sample server-side action to show how it's done
// export async function insertRandom() {
//   // Notice how we use a createServiceClient instead of createClient from server
//   // this BYPASSES ALL RLS in the case that you have to do some more complex things and we don't
//   // want to write RLS rules for all of it. See our project doc Resources section for more info
//   const supabase = createServiceClient();

//   const { error } = await supabase.from("Classroom_Members").insert({
//     classroom_id: 17,
//     user_id: "05929f55-42bb-42d4-86bd-ddc0c7d12685",
//   });
//   console.log(error);
// }

// export async function getCurrentUserID2() {
//   const supabase = createServiceClient();

//   const { data: { user } } = await supabase.auth.getUser()

//   // // Get the current user using the updated method
//   // const { data: user, error } = await supabase.auth.getUser();

//   // if (error) {
//   //   throw new Error(error.message);
//   // }

//   // if (!user) {
//   //   throw new Error("No user is logged in");
//   // }

//   // return user.id; // Return the current user's ID
// }
export async function getCurrentUserId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw Error("No authenticated user found");
  }
  return user.id;
}

export async function deleteClassroom(classroom_id: number) {
  // Deleting Associated Supabase
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("Classroom")
    .delete()
    .eq("id", classroom_id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // Deleting Associated Chat Assistant
  const chat_assistant_id = data[0].chat_assistant_id;

  if (chat_assistant_id) {
    const requestChatBody = {
      ids: [chat_assistant_id],
    };

    const chatResponse = await fetch(`${RAGFLOW_SERVER_URL}/api/v1/chats`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
      },
      body: JSON.stringify(requestChatBody),
    });

    if (!chatResponse.ok) {
      throw new Error(
        `Failed while deleting assistant from Ragflow: ${chatResponse.statusText}`
      );
    }
  } else {
    // If no chat assistant, we don't want to error out
    console.log("No chat assistant found for classroom when deleting");
  }

  // Deleting Associatied RAGFlow
  const ragflow_dataset_id = data[0].ragflow_dataset_id;

  if (!ragflow_dataset_id) {
    throw new Error("No related RAGFlow dataset found for this classroom.");
  }

  //gets ids of ragflow_dataset_id
  const requestBody = {
    ids: [ragflow_dataset_id],
  };

  //deletes the respective dataset
  const ragflowResponse = await fetch(`${RAGFLOW_SERVER_URL}/api/v1/datasets`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RAGFLOW_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!ragflowResponse.ok) {
    throw new Error(
      `Failed to delete dataset from Ragflow: ${ragflowResponse.statusText}`
    );
  }

  return data || [];
}

export async function leaveClassroom(classroom_id: number, user_id: string) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("Classroom_Members")
    .delete()
    .eq("classroom_id", classroom_id)
    .eq("user_id", user_id);
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

// export async function getClassroomAdminID(classroom_id: number) {
//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("Classroom")
//     .select("admin_user_id")
//     .eq("id", classroom_id);

//   if (error) {
//     throw new Error(error.message);
//   }

//   return data[0]?.admin_user_id || null;
// }

export async function getUserClassrooms() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("Classroom").select(`
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
    throw new Error(error.message);
  }
  return data || [];
}

export async function retrieveClassroomData(userId: string) {
  const classrooms = await getUserClassrooms();

  // if (!classrooms || classrooms.length === 0) {
  //   return;
  // }

  const validAdminClasses = classrooms.filter(
    (classroom) => classroom.admin_user_id == userId
  );

  const validNonAdminClasses = classrooms.filter(
    (classroom) => classroom.admin_user_id != userId
  );

  return { validAdminClasses, validNonAdminClasses };
}

export async function inviteMemberToClassroom(
  email: string,
  classroom_id: number
) {
  const supabase = createServiceClient();

  const { data: users, error: userError } = await supabase
    .from("Users")
    .select("id")
    .eq("email", email)
    .single();

  if (userError || !users) {
    throw new Error("User does not exist");
  }

  //checks for duplicate
  const { data: member } = await supabase
    .from("Classroom_Members")
    .select("id")
    .eq("classroom_id", classroom_id)
    .eq("user_id", users.id);

  if (member && member.length > 0) {
    throw new Error("User already in the classroom");
  }

  //insert if no errors
  const { error: insertError } = await supabase
    .from("Classroom_Members")
    .insert({
      classroom_id: classroom_id,
      user_id: users.id,
    });

  if (insertError) {
    throw new Error("Error inserting classroom member");
  }
  return true;
}

export async function changeClassroomName(
  classroom_id: number,
  newName: string
) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("Classroom")
    .update({ name: newName })
    .eq("id", classroom_id)
    .select();

  if (error) {
    console.log("Error changing name");
  }

  //console.log(data[0].name);
  return data;
}
