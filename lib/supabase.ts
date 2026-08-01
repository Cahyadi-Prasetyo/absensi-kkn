import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ulhnrdwzbunswxoqjqwr.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_b-jGxrGBIK5aBbG90YN_Xw_JwDQ7T2d";

export const supabase = createClient(supabaseUrl, supabaseKey);
