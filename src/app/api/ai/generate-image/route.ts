import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No Gemini API key configured (GEMINI_API_KEY)" }, { status: 400 });
    }

    const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.0-flash-preview-image-generation";

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini image gen failed:", res.status, errText);
      return NextResponse.json({ error: `Image generation failed: ${res.status} ${errText}` }, { status: 500 });
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p.inlineData);
    if (!imgPart) {
      return NextResponse.json({ error: "No image returned", raw: data }, { status: 500 });
    }

    const { mimeType, data: base64 } = imgPart.inlineData;
    const buffer = Buffer.from(base64, "base64");
    const ext = mimeType?.includes("png") ? "png" : "jpg";

    // Upload to Supabase Storage using service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const path = `ai/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, buffer, { contentType: mimeType || "image/png", upsert: false });

    if (upErr) {
      console.error("Storage upload failed:", upErr);
      // Fallback: return data URL
      return NextResponse.json({ url: `data:${mimeType};base64,${base64}` });
    }

    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl });
  } catch (e: any) {
    console.error("generate-image error:", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
