import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const V2FUN_BASE = "https://api.v2fun.ai/api/v1";
const API_KEY = process.env.V2FUN_API_KEY || process.env.AI_MODEL_GENERATION_IMAGES || "";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    if (!API_KEY) {
      return NextResponse.json({ error: "No V2Fun API key configured (V2FUN_API_KEY)" }, { status: 400 });
    }

    const fullPrompt = `${prompt}. Clean uniform background color with a soft natural shadow under the product, professional e-commerce product photography, studio lighting, high quality.`;

    // 1. Create image generation task
    const createRes = await fetch(`${V2FUN_BASE}/images/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        model: process.env.V2FUN_IMAGE_MODEL || "gpt-image-2",
        size: "1024x1024",
        block: true,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("V2Fun gen failed:", createRes.status, errText);
      return NextResponse.json({ error: `Image generation failed: ${createRes.status} ${errText}` }, { status: 500 });
    }

    let task = await createRes.json();

    // 2. Poll until completed
    const taskUuid = task.task_uuid;
    let attempts = 0;
    while (task.status !== "COMPLETED" && task.status !== "FAILED" && attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(`${V2FUN_BASE}/images/generations/${taskUuid}`, {
        headers: { "Authorization": `Bearer ${API_KEY}` },
      });
      if (!pollRes.ok) {
        const errText = await pollRes.text();
        console.error("V2Fun poll failed:", pollRes.status, errText);
        break;
      }
      task = await pollRes.json();
      attempts++;
    }

    if (task.status !== "COMPLETED") {
      return NextResponse.json({ error: `Task not completed (status: ${task.status})` }, { status: 500 });
    }

    // 3. Get download URL
    const downloadUrl = task?.metadata?.downloads?.[0]?.download_url;
    if (!downloadUrl) {
      // maybe result contains relative paths; try constructing
      const rel = task?.result?.[0];
      if (!rel) return NextResponse.json({ error: "No image URL returned", raw: task }, { status: 500 });
      // fallback: can't download, return relative as-is
      return NextResponse.json({ url: `https://asset.v2fun.ai/${rel}` });
    }

    // 4. Download image bytes
    const imgRes = await fetch(downloadUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: `Failed to download result: ${imgRes.status}` }, { status: 500 });
    }
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload to Supabase Storage
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const path = `ai/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, buffer, { contentType: "image/png", upsert: false });

    if (upErr) {
      console.error("Storage upload failed:", upErr);
      return NextResponse.json({ url: `data:image/png;base64,${buffer.toString("base64")}` });
    }

    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl });
  } catch (e: any) {
    console.error("generate-image error:", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
