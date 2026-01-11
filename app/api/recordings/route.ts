import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client with service role key for server-side uploads (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If Supabase is not configured, return a mock URL
    if (!supabaseAdmin) {
      console.log("Supabase not configured, skipping recording upload");
      return NextResponse.json({
        url: null,
        message: "Supabase not configured - recording not saved",
      });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sessionId = formData.get("sessionId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const userIdSafe = session.user.email.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${userIdSafe}/${timestamp}-${sessionId}.webm`;

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from("session-recordings")
      .upload(filename, buffer, {
        contentType: "video/webm",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage error:", error);

      // If bucket doesn't exist, provide helpful message
      if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
        return NextResponse.json({
          url: null,
          error: "Storage bucket 'session-recordings' not configured. Please create it in Supabase.",
        }, { status: 500 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("session-recordings")
      .getPublicUrl(data.path);

    console.log("Recording uploaded successfully:", urlData.publicUrl);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error("Recording upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
