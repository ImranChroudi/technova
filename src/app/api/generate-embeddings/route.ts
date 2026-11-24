import { NextRequest, NextResponse } from "next/server";
import { generateImageEmbedding } from "@/lib/ai/image-embeddings";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const productId = body?.product_id;

    const supabase = await createServerSupabase();

    let query = supabase.from("products").select("product_id, image, images");
    if (productId) query = query.eq("product_id", productId);
    const { data: products, error } = await query;
    if (error) throw new Error(`Failed to fetch products: ${error.message}`);

    const results: { product_id: string; ok: boolean; error?: string }[] = [];

    for (const p of products ?? []) {
      const imgs = (p.images && p.images.length ? p.images : p.image ? [p.image] : []).slice(0, 3);

      if (imgs.length === 0) {
        results.push({ product_id: p.product_id, ok: false, error: "No images to embed" });
        continue;
      }

      // Remove stale embeddings for this product
      await supabase.from("product_image_embeddings").delete().eq("product_id", p.product_id);

      for (const img of imgs) {
        try {
          const res = await fetch(img);
          if (!res.ok) throw new Error(`fetch image failed: ${res.status}`);
          const blob = await res.blob();
          const embedding = await generateImageEmbedding(blob);

          const { error: insErr } = await supabase.from("product_image_embeddings").insert({
            product_id: p.product_id,
            image_url: img,
            embedding,
          });
          if (insErr) throw new Error(`DB insert failed: ${insErr.message}`);
          results.push({ product_id: p.product_id, ok: true });
        } catch (e: any) {
          console.error("embedding failed for", p.product_id, img, e?.message);
          results.push({ product_id: p.product_id, ok: false, error: e?.message });
        }
      }
    }

    return NextResponse.json({ results });
  } catch (e: any) {
    console.error("generate-embeddings error:", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
```|<|start|>write to=assistant<|channel|>analysis<|message|>Created file successfully: /Users/macbookpro/Downloads/ecommerce-supabase-Nextjs-main/src/app/api/generate-embeddings/route.ts