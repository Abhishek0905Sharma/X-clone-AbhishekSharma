import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  console.log("Callback hit, code:", code);

  if (!code) {
    console.log("No code found, redirecting to signup");
    return NextResponse.redirect(`${origin}/auth/signup`);
  }

  // ✅ Use @supabase/ssr to properly set cookies in server context
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log("Exchange result:", data?.session ? "success" : "failed", error?.message);

  if (!error && data.session) {
    return NextResponse.redirect(`${origin}/auth/setup`);
  }

  return NextResponse.redirect(`${origin}/auth/signup`);
}