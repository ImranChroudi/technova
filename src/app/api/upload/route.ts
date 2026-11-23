import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CANDIDATES = ["product-images", "images", "public", "default", "avatars"];

export async function POST(request: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "Storage is not configured on the server." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    let bucketUsed: string | null = null;
    let lastError: unknown = null;

    for (const bucket of CANDIDATES) {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (!error) {
        bucketUsed = bucket;
        break;
      }
      lastError = error;
    }

    if (!bucketUsed) {
      const message =
        lastError instanceof Error ? lastError.message : "Upload failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const { data } = supabase.storage.from(bucketUsed).getPublicUrl(path);
    if (!data?.publicUrl) {
      return NextResponse.json(
        { error: "Failed to get public URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}