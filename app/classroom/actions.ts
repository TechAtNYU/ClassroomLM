"use server";
import { createServiceClient } from "@/utils/supabase/service-server";
import { createClient } from "@/utils/supabase/server";
import { deleteDataset } from "../lib/ragflow/dataset-client";

const RAGFLOW_SERVER_URL = process.env.RAGFLOW_API_URL || "";
const RAGFLOW_API_KEY = process.env.RAGFLOW_API_KEY;

export async function deleteClassroom(classroom_id: number) {
  // Deleting Associated Supabase
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("Classrooms")
    .delete()
    .eq("id", classroom_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Deleting Associated Chat Assistant
  const chat_assistant_id = data.chat_assistant_id;

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
  } 
  // else {
  //   // If no chat assistant, we don't want to error out
  //   console.log("No chat assistant found for classroom when deleting");
  // }

  // Deleting associated RAGFlow dataset if exists
  if (data.ragflow_dataset_id) {
    deleteDataset(data.id.toString(), data.ragflow_dataset_id);
  }
  // const ragflow_dataset_id = data.ragflow_dataset_id;

  // if (!ragflow_dataset_id) {
  //   throw new Error("No related RAGFlow dataset found for this classroom.");
  // }

  // //gets ids of ragflow_dataset_id
  // const requestBody = {
  //   ids: [ragflow_dataset_id],
  // };

  // //deletes the respective dataset
  // const ragflowResponse = await fetch(`${RAGFLOW_SERVER_URL}/api/v1/datasets`, {
  //   method: "DELETE",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${RAGFLOW_API_KEY}`,
  //   },
  //   body: JSON.stringify(requestBody),
  // });

  // if (!ragflowResponse.ok) {
  //   throw new Error(
  //     `Failed to delete dataset from Ragflow: ${ragflowResponse.statusText}`
  //   );
  // }

  return data || [];
}

export async function removeMember(classroom_id: number, user_id: string) {
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

export async function getUserClassrooms() {
  const supabase = await createClient();
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
    throw new Error(error.message);
  }
  return data || [];
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
    .from("Classrooms")
    .update({ name: newName })
    .eq("id", classroom_id)
    .select();

  if (error) {
    console.log("Error changing name");
  }

  //console.log(data[0].name);
  return data;
}

export async function setArchiveStatusClassroom(
  classroom_id: number,
  status: boolean
) {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("Classrooms")
    .update({ archived: status })
    .eq("id", classroom_id)
    .select();

  if (error) {
    console.error("Error setting archive status classroom:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function newClassroom(name: string, id: string) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("Classrooms")
    .insert([{ name: name, admin_user_id: id,archived: false }])
    .select("id");

  if (error) {
    console.error("Error inserting classroom:", error);
    return null;
  }

  // add yourself to member list
  if (data && data.length > 0) {
    const classroomId = data[0].id;
    console.log("Classroom ID:", classroomId);
    const { error } = await supabase
      .from("Classroom_Members")
      .insert([{ classroom_id: classroomId, user_id: id }])
      .select();

    if (error) {
      console.error("Error inserting admin to classroom member list:", error);
      return null;
    }
  }

  return data;
}

// export async function getCurrentUserId() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) {
//     throw Error("No authenticated user found");
//   }
//   return user.id;
// }
