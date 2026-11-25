import { NextRequest, NextResponse } from "next/server";
import { generateImageEmbedding } from "@/lib/ai/image-embeddings";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const productId = body?.product_id;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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

      // Remove embeddings for images no longer present
      const { data: existing } = await supabase
        .from("product_image_embeddings")
        .select("image_url")
        .eq("product_id", p.product_id);
      const existingUrls = (existing ?? []).map((r: any) => r.image_url);
      const staleUrls = existingUrls.filter((u: string) => !imgs.includes(u));
      if (staleUrls.length > 0) {
        await supabase.from("product_image_embeddings").delete().eq("product_id", p.product_id).in("image_url", staleUrls);
      }

      for (const img of imgs) {
        // Skip unchanged images (already have an embedding)
        const alreadyHas = existingUrls.includes(img);
        if (alreadyHas) {
          results.push({ product_id: p.product_id, ok: true, skipped: true } as any);
          continue;
        }
        try {
          const res = await fetch(img);
          if (!res.ok) throw new Error(`fetch image failed: ${res.status}`);
          const blob = await res.blob();
          const embedding = await generateImageEmbedding(blob);

          // Insert with model_name; fall back to without it if column missing
          let insErr: any = null;
          const { error: e1 } = await supabase.from("product_image_embeddings").insert({
            product_id: p.product_id,
            image_url: img,
            model_name: "Xenova/clip-vit-base-patch32",
            embedding,
          });
          if (e1 && /model_name/i.test(e1.message || "")) {
            const { error: e2 } = await supabase.from("product_image_embeddings").insert({
              product_id: p.product_id,
              image_url: img,
              embedding,
            });
            insErr = e2;
          } else {
            insErr = e1;
          }
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
