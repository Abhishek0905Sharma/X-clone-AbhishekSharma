import { getSupabaseClient } from "../lib/SupabaseClient";
export const signUpUser = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  try {
    // Step 1: Create the account
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) return { error: signUpError.message };

    // Step 2: Immediately sign in so session is active ✅
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) return { error: signInError.message };

    return { data }; // ✅ session is now returned

  } catch (error) {
    console.log("Unexpected Error:", error);
    return { error: "Unexpected error occurred. Please try again." };
  }
};

export const signInUser = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };

    return { data }; // ✅ session is now returned

  } catch (error) {
    console.log("Unexpected Error:", error);
    return { error: "Unexpected error occurred. Please try again." };
  }
};