// lib/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase URL and anon key
const supabaseUrl = "https://yuuqapitwtzpmlxswalj.supabase.co"; // From Supabase dashboard
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dXFhcGl0d3R6cG1seHN3YWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNDYxOTIsImV4cCI6MjA1OTkyMjE5Mn0.Va9opdYxRV_sVzexdaWOAQEwXZl_-orF-AJ_zwCv_jA"; // From Supabase dashboard

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
