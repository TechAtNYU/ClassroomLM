// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
import { insertRandom } from "./actions";
import { getUserClassrooms } from "./actions";

export default async function ClassroomPage() {
  const classrooms = await getUserClassrooms();

  if (!classrooms || classrooms.length === 0) {
    return <div>No classrooms found!</div>;
  }

  return (
    <>
      <div style={{ padding: 20 }}>
        <h1>Classrooms</h1>
        {classrooms.map((classroom) => (
          <div key={classroom.id}>
            <h2>Classroom ID: {classroom.id}</h2>
            <p>Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}</p>
          </div>
        ))}
      </div>
      <button className={"border-2 border-solid"} onClick={insertRandom}>
        insert test
      </button>
    </>
  );
}
