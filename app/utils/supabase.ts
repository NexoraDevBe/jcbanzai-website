import { createClient } from "@supabase/supabase-js";
const config = useRuntimeConfig()
const supabaseUrl = config.public.supabaseUrl;
const supabaseKey = config.public.supabasePublishableKey;

export const supabase = createClient(supabaseUrl, supabaseKey);