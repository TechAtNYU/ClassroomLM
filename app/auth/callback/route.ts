import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

// Get allowed domains from environment variables
const allowedDomains = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS?.split(
  ","
).map((domain) => domain.trim());

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (!allowedDomains) {
    console.error(
      "NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS must be set in the environment variables"
    );
    return NextResponse.redirect(`${origin}/error`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user?.email) {
      // Check if the user's email domain is allowed
      const userEmail = data.user.email;
      const isAllowedDomain = allowedDomains.some((domain) =>
        userEmail.endsWith(`@${domain}`)
      );

      if (!isAllowedDomain) {
        // Not an allowed email, sign them out
        await supabase.auth.signOut();

        // Create a response with the redirect
        const response = NextResponse.redirect(
          `${origin}/auth/unauthorized?message=ORGANIZATION_EMAIL_REQUIRED`
        );

        return response;
      }

      // User has an allowed email domain, proceed
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/error`);
}
