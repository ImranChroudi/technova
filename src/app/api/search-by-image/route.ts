import { NextRequest, NextResponse } from "next/server";
import { generateImageEmbedding } from "@/lib/ai/image-embeddings";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Invalid image or image too large (max 5MB)" }, { status: 400 });
    }

    const embedding = await generateImageEmbedding(file);

    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc("search_similar_images", {
      query_embedding: embedding,
      match_count: 12,
    });

    if (error) throw error;

    // Fetch full product details for matched product_ids
    const ids = (data ?? []).map((r: any) => r.product_id);
    if (ids.length === 0) return NextResponse.json({ products: [], matches: [] });

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .in("product_id", ids);

    const byId = new Map((products ?? []).map((p: any) => [p.product_id, p]));
    const result = (data ?? [])
      .map((r: any) => ({ ...byId.get(r.product_id), similarity: r.similarity }))
      .filter((p: any) => p.product_id && (p.similarity ?? 0) >= 0.8);

    return NextResponse.json({ products: result, matches: data });
  } catch (error: any) {
    console.error("search-by-image error:", error);
    return NextResponse.json({ error: error?.message || "Image search failed" }, { status: 500 });
  }
}
