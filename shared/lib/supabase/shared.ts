import { createClient } from "@shared/utils/supabase/server";

/** Server-side component, get current ID */
export async function getCurrentUserIdServer(): Promise<string | null> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return null;
  }

  return userData.user.id;
}
