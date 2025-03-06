import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const data = await supabase.from("Classroom").select();
  return Response.json({
    status: "FROG",
    data,
  });
}
