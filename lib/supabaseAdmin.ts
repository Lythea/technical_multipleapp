// lib/supabaseAdminClient.ts
import { createClient } from "@supabase/supabase-js";

// Use the Service Role Key for server-side actions (for security reasons)
const supabaseUrl = "https://yuuqapitwtzpmlxswalj.supabase.co"; // From Supabase dashboard
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dXFhcGl0d3R6cG1seHN3YWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM0NjE5MiwiZXhwIjoyMDU5OTIyMTkyfQ.7JNE-R2rik1MSHxqT0PVb5WlZsHsHscpKrIhiIS82vA"; // Your Supabase service role key (ensure it's stored in .env)

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabaseAdmin;
