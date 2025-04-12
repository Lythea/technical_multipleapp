import { createClient } from "@supabase/supabase-js";
import Cookies from "js-cookie";

// Replace with your Supabase URL and anon key
const supabaseUrl = "https://yuuqapitwtzpmlxswalj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dXFhcGl0d3R6cG1seHN3YWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNDYxOTIsImV4cCI6MjA1OTkyMjE5Mn0.Va9opdYxRV_sVzexdaWOAQEwXZl_-orF-AJ_zwCv_jA"; // From Supabase dashboard

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadFile(file: File, userId: string): Promise<string | null> {
  try {
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const filePath = `avatars/${userId}/${uniqueFileName}`; // Include userId in the file path to avoid conflicts

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('foodreview')
      .upload(filePath, file, {
        upsert: true, // allows overwriting the same filename
      });

    if (error) {
      throw error;
    }
    console.log(data)
    // Return the file URL (you can generate this URL from the storage bucket)
    const fileUrl = supabase.storage.from('foodreview').getPublicUrl(filePath).data?.publicUrl;
    
    if (!fileUrl) {
      throw new Error("Failed to get file URL.");
    }

    console.log("File uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null; // Return null in case of failure
  }
}

export default uploadFile;
